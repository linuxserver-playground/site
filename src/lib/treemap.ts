/**
 * qdirstat-style treemap layout for the file explorer: squarified tiles nested several levels deep,
 * laid out with d3-hierarchy's `treemapSquarify`, stopping where tiles would fall under a few pixels.
 * Browser-safe, no React.
 */
import { treemapSquarify } from 'd3-hierarchy';
import type { TreeNode } from './explorer';

/** Smallest tile that is drawn; below this a directory's children are not laid out. */
export const MIN_TILE = 6;
/** Height of a directory's label strip (its `paddingOuter` at the top) when the tile is tall enough. */
export const STRIP = 16;
/** Padding around a directory's children (left, right and bottom; the top gets the strip). */
export const PAD_OUTER = 2;
/** Gap between sibling tiles. */
export const PAD_INNER = 1;
/** Hard cap on the tiles of one layout, so a pathological table never freezes the tab. */
export const MAX_TILES = 6000;

export interface Tile {
  /** The node drawn here; for an aggregate it is a synthetic node whose `children` are the folded siblings. */
  node: TreeNode;
  /** 1 = direct child of the focus. */
  depth: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** True when the tile carries a label strip and its children are drawn inside it. */
  open: boolean;
  /** Set on the "N more files" tile that folds the siblings too small to draw. */
  more?: { count: number; files: number; size: number };
  /** Narrower or shorter than MIN_TILE: drawn as a sliver so areas add up, but not labelled or focusable. */
  thin?: boolean;
  parent?: TreeNode;
}

interface SquarifyNode {
  value: number;
  data: TreeNode;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/**
 * Lays out `focus`'s descendants into `width` x `height`. Each directory gets its own squarified layout of
 * the children that would cover at least MIN_TILE² pixels; the rest are folded into one aggregate tile so
 * every byte stays on the map. Recursion stops once a tile is too small for children or for a strip.
 */
export function layoutTiles(focus: TreeNode, width: number, height: number): Tile[] {
  const tiles: Tile[] = [];
  const place = (node: TreeNode, depth: number, x0: number, y0: number, x1: number, y1: number, parent?: TreeNode) => {
    if (tiles.length >= MAX_TILES) return;
    const w = x1 - x0;
    const h = y1 - y0;
    const children = node.children ?? [];
    const canOpen = children.length > 0 && node.size > 0 && w >= 2 * MIN_TILE + 2 * PAD_OUTER && h >= STRIP + MIN_TILE + PAD_OUTER;
    let tile: Tile | undefined;
    if (depth > 0) {
      tile = { node, depth, x0, y0, x1, y1, open: false, parent };
      tiles.push(tile);
    }
    if (!canOpen) return;
    // The focus fills the whole canvas; everything below it gets a strip and padding.
    const ix0 = depth > 0 ? x0 + PAD_OUTER : x0;
    const iy0 = depth > 0 ? y0 + STRIP : y0;
    const ix1 = depth > 0 ? x1 - PAD_OUTER : x1;
    const iy1 = depth > 0 ? y1 - PAD_OUTER : y1;
    const iw = ix1 - ix0;
    const ih = iy1 - iy0;
    if (iw < MIN_TILE || ih < MIN_TILE) return;
    if (tile) tile.open = true;

    // Children whose share of the inner area is at least MIN_TILE² get a tile; the rest fold into one.
    const minValue = (node.size * MIN_TILE * MIN_TILE) / (iw * ih);
    const shown: TreeNode[] = [];
    const rest: TreeNode[] = [];
    for (const c of children) (c.size >= minValue || c.size === 0 ? shown : rest).push(c);
    // Zero-byte entries (empty files) cannot be drawn by area; they ride along in the aggregate count.
    const empties = shown.filter((c) => c.size === 0);
    const drawn = shown.filter((c) => c.size > 0);
    const folded = [...rest, ...empties];
    let more: Tile['more'] | undefined;
    let moreNode: TreeNode | undefined;
    if (folded.length === 1 && folded[0].size > 0) drawn.push(folded[0]);
    else if (folded.length > 0) {
      const size = folded.reduce((a, c) => a + c.size, 0);
      const files = folded.reduce((a, c) => a + c.files, 0);
      if (size > 0) {
        more = { count: folded.length, files, size };
        moreNode = { name: `${files.toLocaleString('en-GB')} more files`, path: `${node.path === '/' ? '' : node.path}/…`, kind: 'dir', size, files, layer: node.layer, pkg: node.pkg, children: folded };
        drawn.push(moreNode);
      }
    }
    if (!drawn.length) return;

    const fake = { value: drawn.reduce((a, c) => a + c.size, 0), children: drawn.map<SquarifyNode>((c) => ({ value: c.size, data: c, x0: 0, y0: 0, x1: 0, y1: 0 })) };
    treemapSquarify(fake as never, ix0, iy0, ix1, iy1);
    for (const c of fake.children) {
      // paddingInner: half a gap on each side.
      const cx0 = Math.round(c.x0 + PAD_INNER / 2);
      const cy0 = Math.round(c.y0 + PAD_INNER / 2);
      const cx1 = Math.round(c.x1 - PAD_INNER / 2);
      const cy1 = Math.round(c.y1 - PAD_INNER / 2);
      if (cx1 - cx0 < 1 || cy1 - cy0 < 1) continue;
      if (c.data === moreNode) {
        tiles.push({ node: c.data, depth: depth + 1, x0: cx0, y0: cy0, x1: cx1, y1: cy1, open: false, more, thin: cx1 - cx0 < MIN_TILE || cy1 - cy0 < MIN_TILE, parent: node });
        continue;
      }
      if (cx1 - cx0 < MIN_TILE || cy1 - cy0 < MIN_TILE) {
        tiles.push({ node: c.data, depth: depth + 1, x0: cx0, y0: cy0, x1: cx1, y1: cy1, open: false, thin: true, parent: node });
        continue;
      }
      place(c.data, depth + 1, cx0, cy0, cx1, cy1, node);
    }
  };
  place(focus, 0, 0, 0, width, height);
  return tiles;
}

/** Characters of monospace text that fit in `w` pixels at `fontSize`, roughly (Geist Mono is 0.6em wide). */
export function fitChars(w: number, fontSize: number): number {
  return Math.max(0, Math.floor(w / (fontSize * 0.62)));
}

/** Ellipsises `s` to `max` characters, keeping the end for paths and the start for names. */
export function ellipsise(s: string, max: number, keep: 'start' | 'end' = 'start'): string {
  if (s.length <= max) return s;
  if (max <= 1) return max === 1 ? '…' : '';
  return keep === 'start' ? s.slice(0, max - 1) + '…' : '…' + s.slice(s.length - max + 1);
}
