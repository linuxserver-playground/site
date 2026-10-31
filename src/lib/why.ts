/**
 * Why a build exists, in words a user can read: what started the run (build.json `reason`), what moved between
 * it and the previous release of the branch (the diff's upstream, base, Dockerfile and package changes, and the
 * repository commits with who made them and what they touched), and how much of the package change came with the
 * base image. Browser-safe: the static build page and the live one compute it the same way from the same documents.
 */
import type { Bundle, CommitArea, CommitEntry, Diff, EcosystemDiff } from './hub';
export const baseRefOf = (image: string) => image.split('@', 1)[0].replace(/^.*\//, '');

/** The base build this one moved to, with the diffs of every base build between the previous base digest and it
 * (newest last): what the base brought in, whichever of its builds brought it. */
export interface BaseBuilds {
  image: string;
  tag: string;
  /** Site path of the base build's page. */
  url: string;
  diffs: (Diff | null)[];
}

export interface BaseAttribution {
  image: string;
  tag: string;
  url: string;
  /** Package changes of this build (on `arch`) that the base builds' own diffs carry too, and the total. */
  matched: number;
  total: number;
  arch: string;
}

export interface Explanation {
  /** One sentence: what started the run. */
  headline: string;
  /** What changed, one sentence each, in the order a reader wants them. */
  details: string[];
  /** The base build this one moved to, when the base changed and the site holds it; rendered as a link. */
  base: BaseAttribution | null;
  /** The commits since the previous release, oldest first; empty when the record lists none. */
  commits: CommitEntry[];
  /** How many of them are the pipeline's own. */
  botCommits: number;
  /** The compare page on GitHub, when the commits differ. */
  compareUrl: string | null;
  /** True when the record carries the commit list (contracts 1.15); false for older builds. */
  hasCommits: boolean;
}

const AREA_NAMES: Record<CommitArea, string> = {
  manifest: 'image.yml',
  dockerfile: 'the Dockerfiles',
  root: 'root/',
  generated: 'generated files (README, AGENTS.md, workflows)',
  packages: 'the package table',
  other: 'other files',
};
const IMAGE_AREAS: CommitArea[] = ['manifest', 'dockerfile', 'root'];
const AREA_ORDER: CommitArea[] = ['manifest', 'dockerfile', 'root', 'generated', 'packages', 'other'];

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
const list = (items: string[]) => (items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`);
const shortRef = baseRefOf;

/** Every package change of a diff on one architecture, as comparable strings. */
function changeKeys(packages: Record<string, EcosystemDiff> | undefined): Set<string> {
  const keys = new Set<string>();
  for (const [eco, d] of Object.entries(packages ?? {})) {
    for (const kind of ['added', 'removed', 'upgraded', 'downgraded'] as const) {
      for (const c of d[kind]) keys.add(`${eco}\u0000${kind}\u0000${c.name}\u0000${c.from ?? c.version ?? ''}\u0000${c.to ?? ''}`);
    }
  }
  return keys;
}

/** The architecture the sentences count on: amd64 when the diff has it, else the first. */
function mainArch(diff: Diff): string | null {
  const arches = Object.keys(diff.packages ?? {});
  return arches.includes('amd64') ? 'amd64' : (arches[0] ?? null);
}

/** The base's builds between the previous base digest (exclusive) and the one this build moved to (inclusive),
 * oldest first: the same branch's builds by creation time. When the previous base build is not held any more,
 * the base builds made since the previous build of this image (`since`), else only the one moved to. */
export function baseBuildsBetween<T extends { tag: string; branch: string; created: string; index_digest?: string | null }>(builds: T[], fromDigest: string | null | undefined, to: T, since?: string | null): T[] {
  const branch = builds.filter((b) => b.branch === to.branch).sort((a, b) => a.created.localeCompare(b.created));
  const end = branch.findIndex((b) => b.tag === to.tag);
  if (end < 0) return [to];
  const start = fromDigest ? branch.findIndex((b) => b.index_digest && b.index_digest === fromDigest) : -1;
  if (start >= 0 && start < end) return branch.slice(start + 1, end + 1).slice(-10);
  if (since) {
    const after = branch.slice(0, end + 1).filter((b) => b.created > since);
    if (after.length) return after.slice(-10);
  }
  return [to];
}

/** How many of this build's package changes (on its main architecture) the base builds' diffs carry too: the
 * same package moving between the same versions. */
export function attributeToBase(diff: Diff, base: BaseBuilds): BaseAttribution | null {
  const arch = mainArch(diff);
  if (!arch || !diff.packages) return null;
  const mine = changeKeys(diff.packages[arch]);
  const theirs = new Set<string>();
  for (const d of base.diffs) for (const k of changeKeys(d?.packages?.[arch])) theirs.add(k);
  let matched = 0;
  for (const k of mine) if (theirs.has(k)) matched += 1;
  return { image: base.image, tag: base.tag, url: base.url, matched, total: mine.size, arch };
}

function headline(b: Bundle, diff: Diff | null): string {
  const upstreamChanged = diff?.upstream.changed ?? false;
  const to = diff?.upstream.to ?? b.version.upstream;
  switch (b.reason) {
    case 'packages':
      return diff && diff.totals && Object.values(diff.totals).some((n) => n > 0)
        ? 'Released by the weekly package check: the packages installed in the image had changed.'
        : 'Released by the weekly package check.';
    case 'upstream':
      return upstreamChanged ? `Built for a new upstream version: ${diff!.upstream.from ?? '?'} → ${to}.` : `Dispatched by the hourly upstream check; the upstream version is still ${to}.`;
    case 'push':
      return `Built from a push to ${b.branch}.`;
    case 'rebuild':
      return 'A rebuild: the release check found the branch head without a release, or a maintainer asked for one.';
    case 'manual':
      return 'Dispatched by hand.';
    case 'pull_request':
      return 'A pull request build.';
    default:
      return `Built (reason "${b.reason}").`;
  }
}

/** The sentence about the commits since the previous release, from the record's list and areas. */
function commitSentence(diff: Diff): string | null {
  const c = diff.commit;
  if (!c?.changed) return null;
  const n = c.count ?? c.commits?.length ?? 0;
  if (!c.commits || n === 0) return `The repository moved from ${c.from?.slice(0, 7) ?? '?'} to ${c.to?.slice(0, 7) ?? '?'}.`;
  const bots = c.commits.filter((x) => x.bot).length;
  const people = c.commits.length - bots;
  const areas = AREA_ORDER.filter((a) => (c.areas?.[a] ?? 0) > 0);
  const since = diff.previous_tag ? ` since ${diff.previous_tag}` : '';
  let who: string;
  if (people === 0 && !c.truncated) who = n === 1 ? "The one commit" + since + " is the pipeline's own" : `All ${n} commits${since} are the pipeline's own`;
  else if (bots === 0) who = `${plural(n, 'commit')}${since}`;
  else who = `${plural(n, 'commit')}${since} (${plural(people, 'person’s')}, ${bots} the pipeline's own)`;
  if (c.truncated) return `${who}; GitHub listed only part of the range.`;
  if (!areas.length) return `${who}.`;
  const reaches = areas.filter((a) => IMAGE_AREAS.includes(a));
  if (!reaches.length) return `${who}, touching only ${list(areas.map((a) => AREA_NAMES[a]))}: nothing that reaches the image.`;
  return `${who}, changing ${list(areas.map((a) => AREA_NAMES[a]))}.`;
}

function packageSentence(diff: Diff, base: BaseAttribution | null, baseChanged: boolean): string | null {
  const arches = Object.keys(diff.packages ?? {});
  if (!arches.length) return null;
  const counts = (arch: string) => {
    const d = diff.packages![arch];
    const t = { upgraded: 0, added: 0, removed: 0, downgraded: 0 };
    for (const eco of Object.values(d)) for (const kind of Object.keys(t) as (keyof typeof t)[]) t[kind] += eco[kind].length;
    return t;
  };
  const words = (t: ReturnType<typeof counts>) =>
    [t.upgraded ? `${t.upgraded} upgraded` : '', t.added ? `${t.added} added` : '', t.removed ? `${t.removed} removed` : '', t.downgraded ? `${t.downgraded} downgraded` : ''].filter(Boolean).join(', ');
  const per = arches.map((a) => ({ arch: a, text: words(counts(a)) }));
  if (per.every((x) => !x.text)) return 'No package changed.';
  const same = per.every((x) => x.text === per[0].text);
  let s = same ? `Packages: ${per[0].text}${arches.length > 1 ? ` (the same on ${list(arches)})` : ''}.` : `Packages: ${per.map((x) => `${x.arch} ${x.text || 'none'}`).join('; ')}.`;
  if (base && base.total > 0) {
    if (base.matched === base.total) s += ' All of them came with the base image update.';
    else if (base.matched > 0) s += ` ${base.matched} of ${base.total} came with the base image update.`;
    else if (baseChanged) s += ' None of them came with the base image update.';
  }
  return s;
}

/** The explanation of a build. `base` is the base build this one moved to, with the diffs of the base builds in
 * between, when the base changed and the site holds them. */
export function explainBuild(b: Bundle, diff: Diff | null, base: BaseBuilds | null = null): Explanation {
  const commits = diff?.commit?.commits ?? [];
  const botCommits = commits.filter((c) => c.bot).length;
  const out: Explanation = { headline: headline(b, diff), details: [], base: null, commits, botCommits, compareUrl: diff?.commit?.compare_url ?? null, hasCommits: !!diff?.commit?.commits };
  if (!diff) {
    out.details.push('No comparison with a previous build is available.');
    return out;
  }
  if (diff.classification === 'initial') {
    out.details.push(`The first build of ${diff.branch} the hub has seen; there is nothing to compare it with.`);
    return out;
  }
  if (diff.upstream.changed && b.reason !== 'upstream') out.details.push(`The upstream version moved from ${diff.upstream.from ?? '?'} to ${diff.upstream.to}.`);
  if (diff.base.changed) {
    out.base = base ? (attributeToBase(diff, base) ?? { image: base.image, tag: base.tag, url: base.url, matched: 0, total: 0, arch: '' }) : null;
    if (!out.base) out.details.push(`The base image ${shortRef(diff.base.to.image)} was rebuilt (its digest changed).`);
  }
  if (Object.values(diff.dockerfile).some(Boolean)) out.details.push('The Dockerfile changed.');
  const commitLine = commitSentence(diff);
  if (commitLine) out.details.push(commitLine);
  else if (diff.commit && !diff.commit.changed) out.details.push(`Built from the same commit as ${diff.previous_tag ?? 'the previous release'}.`);
  const pkgs = packageSentence(diff, out.base, diff.base.changed);
  if (pkgs) out.details.push(pkgs);
  if (diff.classification === 'none') out.details.push('Nothing observable changed: the same inputs, rebuilt.');
  return out;
}
