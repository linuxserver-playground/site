/**
 * Browser-safe helpers for the explorer islands: fetching the hub's gzipped file tables, building the
 * layer → directory → file hierarchy, package colours and small formatters. No astro:* imports here.
 */
import type { Arch, FileEntry, Layer } from './hub';

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

/**
 * Stable hue per package name. Chroma and lightness are fixed so every swatch keeps the same contrast
 * against the dark and light surfaces; "unowned" is a neutral grey.
 */
export function pkgColor(purl: string | undefined, { dark = true } = {}): string {
  if (!purl) return dark ? 'oklch(0.42 0.01 280)' : 'oklch(0.82 0.01 280)';
  let h = 0;
  const name = purlName(purl);
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = h % 360;
  return dark ? `oklch(0.58 0.12 ${hue})` : `oklch(0.72 0.11 ${hue})`;
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
