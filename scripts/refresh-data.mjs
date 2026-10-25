#!/usr/bin/env node
/**
 * Refreshes the data snapshots in src/data/ that the site is built from. The only image data source is
 * the hub's static API (https://linuxserver-playground.github.io/hub/):
 *
 *   hub.json              where the data came from, when, and the hub's own status endpoint
 *   catalog.json          every image in full (ImageDetail: config, snippets, releases, links)
 *   images/<name>.json    per image: retained builds and release history, proxy conf, kubernetes, quadlet
 *   builds/<image>/<tag>.json   per retained build: the bundle record, its diff, its layer tables and its tests.json
 *   control.json          the run ids the control plane knows, so /fleet/runs/<id>/ pages exist for them
 *   categories.json       categories with their images
 *   mods.json             the mods index
 *   stores.json           every store URL with its one-line how-to
 *   fleet.json            base images and staleness
 *   packages.json         the package index (name, slug, types, image count)
 *   team.json             public members of the GitHub org
 *   backers.json          Open Collective totals
 *   stats.json            the headline numbers shown around the site
 *
 * The build only ever reads these files, so it is deterministic and works offline. CI runs this before
 * every deploy (see .github/workflows/deploy.yml). Heavy per-build data (files.<arch>.json.gz, package
 * tables) is never snapshotted; the explorer islands fetch it from the hub in the browser.
 *
 * Usage: node scripts/refresh-data.mjs [--local <path to a hub checkout>] [--skip-github]
 *
 *   HUB_URL       the hub's public URL (default https://linuxserver-playground.github.io/hub). Always used
 *                 for links; also the data source unless --local is given.
 *   --local       read dist/ (the API) and out/ (stores, build reports) from a hub checkout on disk.
 *   GITHUB_ORG    org whose public members are the team (default linuxserver-playground).
 *   GITHUB_TOKEN  avoids GitHub rate limits.
 *   --skip-github keep the existing team.json and avatars.
 *   PUBLIC_CONTROL_URL  the control plane (default https://ci.thelamer.duckdns.org:8443); only its run ids are
 *                 snapshotted, everything else on the fleet pages is fetched live in the browser.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? null : (args[i + 1] ?? true);
};
const localHub = flag('--local');
const skipGithub = args.includes('--skip-github');

export const DEFAULT_HUB_URL = 'https://linuxserver-playground.github.io/hub';
const HUB_URL = (process.env.HUB_URL ?? DEFAULT_HUB_URL).replace(/\/+$/, '');
const GITHUB_ORG = process.env.GITHUB_ORG ?? 'linuxserver-playground';
const CONTROL_URL = (process.env.PUBLIC_CONTROL_URL ?? 'https://ci.thelamer.duckdns.org:8443').replace(/\/+$/, '');
const UA = { 'User-Agent': 'linuxserver-playground-site-build (+https://linuxserver-playground.github.io/site/)' };

const dataDir = new URL('../src/data/', import.meta.url);
const out = (name) => new URL(name, dataDir);
const write = (name, data) => {
  const url = out(name);
  mkdirSync(new URL('./', url), { recursive: true });
  writeFileSync(url, JSON.stringify(data, null, 1) + '\n');
  console.log(`  wrote src/data/${name}`);
};

// ---------------------------------------------------------------- hub reader
class NotFound extends Error {}

async function fetchRaw(url, { retries = 4, headers = {} } = {}) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { ...UA, ...headers } });
    if (res.ok) return res;
    if (res.status === 404) throw new NotFound(`404 for ${url}`);
    if (attempt >= retries || (res.status !== 429 && res.status < 500)) {
      throw new Error(`${res.status} ${res.statusText} for ${url}`);
    }
    const wait = Number(res.headers.get('retry-after')) * 1000 || 1500 * 2 ** attempt;
    await new Promise((r) => setTimeout(r, wait));
  }
}
const getJSON = async (url, opts) => (await fetchRaw(url, opts)).json();

/** Reads one hub path (`api/v1/...`, `stores/...`, `builds/...`) as text, from disk or over HTTP. */
async function hubText(path) {
  if (localHub) {
    const root = path.startsWith('api/') || path === 'health.json' ? 'dist' : 'out';
    const file = join(localHub, root, path);
    if (!existsSync(file)) throw new NotFound(file);
    return readFileSync(file, 'utf8');
  }
  return (await fetchRaw(`${HUB_URL}/${path}`)).text();
}
const hubJSON = async (path) => JSON.parse(await hubText(path));
/** `null` instead of throwing when the hub has no such document. */
const optional = (p) =>
  p.catch((e) => {
    if (e instanceof NotFound) return null;
    throw e;
  });

async function pool(items, size, fn) {
  const results = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (i < items.length) {
        const idx = i++;
        results[idx] = await fn(items[idx], idx);
      }
    }),
  );
  return results;
}

console.log(localHub ? `hub: ${localHub} (dist/, out/)` : `hub: ${HUB_URL}`);

// ---------------------------------------------------------------- catalogue
const catalog = await hubJSON('api/v1/catalog.json');
const images = catalog.data.images;
const lastUpdated = catalog.last_updated;
write('catalog.json', { last_updated: lastUpdated, images });
write('categories.json', (await hubJSON('api/v1/categories.json')).data.categories);

// Per image: builds, proxy, kubernetes, quadlet. Start clean so rotated-out builds disappear.
for (const dir of ['images', 'builds']) rmSync(out(dir), { recursive: true, force: true });

let buildCount = 0;
await pool(images, 6, async (img) => {
  const base = `api/v1/catalog/${img.name}`;
  const [builds, proxy, kubernetes, quadlet] = await Promise.all([
    optional(hubJSON(`${base}/builds.json`)),
    img.links.proxy ? optional(hubJSON(`${base}/proxy.json`)) : null,
    img.links.kubernetes ? optional(hubText(`${base}/kubernetes.yaml`)) : null,
    img.links.quadlet ? optional(hubText(`${base}/quadlet.container`)) : null,
  ]);
  const data = builds?.data ?? { image: img.name, builds: [], history: {} };
  write(`images/${img.name}.json`, { builds: data, proxy: proxy?.data ?? null, kubernetes, quadlet });

  await pool(data.builds, 4, async (b) => {
    const tagBase = `${base}/builds/${b.tag}`;
    const [record, diff, tests, ...layers] = await Promise.all([
      hubJSON(`${tagBase}.json`),
      optional(hubJSON(`${tagBase}/diff.json`)),
      optional(hubJSON(`${tagBase}/tests.json`)),
      ...b.platforms.map((p) => optional(hubJSON(`${tagBase}/layers.${p.arch}.json`))),
    ]);
    const layerTables = {};
    b.platforms.forEach((p, i) => {
      if (layers[i]) layerTables[p.arch] = layers[i].data.layers;
    });
    write(`builds/${img.name}/${b.tag}.json`, { build: record.data.build, diff: diff?.data.diff ?? null, layers: layerTables, tests: tests?.data ?? null });
    buildCount++;
  });
});

// ---------------------------------------------------------------- fleet views
write('mods.json', (await hubJSON('api/v1/mods.json')).data);
write('stores.json', (await hubJSON('api/v1/stores/index.json')).data.stores);
write('packages.json', (await hubJSON('api/v1/packages.json')).data.packages);
const [bases, staleness] = await Promise.all([hubJSON('api/v1/fleet/bases.json'), hubJSON('api/v1/fleet/staleness.json')]);
write('fleet.json', { bases: bases.data.bases, staleness: staleness.data });
const hubStats = (await hubJSON('api/v1/stats.json')).data.stats;
const status = (await optional(hubJSON('api/v1/status.json')))?.data.status ?? null;
write('hub.json', { url: HUB_URL, source: localHub ? 'local' : 'remote', fetched: new Date().toISOString(), last_updated: lastUpdated, status });

// ---------------------------------------------------------------- control plane
// Only the run ids: the fleet pages render live from the control plane's JSON API in the browser, but a
// static site needs to know which /fleet/runs/<id>/ pages to emit. The ids of every build the hub holds are
// added at build time; a run the snapshot misses is reached through /fleet/runs/?run=<id>.
console.log(`${CONTROL_URL} …`);
let control = existsSync(out('control.json')) ? JSON.parse(readFileSync(out('control.json'), 'utf8')) : { url: CONTROL_URL, fetched: null, run_ids: [] };
try {
  const runs = await getJSON(`${CONTROL_URL}/api/runs.json`);
  const ids = new Set([...runs.active.map((r) => r.run.id), ...runs.recent.map((r) => r.id)]);
  control = { url: CONTROL_URL, fetched: new Date().toISOString(), run_ids: [...ids].sort((a, b) => b - a) };
} catch (e) {
  console.warn(`  ! control: ${e.message} (keeping the previous control.json)`);
  control = { ...control, url: CONTROL_URL };
}
write('control.json', control);

// ---------------------------------------------------------------- logos
// Copied locally so Astro can resize them to WebP and pages never hotlink GitHub.
console.log('logos …');
mkdirSync(out('../assets/logos/'), { recursive: true });
await pool(images.filter((i) => i.project_logo), 8, async (i) => {
  const ext = (i.project_logo.match(/\.(png|jpe?g|svg|webp|gif)(?:\?|$)/i)?.[1] ?? 'png').toLowerCase().replace('jpeg', 'jpg');
  const target = out(`../assets/logos/${i.name}.${ext}`);
  try {
    const res = await fetch(i.project_logo, { headers: UA });
    if (!res.ok) throw new Error(String(res.status));
    writeFileSync(target, Buffer.from(await res.arrayBuffer()));
  } catch (e) {
    if (!existsSync(target)) console.warn(`  ! logo ${i.name}: ${e.message}`);
  }
});

// ---------------------------------------------------------------- GitHub team
let team = existsSync(out('team.json')) ? JSON.parse(readFileSync(out('team.json'), 'utf8')) : [];
if (!skipGithub) {
  console.log(`api.github.com (${GITHUB_ORG}) …`);
  const ghHeaders = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
  try {
    const members = await getJSON(`https://api.github.com/orgs/${GITHUB_ORG}/members?per_page=100`, { headers: ghHeaders });
    team = await pool(
      members.filter((m) => m.type === 'User' && !/-CI$/i.test(m.login)),
      4,
      async (m) => {
        const u = await getJSON(m.url, { headers: ghHeaders }).catch(() => ({}));
        return { login: m.login, name: u.name || null, avatar: m.avatar_url, url: m.html_url };
      },
    );
    team.sort((a, b) => a.login.localeCompare(b.login, 'en', { sensitivity: 'base' }));
    mkdirSync(out('../assets/team/'), { recursive: true });
    await pool(team, 4, async (m) => {
      const res = await fetch(`${m.avatar}${m.avatar.includes('?') ? '&' : '?'}s=192`, { headers: UA });
      if (res.ok) writeFileSync(out(`../assets/team/${m.login.toLowerCase()}.png`), Buffer.from(await res.arrayBuffer()));
    });
  } catch (e) {
    console.warn(`  ! team: ${e.message} (keeping the previous team.json)`);
  }
}
write('team.json', team);

// ---------------------------------------------------------------- Open Collective
console.log('opencollective.com …');
let backers = existsSync(out('backers.json')) ? JSON.parse(readFileSync(out('backers.json'), 'utf8')) : null;
try {
  const oc = await getJSON('https://opencollective.com/linuxserver.json');
  backers = { backers: oc.backersCount, yearly_income: oc.yearlyIncome, currency: oc.currency };
} catch (e) {
  console.warn(`  ! open collective: ${e.message}${backers ? ' (keeping the previous backers.json)' : ''}`);
}
write('backers.json', backers);

// ---------------------------------------------------------------- headline stats
// Only numbers the hub (or GitHub / Open Collective) really provides. There are no pull counts.
const active = images.filter((i) => !i.deprecated);
const stats = {
  generated: new Date().toISOString(),
  last_updated: lastUpdated,
  images: hubStats.images,
  deprecated: hubStats.deprecated,
  stars: hubStats.stars,
  builds: hubStats.builds,
  retained_builds: buildCount,
  arm64: active.filter((i) => i.architectures.some((a) => a.arch === 'arm64')).length,
  readonly_supported: hubStats.readonly_supported,
  nonroot_supported: hubStats.nonroot_supported,
  updated_this_week: hubStats.updated_last_7_days,
  categories: hubStats.categories,
  since: hubStats.first_release ?? null,
  team: team.length,
  backers: backers?.backers ?? null,
};
write('stats.json', stats);
console.log(stats);
console.log(`${images.length} images, ${buildCount} builds, ${readdirSync(out('images')).length} image files`);
