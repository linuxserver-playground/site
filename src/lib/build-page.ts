/**
 * Everything a build page shows, derived from one build's record (bundle, diff, layers, tests) and the image's
 * retained builds. Browser-safe: the static page computes it at build time from the snapshots, and the live page
 * (a build newer than the site, rendered from the hub's API by the 404 fallback) computes it in the browser from
 * the same documents fetched from the hub, so both render the same thing.
 */
import { buildResult, buildUrl, reasonLabel } from './build-helpers';
import type { BuildRecord } from './builds';
import { controlBuildUrl } from './control';
import { bytes, formatDate, shortDigest, shortSha } from './format';
import { hubApi, hubPackagesUrl, hubTestsUrl, type Arch, type Bundle, type BuildSummary, type VulnSummary } from './hub';

/** The few image fields a build page needs. */
export interface BuildPageImage {
  name: string;
  /** Site path of the image page (`/images/<name>/`). */
  url: string;
  ref: string;
  github_url: string;
}

export interface Fact {
  label: string;
  value: string;
  href?: string;
  mono?: boolean;
  title?: string;
}

export interface BuildPage {
  image: BuildPageImage;
  b: Bundle;
  record: BuildRecord;
  tag: string;
  summary: BuildSummary | undefined;
  prev: BuildSummary | undefined;
  newerSameBranch: BuildSummary | undefined;
  newest: boolean;
  arches: Arch[];
  result: 'success' | 'failure' | 'partial';
  /** `files.<arch>.json.gz` on the repository's Pages (the hub's `links.files`). */
  filesUrls: Partial<Record<Arch, string[]>>;
  packagesUrls: Partial<Record<Arch, string>>;
  /** The syft document on the repository's Pages (`links.sbom`), linked when the hub has no package table. */
  sbomUrls: Partial<Record<Arch, string>>;
  /** The build's folder on the repository's Pages (`links.pages`): the CI report's files, per architecture. */
  reportDir: string | null;
  /** The build's own scan, `vulns.json` on the repository's Pages (`links.vulns`), and its counts; null without one. */
  vulnsUrl: string | null;
  vulnsSummary: VulnSummary | null;
  /** Download links on the Release: control's run record and the run's masked logs (404 for older releases). */
  runJson: string;
  logsZip: string;
  layersUrls: Partial<Record<Arch, string>>;
  packagesSummary: Partial<Record<Arch, { count: number; distro: string; by_type?: Record<string, number> | null }>>;
  crumbs: { name: string; href: string }[];
  pull: string;
  description: string;
  facts: Fact[];
  tagList: string[];
  testsPassed: number;
  testsTotal: number;
  testsFailedNames: string[];
  controlBuild: string;
  upstreamSource: string | null;
  dataLinks: { label: string; href: string }[];
}

/** `builds` is the image's retained builds, newest first; the build itself may be missing from them. */
export function buildPage(image: BuildPageImage, record: BuildRecord, builds: BuildSummary[]): BuildPage {
  const b = record.build;
  const tag = b.version.tag;
  const summary = builds.find((x) => x.tag === tag);
  const created = summary?.created ?? b.created;
  const index = builds.findIndex((x) => x.tag === tag);
  const newerSameBranch = (index >= 0 ? builds.slice(0, index) : builds.filter((x) => x.created > created))
    .reverse()
    .find((x) => x.branch === b.branch);
  const prev = builds.find((x) => x.branch === b.branch && x.created < created && x.tag !== tag);
  const newest = builds.find((x) => x.branch === b.branch)?.tag === tag || (!summary && !newerSameBranch);
  const arches = b.platforms.filter((p) => p.result === 'success').map((p) => p.arch) as Arch[];
  const result = buildResult({ platforms: b.platforms, test_success: b.test.enabled ? b.test.success : null });

  // The heavy files are on the image repository's Pages, which keeps the builds the hub holds; the hub says where
  // (`links`). Release assets are never fetched: they send no CORS headers, so they are only ever download links.
  const links = summary?.links;
  const filesUrls: Partial<Record<Arch, string[]>> = {};
  const packagesUrls: Partial<Record<Arch, string>> = {};
  const sbomUrls: Partial<Record<Arch, string>> = {};
  for (const a of arches) {
    if (links?.files[a]) filesUrls[a] = [links.files[a]!];
    if (newest) packagesUrls[a] = links?.packages[a] ?? hubPackagesUrl(image.name, tag, a);
    if (links?.sbom?.[a]) sbomUrls[a] = links.sbom[a]!;
  }
  const releaseDownload = (name: string) => `https://github.com/${b.repository}/releases/download/${tag}/${name}`;
  const runJson = links?.run_json ?? releaseDownload('run.json');
  const logsZip = links?.logs_zip ?? releaseDownload('logs.zip');
  const layersUrls = Object.fromEntries(arches.map((a) => [a, summary?.links.layers[a] ?? hubApi(`catalog/${image.name}/builds/${tag}/layers.${a}.json`)])) as Partial<Record<Arch, string>>;
  const packagesSummary = Object.fromEntries(Object.entries(b.packages ?? {}).map(([a, s]) => [a, { count: s.count, distro: s.distro, by_type: s.by_type }])) as BuildPage['packagesSummary'];

  const crumbs = [
    { name: 'Images', href: '/images/' },
    { name: image.name, href: image.url },
    { name: 'Builds', href: `${image.url}#builds` },
    { name: tag, href: buildUrl(image.name, tag) },
  ];
  const classification = summary?.classification ?? record.diff?.classification;
  const description = `Build ${tag} of ${image.name}: CI ${result}${b.test.enabled ? (b.test.success ? ', tests passed' : ', tests failed') : ''}; ${b.platforms.map((p) => `${p.arch} ${bytes(p.size)}`).join(', ')}, base ${b.base.image}, ${reasonLabel(b.reason)}${classification ? `, ${classification} change` : ''}.`;

  const facts: Fact[] = [
    { label: 'Upstream version', value: b.version.upstream, mono: true },
    { label: 'LinuxServer build', value: `ls${b.version.ls_build}`, mono: true },
    { label: 'Branch', value: `${b.branch} → :${b.version.release_tag ?? b.branch}`, mono: true },
    { label: 'Commit', value: shortSha(b.commit), href: `https://github.com/${b.repository}/commit/${b.commit}`, mono: true, title: b.commit },
    { label: 'Built', value: formatDate(b.created), title: b.created },
    { label: 'Reason', value: reasonLabel(b.reason) },
    { label: 'Base image', value: b.base.image, mono: true },
    ...(b.base.digest ? [{ label: 'Base digest', value: shortDigest(b.base.digest), mono: true, title: b.base.digest }] : []),
    ...(b.index_digest ? [{ label: 'Index digest', value: shortDigest(b.index_digest), mono: true, title: b.index_digest }] : []),
    ...(b.version.source_url ? [{ label: 'Version source', value: b.version.source ?? 'upstream', href: b.version.source_url }] : []),
    { label: 'Workflow run', value: `#${b.workflow.run_id}`, href: b.workflow.run_url, mono: true },
    { label: 'CI contract', value: `workflows@${b.workflow.workflows_ref}${b.workflow.ci_version ? ` · ci ${b.workflow.ci_version}` : ''} · bundle v${b.schema}`, mono: true },
  ];

  const testSummary = record.tests ? Object.values(record.tests.summary) : [];
  const testsPassed = testSummary.reduce((n, x) => n + x.passed, 0);
  const testsTotal = testSummary.reduce((n, x) => n + x.total, 0);
  const testsFailedNames = [...new Set(testSummary.flatMap((x) => x.failed_tests))];

  const dataLinks = [
    { label: 'Release on GitHub', href: summary?.links.release ?? `https://github.com/${b.repository}/releases/tag/${tag}` },
    { label: 'build.json', href: summary?.links.build ?? hubApi(`catalog/${image.name}/builds/${tag}.json`) },
    { label: 'diff.json', href: summary?.links.diff ?? hubApi(`catalog/${image.name}/builds/${tag}/diff.json`) },
    ...(record.tests ? [{ label: 'tests.json', href: hubTestsUrl(image.name, tag) }] : []),
    ...arches.map((a) => ({ label: `layers.${a}.json`, href: layersUrls[a]! })),
    ...arches.filter((a) => filesUrls[a]).map((a) => ({ label: `files.${a}.json.gz`, href: filesUrls[a]![0] })),
    ...arches.filter((a) => sbomUrls[a]).map((a) => ({ label: `packages.${a}.json.gz`, href: sbomUrls[a]! })),
    ...(links?.vulns ? [{ label: 'vulns.json', href: links.vulns }] : []),
    ...b.assets.filter((x) => x.url && /^package_versions\./.test(x.name)).map((x) => ({ label: x.name, href: x.url! })),
    { label: 'run.json', href: runJson },
    { label: 'logs.zip', href: logsZip },
  ];

  return {
    image,
    b,
    record,
    tag,
    summary,
    prev,
    newerSameBranch,
    newest,
    arches,
    result,
    filesUrls,
    packagesUrls,
    sbomUrls,
    reportDir: links?.pages ?? null,
    vulnsUrl: links?.vulns ?? null,
    vulnsSummary: summary?.vulnerabilities ?? null,
    runJson,
    logsZip,
    layersUrls,
    packagesSummary,
    crumbs,
    pull: `docker pull ${image.ref}:${tag}`,
    description,
    facts,
    // The tags the build pushed, from its build.json (never a registry listing); `version.tags` before contracts 1.10.
    tagList: b.published?.tags ?? summary?.tags ?? b.version.tags ?? [],
    testsPassed,
    testsTotal,
    testsFailedNames,
    controlBuild: controlBuildUrl(b.repository, b.workflow.run_id),
    upstreamSource: /^https?:\/\//.test(b.notes?.upstream_url ?? '') ? b.notes!.upstream_url! : null,
    dataLinks,
  };
}
