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
  /** `app` for an application; `base` for a base image, `tool` for an internal tool. Older snapshots omit it. */
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
  /** `files.<arch>.json.gz`: the hub's copy for the newest build of each branch, else the Release asset. */
  files: Partial<Record<Arch, string>>;
  /** The Release asset, always. */
  files_release?: Partial<Record<Arch, string>> | null;
  test_report?: string | null;
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
  classification?: Classification | null;
  links: BuildLinks;
}

export interface HistoryEntry { tag: string; created: string; release_url?: string | null }

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
  /** A `mod.yml` branch of linuxserver-playground/docker-mods. */
  source: 'playground';
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
  report_page?: string | null;
  tarball?: string | null;
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
export interface VulnMatch { package: string; version?: string | null; id: string; severity: VulnSeverity; fix_state?: string | null; fixed_in?: string | null; urls?: string[] | null; type?: string | null; arch?: string | null }
/** `/api/v1/catalog/{name}/builds/{tag}/vulns.json` `data`, when the hub serves it. */
export interface VulnsData {
  summary: { critical: number; high: number; medium: number; low: number; negligible: number; fixed: number; unfixed: number; unknown?: number };
  matches: VulnMatch[];
  db_date?: string | null;
  scanner?: string | null;
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
/** The hub's rendered CI report page for one build. */
export const hubReportUrl = (image: string, tag: string) => `${HUB_URL}/builds/${image}/${tag}/`;
export const hubHistoryUrl = (image: string) => `${HUB_URL}/builds/${image}/`;
/** The hub's copy of `files.<arch>.json.gz`, kept for the newest build of each branch. */
export const hubFilesUrl = (image: string, tag: string, arch: Arch) => `${HUB_URL}/builds/${image}/${tag}/files.${arch}.json.gz`;
export const hubPackagesUrl = (image: string, tag: string, arch: Arch) => hubApi(`catalog/${image}/builds/${tag}/packages.${arch}.json`);
export const hubPackageUrl = (slug: string) => hubApi(`packages/${slug}.json`);
export const hubStoreUrl = (path: string) => `${HUB_URL}/stores/${path.replace(/^\/+/, '')}`;

/** `tests.json`: the harness's per-arch reports with a summary, for builds that have a report. */
export const hubTestsUrl = (image: string, tag: string) => hubApi(`catalog/${image}/builds/${tag}/tests.json`);
/** `vulns.json`: the scanner's findings, when the hub serves them. */
export const hubVulnsUrl = (image: string, tag: string) => hubApi(`catalog/${image}/builds/${tag}/vulns.json`);
/** A file the hub unpacked from `test.<arch>.tar.gz`: `index.html`, `screenshot.png`, `container.log`, `browser.log`, `sysinfo.txt`, `package_diff.txt`. */
export const hubReportFileUrl = (image: string, tag: string, arch: Arch | string, file: string) => `${HUB_URL}/builds/${image}/${tag}/${arch}/${file}`;

/** The control plane: live status, the scheduler and member actions. The fleet pages read its JSON API (lib/control.ts). */
export { CONTROL_URL, controlImageUrl } from './control';
