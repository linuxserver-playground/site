/**
 * Browser-safe helpers for the explorer islands: fetching the hub's gzipped file tables, building the
 * layer → directory → file hierarchy, package colours and small formatters. No astro:* imports here.
 */
import type { Arch, FileEntry, InitUnit, Layer } from './hub';

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

/** Loads `files.<arch>.json.gz`, trying the hub's copy first and the Release asset after. */
export async function loadFiles(urls: string[], signal?: AbortSignal): Promise<FileEntry[]> {
  let last: unknown;
  for (const url of urls) {
    try {
      const data = await fetchMaybeGzipJSON<FileEntry[] | { files: FileEntry[] }>(url, signal);
      return Array.isArray(data) ? data : data.files;
    } catch (e) {
      last = e;
      if (signal?.aborted) throw e;
    }
  }
  throw last instanceof Error ? last : new Error('Could not load the file table');
}

// ---------------------------------------------------------------- hierarchy

export interface TreeNode {
  name: string;
  /** Full path for directories/files, "layer N" for layer nodes. */
  path: string;
  kind: 'root' | 'layer' | 'dir' | 'file';
  /** Deduplicated bytes below this node. */
  size: number;
  /** Number of files below this node. */
  files: number;
  layer?: number;
  /** Owning package (purl) for a file; the dominant package for a directory. */
  pkg?: string;
  children?: TreeNode[];
  entry?: FileEntry;
}

/** "pkg:apk/alpine/musl@1.2.6-r3?arch=x86_64" -> "musl 1.2.6-r3" */
export function purlLabel(purl: string | undefined): string {
  if (!purl) return 'unowned';
  const m = purl.match(/^pkg:([^/]+)\/(?:.*\/)?([^@?]+)(?:@([^?]+))?/);
  if (!m) return purl;
  return m[3] ? `${m[2]} ${m[3]}` : m[2];
}
export function purlName(purl: string | undefined): string {
  if (!purl) return 'unowned';
  const m = purl.match(/^pkg:([^/]+)\/(?:.*\/)?([^@?]+)/);
  return m ? m[2] : purl;
}
export function purlType(purl: string | undefined): string {
  const m = purl?.match(/^pkg:([^/]+)\//);
  return m ? m[1] : '';
}

/**
 * Builds layer → directory → file. Only regular files carry bytes; directories, symlinks and the rest
 * count as entries without size. Hardlinks are already deduplicated upstream.
 */
export function buildTree(files: FileEntry[], layers: Layer[]): TreeNode {
  const root: TreeNode = { name: 'image', path: '/', kind: 'root', size: 0, files: 0, children: [] };
  const layerNodes = new Map<number, TreeNode>();
  const layerFor = (i: number) => {
    let n = layerNodes.get(i);
    if (!n) {
      const l = layers[i];
      n = { name: `layer ${i}`, path: `layer ${i}`, kind: 'layer', size: 0, files: 0, layer: i, children: [], pkg: l?.created_by ?? undefined };
      layerNodes.set(i, n);
      root.children!.push(n);
    }
    return n;
  };
  for (const f of files) {
    if (f.type !== 'file') continue;
    const size = f.size ?? 0;
    const parts = f.path.split('/').filter(Boolean);
    let node = layerFor(f.layer);
    node.size += size;
    node.files++;
    root.size += size;
    root.files++;
    let acc = '';
    for (let i = 0; i < parts.length - 1; i++) {
      acc += '/' + parts[i];
      let child = node.children!.find((c) => c.name === parts[i] && c.kind === 'dir');
      if (!child) {
        child = { name: parts[i], path: acc, kind: 'dir', size: 0, files: 0, layer: f.layer, children: [] };
        node.children!.push(child);
      }
      child.size += size;
      child.files++;
      node = child;
    }
    node.children!.push({ name: parts[parts.length - 1] ?? f.path, path: f.path, kind: 'file', size, files: 1, layer: f.layer, pkg: f.package, entry: f });
  }
  // Dominant package per directory: the owner of most bytes below it.
  const dominant = (n: TreeNode): Map<string, number> => {
    const m = new Map<string, number>();
    if (n.kind === 'file') {
      m.set(n.pkg ?? '', n.size);
      return m;
    }
    for (const c of n.children ?? []) for (const [k, v] of dominant(c)) m.set(k, (m.get(k) ?? 0) + v);
    let best = '';
    let bestV = -1;
    for (const [k, v] of m) if (v > bestV) (best = k), (bestV = v);
    if (n.kind !== 'layer') n.pkg = best || undefined;
    return m;
  };
  dominant(root);
  const sortRec = (n: TreeNode) => {
    n.children?.sort((a, b) => b.size - a.size || a.name.localeCompare(b.name));
    n.children?.forEach(sortRec);
  };
  sortRec(root);
  root.children!.sort((a, b) => (a.layer ?? 0) - (b.layer ?? 0));
  return root;
}

/** Bytes per package purl (files only), largest first. */
export function packageTotals(files: FileEntry[]): { pkg: string | undefined; size: number; files: number }[] {
  const m = new Map<string | undefined, { size: number; files: number }>();
  for (const f of files) {
    if (f.type !== 'file') continue;
    const cur = m.get(f.package) ?? { size: 0, files: 0 };
    cur.size += f.size ?? 0;
    cur.files++;
    m.set(f.package, cur);
  }
  return [...m].map(([pkg, v]) => ({ pkg, ...v })).sort((a, b) => b.size - a.size);
}

// ---------------------------------------------------------------- colours

/** Stable hue (0-359) per package name; `undefined` (unowned) has no hue. */
export function pkgHue(purl: string | undefined): number | undefined {
  if (!purl) return undefined;
  let h = 0;
  for (const ch of purlName(purl)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 360;
}

/**
 * Stable hue per package name. Chroma and lightness are fixed so every swatch keeps the same contrast
 * against the dark and light surfaces; "unowned" is a neutral grey. `depth` is the treemap's nesting
 * cue: each level shifts lightness a little (lighter on dark, darker on light) so nesting reads without
 * changing the hue; `muted` lowers chroma for directory tiles so files stand out inside them.
 */
export function pkgColor(purl: string | undefined, opts: { dark?: boolean; depth?: number; muted?: boolean } = {}): string {
  return pkgTone(purl, opts).fill;
}

/** The fill of a tile plus the ink that keeps a label readable on it (white on dark fills, near-black on light). */
export function pkgTone(purl: string | undefined, { dark = true, depth = 0, muted = false } = {}): { fill: string; ink: string; l: number } {
  const hue = pkgHue(purl);
  const step = Math.min(depth, 6) * 0.03;
  const l = hue === undefined ? (dark ? 0.36 + step : 0.86 - step) : dark ? 0.52 + step : 0.74 - step;
  const c = hue === undefined ? 0.01 : muted ? 0.045 : dark ? 0.12 : 0.11;
  return { fill: `oklch(${l.toFixed(3)} ${c} ${hue ?? 280})`, ink: l > 0.62 ? '#0e0b18' : '#ffffff', l };
}

/** Fill for layer tiles: a neutral violet tint, shifted by depth like the package colours. */
export function layerColor({ dark = true } = {}): string {
  return dark ? 'oklch(0.3 0.03 290)' : 'oklch(0.93 0.02 290)';
}

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
