#!/usr/bin/env node
/**
 * Drives the website editor (/edit/) in Chromium against a fake control plane, from a local preview:
 *
 *   node scripts/editor-check.mjs http://localhost:4321/site [outDir]
 *
 * The control plane's editor routes (control/editor.py) are answered here from an in-memory site repo, so
 * every state can be reached without a GitHub token: signed out, not authorised, the home screen, a new
 * post, typing with the live preview, an image added, a save (and the request it sends), a conflict, the
 * pull request and a discard. Each state gets axe (WCAG A to AAA, light and dark) at 1280px and a 390px
 * overflow check, and a screenshot in outDir. Exits non-zero on any failure.
 */
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const [base, outDir = 'out/editor-check'] = process.argv.slice(2);
if (!base) {
  console.error('usage: node scripts/editor-check.mjs <baseUrl> [outDir]');
  process.exit(1);
}
const CONTROL = (process.env.PUBLIC_CONTROL_URL ?? 'https://ci.thelamer.duckdns.org:8443').replace(/\/+$/, '');
const DOC = 'src/content/docs/general/swag.md';
/** A signed-in session always has a GitHub avatar; it is answered with the same 1×1 PNG as the repo's images. */
const AVATAR = 'https://avatars.githubusercontent.com/u/1';
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
mkdirSync(outDir, { recursive: true });

/** The fake: who is signed in, whether the editor is authorised, and the repo's branches. */
function fakeControl() {
  const state = {
    me: { authenticated: true, login: 'octocat', avatar_url: AVATAR, member: true, checked_at: new Date().toISOString(), csrf: 'csrf-1' },
    authorized: true,
    files: { main: { [DOC]: '---\ntitle: SWAG setup\ndescription: Reverse proxy with SWAG.\nsection: general\n---\n\nOld body.\n' } },
    heads: { main: 'c0' },
    saves: [],
    pulls: [],
    conflictNext: false,
  };
  const entry = (path) => {
    const key = path.startsWith('src/content/docs/') ? `docs/${path.slice(17, -3)}` : `posts/${path.split('/')[3]}`;
    const branch = `edit/octocat/${key}`;
    const onBranch = branch in state.heads;
    const ref = onBranch ? branch : 'main';
    const content = state.files[ref]?.[path];
    const pull = state.pulls.find((p) => p.branch === branch && p.open) ?? null;
    return {
      path,
      kind: path.includes('/docs/') ? 'doc' : 'post',
      key,
      exists: content !== undefined,
      published: state.files.main[path] !== undefined,
      content: content ?? '',
      branch,
      on_branch: onBranch,
      base: 'main',
      head: state.heads[ref],
      images: [],
      raw_base: `https://raw.githubusercontent.com/linuxserver-playground/site/${state.heads[ref]}/${path.replace(/\/[^/]+$/, '')}/`,
      pull,
    };
  };
  const answer = (req) => {
    const url = new URL(req.url());
    const p = url.pathname;
    if (p === '/api/me') return [200, state.me];
    if (p === '/api/editor/status') {
      const edits = state.pulls.filter((x) => x.open);
      return [200, { authenticated: state.me.authenticated, member: state.me.member, login: state.me.login, authorized: state.authorized, can_push: true, repo: 'linuxserver-playground/site', base: 'main', edits }];
    }
    if (!state.authorized) return [428, { detail: 'authorise the editor first' }];
    if (p === '/api/editor/entry') return [200, entry(url.searchParams.get('path'))];
    const body = req.postDataJSON?.() ?? {};
    if (req.headers()['x-csrf-token'] !== state.me.csrf) return [403, { detail: 'bad CSRF token' }];
    const e = entry(body.path);
    if (p === '/api/editor/save') {
      if (state.conflictNext) {
        state.conflictNext = false;
        return [409, { detail: `${e.branch} moved since you loaded it (saved elsewhere?); reload to see it` }];
      }
      state.saves.push(body);
      const head = `c${state.saves.length}`;
      state.files[e.branch] = { ...(state.files[e.on_branch ? e.branch : 'main'] ?? {}), [body.path]: body.content };
      state.heads[e.branch] = head;
      return [200, { ok: true, action_id: state.saves.length, detail: `saved ${e.key}`, branch: e.branch, head, commit_url: `https://github.com/x/commit/${head}` }];
    }
    if (p === '/api/editor/publish') {
      const pull = { number: state.pulls.length + 1, title: `Add the post "${body.title}"`, url: 'https://github.com/x/pull/1', branch: e.branch, path: body.path, draft: false, checks: 'pending', updated_at: new Date().toISOString(), open: true };
      state.pulls.push(pull);
      return [200, { ok: true, action_id: 9, detail: 'opened', pull }];
    }
    if (p === '/api/editor/discard') {
      for (const x of state.pulls) if (x.branch === e.branch) x.open = false;
      delete state.heads[e.branch];
      return [200, { ok: true, action_id: 10, detail: 'discarded' }];
    }
    return [404, { detail: `no fake for ${p}` }];
  };
  return { state, answer };
}

const browser = await chromium.launch();
let failures = 0;
const fail = (msg) => {
  failures++;
  console.error(`FAIL ${msg}`);
};

async function context(fake, scheme = 'light', width = 1280) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme });
  await ctx.route(`${CONTROL}/**`, async (route) => {
    const req = route.request();
    const origin = req.headers()['origin'] ?? new URL(base).origin;
    const cors = { 'access-control-allow-origin': origin, 'access-control-allow-credentials': 'true', 'access-control-allow-headers': 'Content-Type, X-CSRF-Token', 'access-control-allow-methods': 'GET, POST, OPTIONS' };
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    if (req.url().endsWith('/api/stream')) return route.abort();
    const [status, body] = fake.answer(req);
    route.fulfill({ status, headers: { ...cors, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  });
  // Raw images of the fake repo and the avatar do not exist; answer them with a 1×1 PNG.
  for (const host of ['https://raw.githubusercontent.com/**', 'https://avatars.githubusercontent.com/**']) {
    await ctx.route(host, (route) => route.fulfill({ status: 200, contentType: 'image/png', body: PNG }));
  }
  const page = await ctx.newPage();
  page.on('pageerror', (e) => fail(`page error: ${e.message}`));
  return { ctx, page };
}

async function audit(page, name) {
  for (const scheme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: scheme });
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    for (const v of r.violations) fail(`${name} (${scheme}): ${v.id}: ${v.help} — ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  }
  await page.emulateMedia({ colorScheme: 'light' });
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: false });
  const width = page.viewportSize().width;
  await page.setViewportSize({ width: 390, height: 844 });
  const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
  if (scroll > 390) fail(`${name}: scroll width ${scroll} at 390px`);
  await page.screenshot({ path: `${outDir}/${name}-390.png`, fullPage: false });
  await page.setViewportSize({ width, height: 900 });
  console.log(`ok ${name}`);
}

const open = async (page, query = '') => {
  await page.goto(`${base}/edit/${query}`, { waitUntil: 'networkidle' });
};

// Signed out, then not authorised.
{
  const fake = fakeControl();
  fake.state.me = { authenticated: false, login: null, avatar_url: null, member: false, checked_at: null, csrf: null };
  const { ctx, page } = await context(fake);
  await open(page);
  if (!(await page.getByRole('heading', { name: 'Sign in to edit' }).isVisible())) fail('signed out: no sign-in prompt');
  await audit(page, 'signed-out');
  fake.state.me = { authenticated: true, login: 'octocat', avatar_url: AVATAR, member: true, checked_at: null, csrf: 'csrf-1' };
  fake.state.authorized = false;
  await open(page);
  const link = page.getByRole('link', { name: 'Authorise on GitHub' });
  if (!(await link.isVisible())) fail('unauthorised: no authorise link');
  else if (!(await link.getAttribute('href')).startsWith(`${CONTROL}/edit/authorize?next=`)) fail('unauthorised: authorise link goes elsewhere');
  await audit(page, 'unauthorised');
  await ctx.close();
}

// Home, a new post, typing, an image, save, conflict, pull request, discard.
{
  const fake = fakeControl();
  const { ctx, page } = await context(fake);
  await open(page);
  await page.getByRole('heading', { name: 'Edit a page or post' }).waitFor();
  await page.getByPlaceholder('Find by title').fill('swag');
  await audit(page, 'home');

  await open(page, '?new=post');
  await page.getByLabel('Title').fill('Webtop 7 is here');
  if ((await page.getByLabel('Address').inputValue()) !== 'webtop-7-is-here') fail('new post: slug not derived from the title');
  await audit(page, 'new-post');
  await page.getByRole('button', { name: 'Start writing' }).click();
  await page.waitForURL(/\?post=webtop-7-is-here&title=/);
  await page.locator('.cm-content').waitFor();
  const preview = page.getByRole('region', { name: 'Preview' });
  await preview.getByText('Webtop 7 is here').first().waitFor();

  await page.locator('.cm-content').click();
  await page.keyboard.press('Control+End');
  await page.keyboard.type('\n> [!TIP]\n> Use **compose**.\n');
  await preview.locator('.callout[data-callout="tip"]').waitFor({ timeout: 5000 }).catch(() => fail('preview: callout not rendered'));
  await page.locator('input[type=file]').setInputFiles({ name: 'Hero Shot.PNG', mimeType: 'image/png', buffer: PNG });
  await preview.locator('img[src^="blob:"]').waitFor({ timeout: 5000 }).catch(() => fail('preview: the new image does not show'));
  await audit(page, 'writing');

  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByText(/Saved to edit\/octocat\/posts\/webtop-7-is-here/).waitFor({ timeout: 5000 }).catch(() => fail('save: no confirmation'));
  const saved = fake.state.saves[0];
  if (!saved) fail('save: nothing was posted');
  else {
    if (saved.head !== 'c0') fail(`save: sent head ${saved.head}, expected c0`);
    if (!saved.content.includes('Use **compose**.')) fail('save: the typed text is missing');
    if (saved.assets?.[0]?.name !== 'hero-shot.png') fail(`save: image named ${saved.assets?.[0]?.name}`);
    if (!saved.content.includes('\n\n![hero shot](./hero-shot.png)')) fail('save: the image is not its own paragraph in the Markdown');
  }

  // A second save after the branch moved elsewhere: a conflict, the text kept.
  await page.locator('.cm-content').click();
  await page.keyboard.type('More.');
  fake.state.conflictNext = true;
  await page.keyboard.press('Control+s');
  await page.getByRole('button', { name: 'Reload the entry' }).waitFor({ timeout: 5000 }).catch(() => fail('conflict: no reload offer'));
  await audit(page, 'conflict');
  await page.getByRole('button', { name: 'Reload the entry' }).click();
  await page.getByRole('button', { name: 'Restore it' }).waitFor({ timeout: 5000 }).catch(() => fail('conflict: the kept text is not offered back'));
  await page.getByRole('button', { name: 'Restore it' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByText(/^Saved to/).waitFor({ timeout: 5000 }).catch(() => fail('save after restore: no confirmation'));
  if (fake.state.saves.length !== 2 || fake.state.saves[1].head !== 'c1') fail(`save after restore: ${JSON.stringify(fake.state.saves.map((s) => s.head))}`);

  await page.getByRole('button', { name: 'Open pull request' }).click();
  await page.getByText(/Pull request #1 is open/).waitFor({ timeout: 5000 }).catch(() => fail('publish: no pull request shown'));
  await audit(page, 'published');

  await page.getByRole('button', { name: 'Discard' }).click();
  await page.getByRole('button', { name: 'Discard the edit' }).click();
  await page.getByText(/The edit is discarded/).waitFor({ timeout: 5000 }).catch(() => fail('discard: no confirmation'));
  if (fake.state.pulls[0]?.open) fail('discard: the pull request is still open');

  // An existing page: front matter checked as it is typed.
  await open(page, '?doc=general/swag');
  await page.locator('.cm-content').waitFor();
  await preview.getByText('SWAG setup').first().waitFor();
  await page.locator('.cm-content').click();
  await page.keyboard.press('Control+Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('End');
  await page.keyboard.type('x');
  await page.getByText(/section must be general/).waitFor({ timeout: 5000 }).catch(() => fail('front matter: a wrong section is not reported'));
  await audit(page, 'doc-problem');
  await ctx.close();
}

await browser.close();
if (failures) {
  console.error(`${failures} failure(s)`);
  process.exit(1);
}
console.log('editor check passed');
