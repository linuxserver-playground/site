/**
 * Browser-safe helpers for the explorer islands: fetching the hub's gzipped file trees, building the
 * directory → file hierarchy, file-kind colours and small formatters. No astro:* imports here.
 */
import type { Arch, FileEntry, FileNode, FileTree, InitUnit, Layer } from './hub';

export const fmtBytes = (n: number | null | undefined, digits = 1): string => {
  if (n === null || n === undefined) return '–';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let v = n;
  let u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u++;
  }
  return `${u === 0 ? v : v.toFixed(v >= 100 ? 0 : digits)} ${units[u]}`;
};

export const fmtDelta = (n: number | null | undefined): string => {
  if (n === null || n === undefined) return '–';
  if (n === 0) return '±0';
  return `${n > 0 ? '+' : '−'}${fmtBytes(Math.abs(n))}`;
};

export const pct = (part: number, total: number) => (total ? `${((part / total) * 100).toFixed(part / total < 0.1 ? 1 : 0)}%` : '0%');

/**
 * Fetches a JSON document that may be gzipped on the wire without `Content-Encoding` (GitHub Pages serves
 * `.json.gz` as `application/gzip`). Uses DecompressionStream when the body starts with the gzip magic.
 */
export async function fetchMaybeGzipJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, mode: 'cors' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  if (bytes.length > 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) {
    if (typeof DecompressionStream === 'undefined') throw new Error('This browser cannot decompress gzip in JavaScript.');
    const stream = new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'));
    return new Response(stream).json() as Promise<T>;
  }
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

/**
 * Loads `files.<arch>.json.gz`, trying the hub's copy first and the Release asset after. Current builds hold
 * dumper's nested tree (`lsio-files/1`); releases from before it hold the flat syft-derived table, which is
 * turned into the same tree so one code path draws both.
 */
export async function loadFiles(urls: string[], signal?: AbortSignal): Promise<FileNode> {
  let last: unknown;
  for (const url of urls) {
    try {
      const data = await fetchMaybeGzipJSON<FileTree | FileEntry[] | { files: FileEntry[] }>(url, signal);
      if (!Array.isArray(data) && 'tree' in data) return data.tree;
      return legacyTree(Array.isArray(data) ? data : data.files);
    } catch (e) {
      last = e;
      if (signal?.aborted) throw e;
    }
  }
  throw last instanceof Error ? last : new Error('Could not load the file table');
}

/** The legacy flat table as a dumper-style tree. Only regular files are kept: they are all the treemap draws. */
export function legacyTree(entries: FileEntry[]): FileNode {
  const root: FileNode = { n: '', c: [] };
  const dirs = new Map<string, FileNode>([['', root]]);
  const dirFor = (path: string): FileNode => {
    const known = dirs.get(path);
    if (known) return known;
    const cut = path.lastIndexOf('/');
    const node: FileNode = { n: path.slice(cut + 1), c: [] };
    dirFor(path.slice(0, cut)).c!.push(node);
    dirs.set(path, node);
    return node;
  };
  for (const e of entries) {
    if (e.type !== 'file') continue;
    const cut = e.path.lastIndexOf('/');
    const file: FileNode = { n: e.path.slice(cut + 1) };
    if (e.size) file.s = e.size;
    const mode = e.mode ? parseInt(e.mode, 8) & 0o7777 : e.executable ? 0o755 : 0o644;
    if (mode !== 0o644) file.m = mode;
    dirFor(e.path.slice(0, cut)).c!.push(file);
  }
  return root;
}

// ---------------------------------------------------------------- hierarchy

export interface TreeNode {
  name: string;
  /** Full path. */
  path: string;
  kind: 'root' | 'dir' | 'file';
  /** Bytes of the regular files below this node (hardlinks counted once). */
  size: number;
  /** Number of regular files below this node. */
  files: number;
  /** FILE_KINDS key of a file; for a directory, the kind holding most of its bytes. */
  cat: string;
  /** Permission bits, uid and gid of a file, when not the defaults. */
  mode?: number;
  uid?: number;
  gid?: number;
  children?: TreeNode[];
}

/**
 * What a file is, for its colour: by extension, then by the executable bit. Hues are fixed so every swatch keeps
 * the same contrast; `other` is a neutral grey.
 */
export const FILE_KINDS: { key: string; label: string; hue?: number; test?: RegExp }[] = [
  { key: 'library', label: 'libraries', hue: 265, test: /\.so(\.[\w.-]+)?$|\.(a|la)$/ },
  { key: 'image', label: 'images and icons', hue: 150, test: /\.(png|svgz?|jpe?g|gif|ico|xpm|webp|bmp|icns|tiff?)$/ },
  { key: 'font', label: 'fonts', hue: 200, test: /\.(ttf|otf|ttc|woff2?|pcf(\.gz)?|pfb|afm|bdf)$/ },
  { key: 'translation', label: 'translations', hue: 95, test: /\.(mo|qm|po|gmo)$/ },
  { key: 'archive', label: 'archives', hue: 55, test: /\.(gz|xz|zst|bz2|lz4|zip|tar|tgz|7z|deb|apk|whl|jar)$/ },
  { key: 'code', label: 'scripts and source', hue: 330, test: /\.(py[cod]?|js|mjs|cjs|ts|map|pl|pm|rb|php|lua|sh|qml|class|h|hpp|c)$/ },
  { key: 'executable', label: 'executables', hue: 25 },
  { key: 'other', label: 'other files' },
];
const KIND_BY_KEY = new Map(FILE_KINDS.map((k) => [k.key, k]));

export function fileKind(name: string, mode = 0o644): string {
  const lower = name.toLowerCase();
  for (const k of FILE_KINDS) if (k.test?.test(lower)) return k.key;
  return mode & 0o111 ? 'executable' : 'other';
}

export const kindLabel = (key: string | undefined): string => KIND_BY_KEY.get(key ?? '')?.label ?? 'other files';

/** "0755" */
export const fmtMode = (mode: number): string => mode.toString(8).padStart(4, '0');

/**
 * Builds directory → file from the dumper tree. Only regular files carry bytes; symlinks, hardlinks (counted at
 * their first path), special files and directories without files are left out of the map.
 */
export function buildTree(tree: FileNode): TreeNode {
  const walk = (node: FileNode, path: string, isRoot: boolean): [TreeNode, Map<string, number>] | null => {
    if (!node.c) {
      if (node.l !== undefined || node.h !== undefined || node.t !== undefined) return null;
      const size = node.s ?? 0;
      const mode = node.m ?? 0o644;
      const cat = fileKind(node.n, mode);
      const file: TreeNode = { name: node.n, path, kind: 'file', size, files: 1, cat };
      if (node.m !== undefined) file.mode = node.m;
      if (node.u !== undefined) file.uid = node.u;
      if (node.g !== undefined) file.gid = node.g;
      return [file, new Map([[cat, size]])];
    }
    const children: TreeNode[] = [];
    const bytes = new Map<string, number>();
    let size = 0;
    let files = 0;
    for (const c of node.c) {
      const got = walk(c, `${path === '/' ? '' : path}/${c.n}`, false);
      if (!got) continue;
      children.push(got[0]);
      size += got[0].size;
      files += got[0].files;
      for (const [k, v] of got[1]) bytes.set(k, (bytes.get(k) ?? 0) + v);
    }
    if (!files && !isRoot) return null;
    let cat = 'other';
    let best = -1;
    for (const [k, v] of bytes) if (v > best) (cat = k), (best = v);
    children.sort((a, b) => b.size - a.size || a.name.localeCompare(b.name));
    return [{ name: isRoot ? 'image' : node.n, path, kind: isRoot ? 'root' : 'dir', size, files, cat, children }, bytes];
  };
  return walk(tree, '/', true)![0];
}

/** Bytes per file kind, largest first. */
export function kindTotals(root: TreeNode): { cat: string; size: number; files: number }[] {
  const m = new Map<string, { size: number; files: number }>();
  const visit = (n: TreeNode) => {
    if (n.kind === 'file') {
      const cur = m.get(n.cat) ?? { size: 0, files: 0 };
      cur.size += n.size;
      cur.files++;
      m.set(n.cat, cur);
    } else n.children?.forEach(visit);
  };
  visit(root);
  return [...m].map(([cat, v]) => ({ cat, ...v })).sort((a, b) => b.size - a.size);
}

// ---------------------------------------------------------------- colours

/**
 * The fill of a tile plus the ink that keeps a label readable on it (white on dark fills, near-black on light).
 * Chroma and lightness are fixed per kind so every swatch keeps the same contrast against the dark and light
 * surfaces. `depth` is the treemap's nesting cue: each level shifts lightness a little (lighter on dark, darker
 * on light) so nesting reads without changing the hue; `muted` lowers chroma for directory tiles so files stand
 * out inside them.
 */
export function kindTone(cat: string | undefined, { dark = true, depth = 0, muted = false } = {}): { fill: string; ink: string; l: number } {
  const hue = KIND_BY_KEY.get(cat ?? '')?.hue;
  const step = Math.min(depth, 6) * 0.03;
  const l = hue === undefined ? (dark ? 0.36 + step : 0.86 - step) : dark ? 0.52 + step : 0.74 - step;
  const c = hue === undefined ? 0.01 : muted ? 0.045 : dark ? 0.12 : 0.11;
  return { fill: `oklch(${l.toFixed(3)} ${c} ${hue ?? 280})`, ink: l > 0.62 ? '#0e0b18' : '#ffffff', l };
}

export const kindColor = (cat: string | undefined, opts: { dark?: boolean; depth?: number; muted?: boolean } = {}): string => kindTone(cat, opts).fill;

export const SOURCE_COLOR: Record<string, string> = {
  base: 'var(--raft-violet)',
  image: 'var(--primary)',
  mod: 'var(--raft-ok)',
};

export const ARCHES: Arch[] = ['amd64', 'arm64'];

/** True when the visitor prefers reduced motion (SSR: false). */
export const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Which Dockerfile line range a layer came from: provenance when present, else a text search for the
 * instruction. Base image layers (flagged `from_base`, or whose instruction is not in this Dockerfile)
 * return null; the Dockerfile view attributes them to FROM.
 */
export function layerLines(layer: Layer, dockerfile: string): [number, number] | null {
  if (layer.from_base) return null;
  if (layer.dockerfile_lines) return layer.dockerfile_lines;
  const created = layer.created_by ?? '';
  const lines = dockerfile.split('\n');
  // "RUN |3 A=… /bin/sh -c echo …" → instruction keyword and the first meaningful token after it
  const m = created.match(/^(FROM|RUN|COPY|ADD|ENV|ARG|LABEL|EXPOSE|VOLUME|WORKDIR|USER|ENTRYPOINT|CMD|HEALTHCHECK|SHELL|STOPSIGNAL|ONBUILD)\b\s*(.*)$/i);
  if (!m) return null;
  const kw = m[1].toUpperCase();
  const body = m[2].replace(/^\|\d+\s+(?:\S+=\S*\s+)*\/bin\/sh -c\s*/, '').replace(/^#\(nop\)\s*/, '').trim();
  const token = body.split(/\s+/).find((t) => t && !/^--/.test(t)) ?? '';
  const starts = lines.map((l, i) => (new RegExp(`^${kw}\\b`, 'i').test(l) ? i : -1)).filter((i) => i >= 0);
  if (!starts.length) return null;
  const needle = token.replace(/^\/root\/?$/, 'root/').slice(0, 40);
  const start = starts.find((i) => {
    const end = instructionEnd(lines, i);
    const text = lines.slice(i, end + 1).join(' ');
    return needle ? text.includes(needle) : true;
  });
  if (start === undefined) return null;
  return [start + 1, instructionEnd(lines, start) + 1];
}

/** "RUN |3 BUILD_DATE=… /bin/sh -c echo …" -> "RUN echo …" */
export function tidyInstruction(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(/^RUN \|\d+\s+(?:\S+=\S*\s+)*\/bin\/sh -c\s*/, 'RUN ')
    .replace(/^\/bin\/sh -c #\(nop\)\s*/, '')
    .replace(/^\/bin\/sh -c\s*/, 'RUN ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface LayerAttribution {
  layer: Layer;
  /** Dockerfile line range (1-based, inclusive) of the instruction that produced the layer; null for base image layers. */
  lines: [number, number] | null;
}

/**
 * Which Dockerfile instruction each layer of the table came from. Provenance (`dockerfile_lines`) wins, and
 * when the hub attributed some layers the ones it left out are the base image's. Without any provenance the
 * final stage's layer-producing instructions (RUN, COPY, ADD) are matched to the tail of the table in order,
 * which is how a single-stage build lays its layers over the base; the text match (`layerLines`) is the
 * last resort when the counts disagree.
 */
export function attributeLayers(layers: Layer[], dockerfile: string): LayerAttribution[] {
  if (layers.some((l) => l.dockerfile_lines)) return layers.map((l) => ({ layer: l, lines: l.from_base ? null : (l.dockerfile_lines ?? null) }));
  const ins = parseInstructions(dockerfile);
  const lastFrom = ins.map((i) => i.keyword).lastIndexOf('FROM');
  const producing = ins.slice(lastFrom + 1).filter((i) => /^(RUN|COPY|ADD)$/.test(i.keyword));
  const own = layers.filter((l) => !l.from_base && !l.empty);
  if (producing.length && producing.length <= own.length) {
    const tail = own.slice(own.length - producing.length);
    return layers.map((l) => {
      const k = tail.indexOf(l);
      return { layer: l, lines: k >= 0 ? [producing[k].start, producing[k].end] : l.empty ? layerLines(l, dockerfile) : null };
    });
  }
  return layers.map((l) => ({ layer: l, lines: layerLines(l, dockerfile) }));
}

/** Last line (0-based) of the instruction that starts at `i`, following trailing backslashes. */
export function instructionEnd(lines: string[], i: number): number {
  let j = i;
  while (j < lines.length - 1 && /\\\s*$/.test(lines[j])) j++;
  return j;
}

/** Splits a Dockerfile into instructions with their line ranges (1-based, inclusive). */
export function parseInstructions(dockerfile: string): { keyword: string; text: string; start: number; end: number }[] {
  const lines = dockerfile.split('\n');
  const out: { keyword: string; text: string; start: number; end: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || /^\s*#/.test(line)) continue;
    const kw = line.match(/^\s*([A-Za-z]+)\b/);
    if (!kw) continue;
    const end = instructionEnd(lines, i);
    out.push({ keyword: kw[1].toUpperCase(), text: lines.slice(i, end + 1).join('\n'), start: i + 1, end: end + 1 });
    i = end;
  }
  return out;
}

// ---------------------------------------------------------------- init graph

export interface InitStages {
  /** Units per stage: stage 0 has no dependencies, stage n waits for something in stage n-1. */
  stages: InitUnit[][];
  stageOf: Map<string, number>;
  /** Names depended on that the bundle does not list (an s6 bundle such as `legacy-services`). */
  missing: Set<string>;
}

/**
 * Topological stages of the s6-rc graph: a unit's stage is the longest dependency path below it, so the
 * stages read left to right as the order things can start. Dependencies the bundle does not list count as
 * already up (stage -1) and are reported in `missing`.
 */
export function initStages(units: InitUnit[]): InitStages {
  const byName = new Map(units.map((u) => [u.name, u]));
  const stageOf = new Map<string, number>();
  const missing = new Set<string>();
  const visiting = new Set<string>();
  const depth = (name: string): number => {
    const u = byName.get(name);
    if (!u) {
      missing.add(name);
      return -1;
    }
    if (stageOf.has(name)) return stageOf.get(name)!;
    if (visiting.has(name)) return 0; // cycle guard
    visiting.add(name);
    const d = u.depends_on.length ? Math.max(-1, ...u.depends_on.map(depth)) + 1 : 0;
    visiting.delete(name);
    stageOf.set(name, d);
    return d;
  };
  for (const u of units) depth(u.name);
  const stages: InitUnit[][] = [];
  for (const u of units) (stages[stageOf.get(u.name)!] ??= []).push(u);
  for (let i = 0; i < stages.length; i++) stages[i] ??= [];
  const rank = (u: InitUnit) => (u.source === 'image' ? 0 : u.source === 'mod' ? 1 : 2);
  for (const s of stages) s.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  return { stages, stageOf, missing };
}
