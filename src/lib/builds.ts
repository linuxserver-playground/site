/**
 * Builds, from the per-image and per-build snapshots (src/data/images/<name>.json and
 * src/data/builds/<image>/<tag>.json), written by `npm run data` from the hub's builds endpoints.
 */
import type { Arch, Bundle, BuildSummary, BuildsData, Classification, Diff, HistoryEntry, Layer, ProxyData, TestsData } from './hub';

export interface ImageExtras {
  builds: BuildsData;
  proxy: ProxyData | null;
  kubernetes: string | null;
  quadlet: string | null;
}

export interface BuildRecord {
  build: Bundle;
  diff: Diff | null;
  layers: Partial<Record<Arch, Layer[]>>;
  /** `tests.json` from the hub: the harness's reports with a summary. `null` when the build has no report. */
  tests?: TestsData | null;
}

/** Every workflow run id the hub's build records name, for the pre-rendered /fleet/runs/<id>/ pages. */
export function knownRunIds(): number[] {
  const ids = new Set<number>();
  for (const { record } of allBuildRecords()) if (record.build.workflow?.run_id) ids.add(record.build.workflow.run_id);
  return [...ids];
}

/** The build tags the site has a page for, per image, so live lists can link to them. */
export function knownBuildTags(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const { image, tag } of allBuildRecords()) (out[image] ??= []).push(tag);
  return out;
}

const extras = import.meta.glob<{ default: ImageExtras }>('/src/data/images/*.json', { eager: true });
const records = import.meta.glob<{ default: BuildRecord }>('/src/data/builds/*/*.json', { eager: true });

const EMPTY: ImageExtras = { builds: { image: '', builds: [], history: {} }, proxy: null, kubernetes: null, quadlet: null };

export const getImageExtras = (name: string): ImageExtras => extras[`/src/data/images/${name}.json`]?.default ?? { ...EMPTY, builds: { ...EMPTY.builds, image: name } };

/** Retained builds of an image, newest first. */
export const getBuilds = (name: string): BuildSummary[] => getImageExtras(name).builds.builds;
export const getHistory = (name: string): Record<string, HistoryEntry[]> => getImageExtras(name).builds.history;
export const getBuildSummary = (name: string, tag: string) => getBuilds(name).find((b) => b.tag === tag);

export const getBuildRecord = (name: string, tag: string): BuildRecord | undefined => records[`/src/data/builds/${name}/${tag}.json`]?.default;

export interface BuildRef {
  image: string;
  summary: BuildSummary;
  url: string;
}

export const buildUrl = (image: string, tag: string) => `/images/${image}/builds/${tag}/`;

/** Every retained build across the fleet, newest first. */
export function allBuilds(): BuildRef[] {
  const list: BuildRef[] = [];
  for (const [path, mod] of Object.entries(extras)) {
    const image = path.match(/\/([^/]+)\.json$/)![1];
    for (const summary of mod.default.builds.builds) list.push({ image, summary, url: buildUrl(image, summary.tag) });
  }
  return list.sort((a, b) => b.summary.created.localeCompare(a.summary.created));
}

/** Every (image, tag) pair that has a full record, for getStaticPaths. */
export function allBuildRecords(): { image: string; tag: string; record: BuildRecord }[] {
  return Object.entries(records).map(([path, mod]) => {
    const m = path.match(/\/builds\/([^/]+)\/(.+)\.json$/)!;
    return { image: m[1], tag: m[2], record: mod.default };
  });
}

/** The newest retained build of the same branch before `tag`, if the hub still holds it. */
export function previousBuild(name: string, summary: BuildSummary): BuildSummary | undefined {
  return getBuilds(name).find((b) => b.branch === summary.branch && b.created < summary.created);
}

/** Whether a build is the newest of its branch; only then does the hub keep its files.<arch>.json.gz. */
export function isNewestOfBranch(name: string, summary: BuildSummary): boolean {
  return getBuilds(name).find((b) => b.branch === summary.branch)?.tag === summary.tag;
}

export const CLASSIFICATION: Record<Classification, { label: string; desc: string }> = {
  upstream: { label: 'upstream', desc: 'The upstream version changed.' },
  packages: { label: 'packages', desc: 'Only packages changed.' },
  linuxserver: { label: 'linuxserver', desc: 'The Dockerfile or the image repository changed with the same upstream version.' },
  base: { label: 'base', desc: 'The base image digest changed.' },
  mixed: { label: 'mixed', desc: 'More than one kind of change.' },
  none: { label: 'identical', desc: 'An identical rebuild.' },
  initial: { label: 'initial', desc: 'The first build of this branch the hub has seen.' },
};

export const classify = (c?: Classification | null) => (c ? CLASSIFICATION[c] : undefined);

/** Human reason for a build: "rebuild", "upstream", "push"… as the workflow reported it. */
export const REASONS: Record<string, string> = {
  rebuild: 'scheduled rebuild',
  upstream: 'new upstream version',
  push: 'commit to the branch',
  manual: 'manual trigger',
  base: 'base image update',
  dispatch: 'scheduler dispatch',
};
export const reasonLabel = (r: string) => REASONS[r] ?? r;

/** Result over all platforms: success when every one succeeded. */
export function buildResult(summary: Pick<BuildSummary, 'platforms' | 'test_success'>): 'success' | 'failure' | 'partial' {
  const ok = summary.platforms.filter((p) => p.result === 'success').length;
  if (ok === summary.platforms.length && summary.test_success !== false) return 'success';
  if (ok === 0) return 'failure';
  return summary.test_success === false ? 'failure' : 'partial';
}
