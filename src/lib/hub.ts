/**
 * Shapes served by the hub's static API (lsio_hub/models.py in linuxserver-playground/hub) and the URL
 * helpers for everything the site links to or fetches from it. Browser-safe: no astro:* imports, so the
 * explorer islands can import from here too.
 */
import hub from '@/data/hub.json';

export type Arch = 'amd64' | 'arm64';

// ---------------------------------------------------------------------------------------------------
// v1 image shapes (field for field the original api.linuxserver.io response)

export interface EnvVar { name: string; value: string; desc: string; optional: boolean }
export interface Volume { path: string; host_path: string; desc: string; optional: boolean }
export interface Port { external: string; internal: string; desc: string; optional: boolean }
export interface Device { path: string; host_path: string; desc: string; optional: boolean }
export interface Cap { cap_add: string; desc: string; optional: boolean }
export interface SecurityOpt { run_var: string; compose_var: string; desc: string; optional: boolean }
export interface Custom { name: string; name_compose: string; value: string | string[]; desc: string; optional: boolean }

export interface ImageConfig {
  application_setup?: string | null;
  readonly_supported?: boolean | null;
  nonroot_supported?: boolean | null;
  privileged?: boolean | null;
  networking?: string | null;
  hostname?: { hostname: string; desc: string; optional: boolean } | null;
  mac_address?: { mac_address: string; desc: string; optional: boolean } | null;
  env_vars?: EnvVar[] | null;
  volumes?: Volume[] | null;
  ports?: Port[] | null;
  custom?: Custom[] | null;
  security_opt?: SecurityOpt[] | null;
  devices?: Device[] | null;
  caps?: Cap[] | null;
}

export interface ReleaseInfo {
  branch: string;
  release_tag: string;
  channel: string;
  tag?: string | null;
  upstream_version?: string | null;
  created?: string | null;
  release_url?: string | null;
  test_success?: boolean | null;
  base?: string | null;
  platforms: string[];
}

export interface ImageLinks {
  builds: string;
  docs: string;
  proxy?: string | null;
  kubernetes?: string | null;
  quadlet?: string | null;
  mods: string;
}

/** `/api/v1/catalog/{name}.json`: an image with everything the hub knows about it. */
export type ImageKind = 'app' | 'base' | 'tool';

export interface ImageDetail {
  name: string;
  initial_date?: string | null;
  github_url: string;
  project_url?: string | null;
  project_logo?: string | null;
  /** Markdown; may contain links. */
  description: string;
  /** Release tag of the newest `latest` build (`<upstream>-ls<N>`), or `latest` before the first build. */
  version: string;
  /** `YYYY-MM-DD HH:MM:SS+00:00` */
  version_timestamp: string;
  category: string;
  stable: boolean;
  deprecated: boolean;
  stars: number;
  tags: { tag: string; desc: string }[];
  architectures: { arch: string; tag: string }[];
  changelog?: { date: string; desc: string }[] | null;
  config: ImageConfig;
  title: string;
  /** The upstream project's donation pages (`upstream.sponsor` in the manifest), up to 3. Older snapshots omit it. */
  sponsor?: { name: string; url: string }[];
  /** `app` for an application; `base` for a base image, `tool` for a run-once or helper image. Older snapshots omit it. */
  kind?: ImageKind;
  categories: string[];
  deprecation_message?: string | null;
  setup_instructions?: string | null;
  archived: boolean;
  release_url?: string | null;
  upstream_version?: string | null;
  base?: string | null;
  releases: ReleaseInfo[];
  docs_url: string;
  registries: { ghcr: string; packages_url: string };
  snippets: { docker_compose: string; docker_run: string };
  links: ImageLinks;
}

export interface Category { name: string; slug: string; count: number; images: string[] }

// ---------------------------------------------------------------------------------------------------
// Builds

export interface BuildBase { family: string; image: string; digest?: string | null; build_version?: string | null }

export interface PlatformBuild {
  arch: Arch;
  result: 'success' | 'failure' | 'cancelled' | 'skipped';
  digest?: string | null;
  /** Sum of compressed layer sizes in bytes. */
  size?: number | null;
  uncompressed_size?: number | null;
  layers?: number | null;
  runner?: string | null;
  build_seconds?: number | null;
}

export interface BuildLinks {
  build: string;
  diff: string;
  layers: Partial<Record<Arch, string>>;
  packages: Partial<Record<Arch, string>>;
  release?: string | null;
  /**
   * The build's folder on its image repository's GitHub Pages, with a trailing slash: the heavy files of the newest
   * five builds per branch (the builds the hub holds), served with `access-control-allow-origin: *`. Holds
   * `files.<arch>.json.gz`, `packages.<arch>.json.gz`, `vulns.json` and each architecture's unpacked test report
   * under `<arch>/` (`REPORT_FILES`). Absent in snapshots taken before the hub linked it.
   */
  pages?: string | null;
  /** `files.<arch>.json.gz` on the repository's Pages (gzip served as application/gzip). */
  files: Partial<Record<Arch, string>>;
  /** `packages.<arch>.json.gz`, the build's syft document, on the repository's Pages. */
  sbom?: Partial<Record<Arch, string>> | null;
  /** `run.json` on the Release: a download link only (Release assets send no CORS headers). 404 for older releases. */
  run_json?: string | null;
  /** `logs.zip` on the Release, the run's masked logs: a download link only. 404 for older releases. */
  logs_zip?: string | null;
  /** The build's page on this site (the hub's retired report pages redirect here); the site does not link it. */
  test_report?: string | null;
  /**
   * `vulns.json`, the scan the build made of itself when it was released (`VulnsData`), on the repository's Pages:
   * fetched in the browser only, never at site build time. Absent for builds without a scan. Older snapshots point at
   * the hub's API copy, which the hub no longer serves.
   */
  vulns?: string | null;
}

export type Classification = 'upstream' | 'packages' | 'linuxserver' | 'base' | 'mixed' | 'none' | 'initial';

/** One entry of `/api/v1/catalog/{name}/builds.json`. */
export interface BuildSummary {
  tag: string;
  branch: string;
  release_tag?: string | null;
  upstream_version: string;
  semver?: string | null;
  ls_build: number;
  created: string;
  reason: string;
  commit: string;
  test_success?: boolean | null;
  base: BuildBase;
  platforms: PlatformBuild[];
  /** The digest of the build's multi-arch index: what an image built on this one records as `base.digest`. Absent in
   * snapshots taken before the hub listed it and for releases that predate the field. */
  index_digest?: string | null;
  /** Every tag the build published (build.json `published.tags`, or `version.tags` before that field). */
  tags?: string[] | null;
  classification?: Classification | null;
  /** Counts of the build's own scan, made when it was built; the findings are `links.vulns`. */
  vulnerabilities?: VulnSummary | null;
  links: BuildLinks;
}

/** A release of a branch, held by the hub or not. Only held ones (in `builds`) have a site page. */
export interface HistoryEntry {
  tag: string;
  created: string;
  release_url?: string | null;
  /** The workflow run that built it; absent for releases rotated out before the hub recorded it. */
  run_url?: string | null;
  /** `run.json` and `logs.zip` on the Release: download links, 404 for releases made before control attached them. */
  run_json?: string | null;
  logs_zip?: string | null;
}

export interface BuildsData {
  image: string;
  builds: BuildSummary[];
  history: Record<string, HistoryEntry[]>;
}

export interface InitUnit {
  name: string;
  type: 'oneshot' | 'longrun' | 'bundle' | string;
  depends_on: string[];
  source?: 'base' | 'image' | 'mod' | null;
  script?: string | null;
}

/** `build.json` as attached to the Release (schemas/bundle.schema.json in the builder). */
export interface Bundle {
  schema: number;
  image: string;
  repository: string;
  branch: string;
  mode: 'live' | 'dev' | 'pr';
  pull_request?: number | null;
  version: {
    upstream: string;
    upstream_clean: string;
    semver?: string | null;
    ls_build: number;
    tag: string;
    release_tag?: string | null;
    tags?: string[] | null;
    source?: string | null;
    source_url?: string | null;
  };
  commit: string;
  created: string;
  reason: string;
  previous?: { tag?: string | null; release_url?: string | null } | null;
  base: BuildBase;
  platforms: PlatformBuild[];
  index_digest?: string | null;
  /** What the publish job pushed: the image and every tag it created (contracts 1.10; absent before). */
  published?: { image: string; tags: string[] } | null;
  labels: Record<string, string>;
  config: {
    env?: string[] | null;
    exposed_ports?: string[] | null;
    volumes?: string[] | null;
    entrypoint?: string[] | null;
    cmd?: string[] | null;
    user?: string | null;
    working_dir?: string | null;
  };
  dockerfile: Partial<Record<Arch, string>>;
  init_graph?: { d2?: string | null; units?: InitUnit[] | null } | null;
  packages?: Record<string, { count: number; distro: string; hash: string; by_type?: Record<string, number> | null }> | null;
  test: { enabled: boolean; success: boolean; per_arch?: Record<string, boolean> | null; report_url?: string | null };
  notes?: { linuxserver?: string | null; upstream?: string | null; upstream_url?: string | null } | null;
  assets: { name: string; size: number; sha256: string; url?: string | null }[];
  workflow: { run_id: number; run_url: string; workflows_ref: string; ci_version?: string | null };
}

export interface Layer {
  index: number;
  digest: string;
  diff_id?: string | null;
  /** Compressed bytes. */
  size: number;
  uncompressed_size?: number | null;
  /** The Dockerfile instruction. */
  created_by?: string | null;
  /** [start, end] line numbers from provenance. */
  dockerfile_lines?: [number, number] | null;
  from_base?: boolean | null;
  empty?: boolean | null;
}

export interface PackageChange { name: string; version?: string | null; from?: string | null; to?: string | null; purl?: string | null }
export interface EcosystemDiff { added: PackageChange[]; removed: PackageChange[]; upgraded: PackageChange[]; downgraded: PackageChange[] }

export interface Diff {
  image: string;
  branch: string;
  tag: string;
  previous_tag?: string | null;
  classification: Classification;
  reasons: string[];
  upstream: { from?: string | null; to?: string | null; changed: boolean };
  base: { from?: BuildBase | null; to: BuildBase; changed: boolean };
  size: Record<string, { from?: number | null; to?: number | null; delta?: number | null }>;
  config: {
    env: { added: string[]; removed: string[]; changed: { name: string; from?: string | null; to?: string | null }[] };
    exposed_ports: { added: string[]; removed: string[] };
    volumes: { added: string[]; removed: string[] };
  };
  /** Unified diff per architecture; empty when unchanged. */
  dockerfile: Record<string, string>;
  packages?: Record<string, Record<string, EcosystemDiff>> | null;
  totals: { added: number; removed: number; upgraded: number; downgraded: number };
}

/**
 * One entry of `files.<arch>.json.gz` (bundle.schema.json `$defs/file_node`), as dumper writes it: short keys,
 * defaults left out. A directory has `c`, a symlink `l`, a hardlink `h`, a special file `t`; anything else is a
 * regular file of `s` bytes (0 when left out). `m` is the permission bits (default 0o755 for directories, 0o644
 * otherwise), `u`/`g` the owner (default 0).
 */
export interface FileNode {
  n: string;
  c?: FileNode[];
  s?: number;
  l?: string;
  h?: string;
  t?: 'char' | 'block' | 'fifo' | 'socket';
  m?: number;
  u?: number;
  g?: number;
}

/** `files.<arch>.json.gz` (bundle.schema.json `$defs/file_tree`). */
export interface FileTree {
  format: 'lsio-files/1';
  tree: FileNode;
}

/** One entry of the legacy `files.<arch>.json.gz` (`$defs/file_entry`), written before dumper; still read for older releases. */
export interface FileEntry {
  path: string;
  /** Index into the layer table. */
  layer: number;
  type: 'file' | 'dir' | 'symlink' | 'hardlink' | 'device' | 'other';
  size?: number;
  mode?: string;
  uid?: number;
  gid?: number;
  digest?: string;
  link_target?: string;
  /** Owning package purl when known. */
  package?: string;
  mime?: string;
  executable?: boolean;
}

export interface Package { name: string; version: string; type: string; purl?: string | null; licenses: string[] }
export interface PackagesData { image: string; tag: string; arch: Arch; count: number; packages: Package[] }

// ---------------------------------------------------------------------------------------------------
// Mods, proxy, packages index, fleet, stores

export interface Mod {
  name: string;
  target: string;
  title: string;
  summary: string;
  branch: string;
  url: string;
  image: string;
  maintainers: string[];
  platforms: string[];
  bases: string[];
  env: { name: string; description: string; default?: string | null; required: boolean }[];
  deprecated: boolean;
  deprecation_message?: string | null;
  /** The images the mod is for: its target, then the images its `mod.yml` lists under `images`. */
  applies_to: string[];
  docs?: string | null;
  /** Where the tool version the mod pins comes from (`mod.yml` `upstream`). The control plane checks it hourly and
   * builds the mod when a new version has no `<branch>-<version>` tag yet. Absent from snapshots made before. */
  upstream?: { url?: string | null; type: string; source: string } | null;
  /** What `ghcr.io/linuxserver-playground/mods` holds for the mod, one entry per version line, the default line
   * first; empty until it is published. Read hourly from the registry. Absent from snapshots made before. */
  builds?: ModBuild[];
  /** A `mod.yml` branch of linuxserver-playground/docker-mods. */
  source: 'playground';
}

/** `/api/v1/proot-apps.json`: the desktop apps the `proot-apps` CLI installs, from proot-apps' `metadata/metadata.yml`
 * without the disabled ones, by title. */
export interface ProotApp {
  /** What `proot-apps install` takes. */
  name: string;
  title: string;
  category: string;
  description: string;
  platforms: string[];
  /** The app's icon in the proot-apps repository; the site copies it to `src/assets/proot-apps/`. */
  icon?: string | null;
  /** `ghcr.io/linuxserver-playground/proot-apps:<name>` */
  image: string;
  /** The app's folder in the proot-apps repository. */
  url: string;
}

export interface ProotAppsData {
  source: string;
  /** The CLI release the install command downloads; absent until the repository has one. */
  cli?: { version: string; url: string; published_at?: string | null } | null;
  apps: ProotApp[];
}

export interface ModBuild {
  /** The version line (`mod.yml` `upstream.lines` name); null for the default line, which `:<branch>` follows. */
  line?: string | null;
  /** The upstream version built; null for a mod without one. */
  version?: string | null;
  built_at?: string | null;
  /** The exact tag of that build: `<branch>-<version>`, or `<branch>-<sha7>` for a mod without a version. */
  pin?: string | null;
  /** The floating tags that follow the line: `:<branch>` for the default line, then the line's major and minor tags. */
  tags: string[];
  digest?: string | null;
  revision?: string | null;
}

export interface ProxyData {
  image: string;
  port: number;
  scheme: string;
  subdomain?: string | null;
  subfolder?: string | null;
  /** A reference Caddyfile site block from the same proxy block. */
  caddy?: string | null;
  /** Reference Traefik labels for the image's compose service. */
  traefik?: string | null;
  base_url_note?: string | null;
  config: Record<string, unknown>;
}

export interface PackageIndexEntry { name: string; slug: string; types: string[]; images: number }
export interface PackageHolder { image: string; tag: string; branch: string; arch: Arch; version: string; type: string; purl?: string | null }
export interface PackageData { name: string; slug: string; types: string[]; versions: string[]; images: string[]; holders: PackageHolder[] }

export interface BaseUsage {
  image: string;
  family: string;
  images: string[];
  newest_digest?: string | null;
  newest_seen?: string | null;
  digests: { digest: string; first_seen: string; last_seen: string; images: string[] }[];
}

export interface StaleImage {
  image: string;
  branch: string;
  tag: string;
  built: string;
  base: string;
  base_digest?: string | null;
  newest_base_digest?: string | null;
  newest_base_built: string;
  reason: string;
}

export interface StoreEntry { platform: string; name: string; url: string; how_to: string }

/** One test of the harness's `test.<arch>.json`. */
export interface TestCase { name: string; status: 'PASS' | 'FAIL' | 'WARN' | 'SKIP' | string; message?: string | null; seconds?: number | null }

/** `test.<arch>.json` as the harness wrote it (schema 1). */
export interface TestReport {
  schema: number;
  image: string;
  tag: string;
  arch: Arch | string;
  started?: string | null;
  finished?: string | null;
  success: boolean;
  runner?: string | null;
  ci_version?: string | null;
  engine?: string | null;
  startup_seconds?: number | null;
  tests: TestCase[];
  files?: Partial<Record<'html' | 'container_log' | 'screenshot' | 'browser_log' | 'sysinfo' | 'package_diff', string>> | null;
  runtime?: { rss_bytes?: number | null; pids?: number | null; listening_tcp?: number[] | null; listening_udp?: number[] | null; s6_services?: string[] | null; changed_paths?: number | null } | null;
}

export interface TestSummary {
  success: boolean;
  passed: number;
  failed: number;
  total: number;
  failed_tests: string[];
  startup_seconds?: number | null;
  listening_ports: string[];
  warnings: number;
  rss_bytes?: number | null;
  pids?: number | null;
  /** `test.<arch>.tar.gz` on the Release: a download link only. */
  tarball?: string | null;
  /** The report's files on the repository's Pages, by kind (`screenshot`, `container_log`, ...). */
  files?: Record<string, string> | null;
}

/** `/api/v1/catalog/{name}/builds/{tag}/tests.json` `data`. */
export interface TestsData {
  image: string;
  tag: string;
  enabled: boolean;
  success: boolean | null;
  report_url?: string | null;
  summary: Record<string, TestSummary>;
  reports: Record<string, TestReport>;
}

export type VulnSeverity = 'critical' | 'high' | 'medium' | 'low' | 'negligible' | 'unknown' | string;
export interface VulnMatch {
  package: string;
  version?: string | null;
  id: string;
  severity: VulnSeverity;
  fix_state?: string | null;
  fixed_in?: string[] | string | null;
  urls?: string[] | null;
  type?: string | null;
  cvss?: number | null;
  /** The architectures the finding was made on. */
  arches?: string[] | null;
}
/** Counts over distinct findings (one per vulnerability id and package across the architectures). */
export interface VulnSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  negligible: number;
  unknown?: number;
  fixed: number;
  unfixed: number;
  wont_fix?: number;
}
/**
 * A build's `vulns.json` on its repository's Pages (CONVENTIONS §6, "Repo Pages"; `builder.derive.vulns.document`):
 * the scan it made of itself when it was released, never updated.
 */
export interface VulnsData {
  image?: string;
  tag?: string;
  summary: VulnSummary;
  by_arch?: Record<string, VulnSummary>;
  matches: VulnMatch[];
  db_date?: string | null;
  grype_version?: string | null;
  scanned_at?: string | null;
  /** How to read the counts; show them with the findings. */
  caveats?: string[];
}

export interface HubStatus {
  health: 'Success' | 'Failed';
  images: number;
  deprecated: number;
  sources: Record<string, { ok: boolean; checked_at: string; fetched_at?: string | null; error?: string | null }>;
  rejected: Record<string, { checked_at: string; release_url?: string | null; error: string }>;
}

// ---------------------------------------------------------------------------------------------------
// URLs

/** The hub's public URL, without a trailing slash (from the snapshot; `HUB_URL` at refresh time). */
export const HUB_URL: string = (hub as { url: string }).url.replace(/\/+$/, '');
export const HUB_META = hub as { url: string; source: 'local' | 'remote'; fetched: string; last_updated: string; status: HubStatus | null };

export const hubApi = (path: string) => `${HUB_URL}/api/v1/${path.replace(/^\/+/, '')}`;
export const hubPackagesUrl = (image: string, tag: string, arch: Arch) => hubApi(`catalog/${image}/builds/${tag}/packages.${arch}.json`);
export const hubPackageUrl = (slug: string) => hubApi(`packages/${slug}.json`);
export const hubStoreUrl = (path: string) => `${HUB_URL}/stores/${path.replace(/^\/+/, '')}`;

/** `tests.json`: the harness's per-arch reports with a summary, for builds that have a report. */
export const hubTestsUrl = (image: string, tag: string) => hubApi(`catalog/${image}/builds/${tag}/tests.json`);

/**
 * The files of `test.<arch>.tar.gz` as each build's repository Pages serves them under `<links.pages><arch>/`. The
 * hub links that folder (`BuildLinks.pages`); the site never derives it, so the domain can change in one place.
 */
export const REPORT_FILES = ['screenshot.png', 'container.log', 'browser.log', 'sysinfo.txt', 'package_diff.txt'] as const;
export type ReportFile = (typeof REPORT_FILES)[number];
/** A report file of one build and architecture on the repository's Pages, or null when the hub gave no folder. */
export const reportFileUrl = (pages: string | null | undefined, arch: Arch | string, file: ReportFile): string | null => (pages ? `${pages}${arch}/${file}` : null);

/** The control plane: live status, the scheduler and member actions. The fleet pages read its JSON API (lib/control.ts). */
export { CONTROL_URL, controlImageUrl } from './control';
