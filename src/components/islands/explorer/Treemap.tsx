import * as React from 'react';
import type { Arch, FileNode } from '@/lib/hub';
import { buildTree, fmtBytes, fmtMode, kindColor, kindLabel, kindTone, kindTotals, loadFiles, pct, reducedMotion, type TreeNode } from '@/lib/explorer';
import { ellipsise, fitChars, layoutTiles, MIN_TILE, STRIP, type Tile } from '@/lib/treemap';
import ArchToggle, { IslandHeader, LoadError, Loading } from './ArchToggle';
import { useFullscreen } from './Fullscreen';

interface Props {
  image: string;
  tag: string;
  arches: Arch[];
  /** Candidate URLs for files.<arch>.json.gz, tried in order (hub copy, then the Release asset). */
  urls: Partial<Record<Arch, string[]>>;
  initialArch?: Arch;
  /** Reduced height, a shorter "largest here" list and no legend: the image page's preview. */
  compact?: boolean;
}

const STRIP_FONT = 10.5;
const TILE_FONT = 10;
const MIN_LABEL_W = 34;

function useDark() {
  const [dark, setDark] = React.useState(true);
  React.useEffect(() => {
    const root = document.documentElement;
    const read = () => setDark(root.classList.contains('dark'));
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);
  return dark;
}

/**
 * Container width, kept current by a ResizeObserver. A callback ref, because the container only exists once
 * the file table has loaded; the map re-lays out whenever the width changes. Full screen, the room below the
 * container's top edge is measured too, so the map can take the viewport's height.
 */
function useWidth(fill: boolean) {
  const [width, setWidth] = React.useState(960);
  const [room, setRoom] = React.useState<number | null>(null);
  const [el, setEl] = React.useState<HTMLDivElement | null>(null);
  const ref = React.useRef<HTMLDivElement | null>(null);
  const attach = React.useCallback((node: HTMLDivElement | null) => {
    ref.current = node;
    setEl(node);
  }, []);
  React.useEffect(() => {
    if (!el) return;
    const measure = () => {
      const box = el.getBoundingClientRect();
      setWidth(Math.max(240, Math.floor(box.width)));
      setRoom(fill ? Math.floor(window.innerHeight - box.top) : null);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    if (!fill) return () => ro.disconnect();
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [el, fill]);
  return { ref, attach, width, room };
}

const isZoomable = (n: TreeNode) => n.kind !== 'file' && !!n.children?.length;

/** What a tile is, in words: shared by the tooltip, the aria-labels and the live region. */
function describe(n: TreeNode, tile: Tile | undefined, total: number): { title: string; path: string; type: string; size: string; owner: string } {
  if (tile?.more) {
    return {
      title: `${tile.more.files.toLocaleString('en-GB')} more files`,
      path: `${tile.parent?.path === '/' || !tile.parent ? '' : tile.parent.path}/ (${tile.more.count.toLocaleString('en-GB')} entries too small to draw here)`,
      type: 'aggregate',
      size: `${fmtBytes(tile.more.size)} (${pct(tile.more.size, total)} of the image)`,
      owner: tile.parent && isZoomable(tile.parent) && tile.parent.kind !== 'root' ? `zoom into ${tile.parent.name} to see them` : '',
    };
  }
  if (n.kind !== 'file') {
    return {
      title: n.name,
      path: n.path,
      type: `directory · ${n.files.toLocaleString('en-GB')} files`,
      size: `${fmtBytes(n.size)} (${pct(n.size, total)} of the image)`,
      owner: `mostly ${kindLabel(n.cat)}`,
    };
  }
  const owner = n.uid || n.gid ? ` · owner ${n.uid ?? 0}:${n.gid ?? 0}` : '';
  return {
    title: n.name,
    path: n.path,
    type: `file · mode ${fmtMode(n.mode ?? 0o644)}${owner}`,
    size: `${fmtBytes(n.size)} (${pct(n.size, total)} of the image)`,
    owner: kindLabel(n.cat),
  };
}

interface TilesProps {
  tiles: Tile[];
  dark: boolean;
  total: number;
  gradientId: string;
}

/**
 * The tiles themselves. Memoised so hover and tooltip state never re-render thousands of rects; events are
 * delegated from the <svg> through `data-i`.
 */
const Tiles = React.memo(function Tiles({ tiles, dark, total, gradientId }: TilesProps) {
  const inner = dark ? 'rgb(255 255 255 / 0.16)' : 'rgb(10 5 25 / 0.14)';
  return (
    <>
      {tiles.map((t, i) => {
        const n = t.node;
        const w = t.x1 - t.x0;
        const h = t.y1 - t.y0;
        const zoomable = !t.more && !t.thin && isZoomable(n);
        const tone = kindTone(n.cat, { dark, depth: t.depth, muted: n.kind === 'dir' });
        const d = describe(n, t, total);
        const label = [d.title, d.path && d.path !== d.title ? d.path : '', d.type, d.size, d.owner].filter(Boolean).join('; ');
        const text = n.name;
        const size = fmtBytes(n.size, 0);
        let caption: string | null = null;
        let caption2: string | null = null;
        if (t.open) {
          const chars = fitChars(w - 8, STRIP_FONT);
          caption = chars >= 3 ? (chars >= text.length + size.length + 3 ? `${text} · ${size}` : ellipsise(text, chars)) : null;
        } else if (w >= MIN_LABEL_W && h >= 13) {
          const chars = fitChars(w - 6, TILE_FONT);
          caption = chars >= 2 ? ellipsise(text, chars) : null;
          if (caption && h >= 26 && w >= 54) caption2 = size;
        }
        if (t.thin) {
          // A sliver: its bytes are already in the parent's description.
          return <rect key={i} data-i={i} x={t.x0} y={t.y0} width={w} height={h} fill={tone.fill} aria-hidden="true" className={isZoomable(n) ? 'cursor-pointer' : undefined} />;
        }
        return (
          <g
            key={i}
            data-i={i}
            role={zoomable ? 'button' : 'img'}
            tabIndex={zoomable ? 0 : -1}
            aria-label={label}
            className={`group outline-none ${zoomable ? 'cursor-pointer' : ''}`}
          >
            <rect x={t.x0} y={t.y0} width={w} height={h} fill={tone.fill} />
            {!t.open && w >= 3 && h >= 3 && <rect x={t.x0} y={t.y0} width={w} height={h} fill={`url(#${gradientId})`} className="pointer-events-none" />}
            <rect
              x={t.x0 + 0.5}
              y={t.y0 + 0.5}
              width={Math.max(0, w - 1)}
              height={Math.max(0, h - 1)}
              fill="none"
              stroke={inner}
              strokeDasharray={t.more ? '3 2' : undefined}
              className="pointer-events-none group-hover:stroke-[var(--foreground)] group-focus-visible:stroke-[var(--ring)] group-focus-visible:[stroke-width:2]"
            />
            {caption && (
              <text
                x={t.x0 + (t.open ? 4 : 3)}
                y={t.y0 + (t.open ? STRIP - 4.5 : Math.min(h - 3, TILE_FONT + 2))}
                className="pointer-events-none select-none font-mono"
                style={{ fontSize: t.open ? STRIP_FONT : TILE_FONT, fill: tone.ink, fontWeight: t.open ? 500 : 400 }}
                aria-hidden="true"
              >
                {caption}
              </text>
            )}
            {caption2 && (
              <text x={t.x0 + 3} y={t.y0 + TILE_FONT * 2 + 4} className="pointer-events-none select-none font-mono" style={{ fontSize: TILE_FONT - 1, fill: tone.ink, opacity: 0.85 }} aria-hidden="true">
                {caption2}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
});

/**
 * qdirstat-style treemap of one architecture's file tree (deduplicated bytes): directories nested several
 * levels deep, then files, coloured by the kind of file and shaded by depth. Click anywhere on
 * a directory to zoom in; the breadcrumb, Backspace or Escape zoom out. The list beside the map carries
 * the same numbers in text, so nothing depends on colour or on reading the picture.
 */
export default function Treemap({ image, tag, arches, urls, initialArch, compact = false }: Props) {
  const [arch, setArch] = React.useState<Arch>(initialArch ?? arches[0]);
  const [state, setState] = React.useState<{ status: 'loading' | 'ready' | 'error'; files?: FileNode; error?: string }>({ status: 'loading' });
  const [path, setPath] = React.useState<string[]>([]);
  const [tip, setTip] = React.useState<{ i: number; x: number; y: number; keyboard: boolean } | null>(null);
  const [attempt, setAttempt] = React.useState(0);
  const dark = useDark();
  const fullscreen = useFullscreen();
  const { ref, attach, width, room } = useWidth(fullscreen);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const gradientId = React.useId().replace(/:/g, '');

  React.useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: 'loading' });
    setPath([]);
    setTip(null);
    loadFiles(urls[arch] ?? [], ctrl.signal)
      .then((files) => setState({ status: 'ready', files }))
      .catch((e) => !ctrl.signal.aborted && setState({ status: 'error', error: e instanceof Error ? e.message : String(e) }));
    return () => ctrl.abort();
  }, [arch, urls, attempt]);

  // The hierarchy and its parent links are computed once per file tree; zooming only re-lays out.
  const tree = React.useMemo(() => (state.files ? buildTree(state.files) : null), [state.files]);
  const parents = React.useMemo(() => {
    const m = new Map<TreeNode, TreeNode>();
    const walk = (n: TreeNode) => n.children?.forEach((c) => (m.set(c, n), walk(c)));
    if (tree) walk(tree);
    return m;
  }, [tree]);
  const totals = React.useMemo(() => (tree ? kindTotals(tree) : []), [tree]);

  let focus = tree;
  for (const p of path) focus = focus?.children?.find((c) => c.path === p) ?? focus;

  // Full screen, the map takes what is left of the viewport under its top edge, less the live line below it.
  const height =
    fullscreen && room !== null
      ? Math.max(300, room - 56)
      : compact
        ? Math.round(Math.min(340, Math.max(220, width * 0.45)))
        : Math.round(Math.min(640, Math.max(300, width * (width < 640 ? 0.9 : 0.56))));
  const listed = compact ? 6 : fullscreen ? 20 : 10;
  const tiles = React.useMemo(() => (focus ? layoutTiles(focus, width, height) : []), [focus, width, height]);

  const anim = !reducedMotion();
  const legend = totals.slice(0, 8);
  const legendOther = totals.slice(8).reduce((a, t) => a + t.size, 0);

  const zoomTo = (n: TreeNode) => {
    if (!isZoomable(n) || n === tree) {
      if (n === tree) setPath([]);
      return;
    }
    const chain: string[] = [];
    for (let cur: TreeNode | undefined = n; cur && cur !== tree; cur = parents.get(cur)) chain.unshift(cur.path);
    setPath(chain);
    setTip(null);
    requestAnimationFrame(() => svgRef.current?.focus({ preventScroll: true }));
  };
  const zoomOut = () => {
    if (!path.length) return;
    setPath((p) => p.slice(0, -1));
    setTip(null);
    requestAnimationFrame(() => svgRef.current?.focus({ preventScroll: true }));
  };
  /** Activating a tile: directories zoom in; the aggregate tile zooms into its directory when that is not the focus. */
  const activate = (t: Tile) => {
    if (t.more) {
      if (t.parent && t.parent !== focus && isZoomable(t.parent)) zoomTo(t.parent);
      return;
    }
    if (isZoomable(t.node)) zoomTo(t.node);
  };

  const tileAt = (target: EventTarget | null): number | null => {
    const g = (target as Element | null)?.closest?.('[data-i]');
    const i = g ? Number(g.getAttribute('data-i')) : NaN;
    return Number.isFinite(i) ? i : null;
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const i = tileAt(e.target);
    if (i === null) return setTip(null);
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    setTip({ i, x: e.clientX - box.left, y: e.clientY - box.top, keyboard: false });
  };
  const onFocus = (e: React.FocusEvent<SVGSVGElement>) => {
    const i = tileAt(e.target);
    if (i === null) return;
    const t = tiles[i];
    setTip({ i, x: t.x0 + 4, y: t.y0 + Math.min(STRIP, t.y1 - t.y0), keyboard: true });
  };
  const onKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (e.key === 'Backspace' || e.key === 'Escape') {
      if (path.length) {
        e.preventDefault();
        zoomOut();
      }
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      const i = tileAt(e.target);
      if (i === null) return;
      e.preventDefault();
      activate(tiles[i]);
    }
  };

  const hovered = tip ? tiles[tip.i] : undefined;
  const hoveredDesc = hovered && tree ? describe(hovered.node, hovered, tree.size) : null;
  const crumbs = [{ label: 'image', path: [] as string[] }, ...path.map((p, i) => ({ label: p.split('/').pop() || p, path: path.slice(0, i + 1) }))];
  const tipLeft = tip ? Math.min(tip.x + 12, Math.max(0, width - 288)) : 0;
  const tipAbove = tip ? tip.y > height * 0.6 : false;

  return (
    <div>
      <IslandHeader
        title={`files.${arch}.json.gz · ${tree ? `${tree.files.toLocaleString('en-GB')} files · ${fmtBytes(tree.size)} uncompressed` : tag}`}
        note="Click a directory to zoom in; Backspace or Escape zooms out."
      >
        <ArchToggle arches={arches} value={arch} onChange={setArch} />
      </IslandHeader>

      {state.status === 'loading' && <Loading what={`the ${arch} file table`} />}
      {state.status === 'error' && <LoadError error={state.error ?? 'unknown error'} url={urls[arch]?.[0]} retry={() => setAttempt((a) => a + 1)} />}

      {state.status === 'ready' && tree && focus && (
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="min-w-0 p-3">
            <nav aria-label="Treemap path" className="mb-2 flex flex-wrap items-center gap-1 font-mono text-xs">
              {crumbs.map((c, i) => (
                <React.Fragment key={c.path.join('/') || 'root'}>
                  {i > 0 && (
                    <span className="text-muted-foreground" aria-hidden="true">
                      /
                    </span>
                  )}
                  {i === crumbs.length - 1 ? (
                    <span aria-current="location" className="rounded px-1 text-foreground">
                      {c.label}
                    </span>
                  ) : (
                    <button type="button" onClick={() => setPath(c.path)} className="rounded px-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                      {c.label}
                    </button>
                  )}
                </React.Fragment>
              ))}
              <span className="ml-auto text-muted-foreground">
                {fmtBytes(focus.size)} · {focus.files.toLocaleString('en-GB')} files
              </span>
            </nav>
            <div ref={attach} className="relative w-full">
              <svg
                ref={svgRef}
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className="block max-w-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                role="group"
                tabIndex={-1}
                aria-label={`Treemap of ${focus.kind === 'root' ? 'the image' : focus.path}: ${tiles.length.toLocaleString('en-GB')} tiles`}
                onPointerMove={onPointerMove}
                onPointerLeave={() => setTip(null)}
                onClick={(e) => {
                  const i = tileAt(e.target);
                  if (i !== null) activate(tiles[i]);
                }}
                onFocus={onFocus}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setTip(null);
                }}
                onKeyDown={onKeyDown}
              >
                <defs>
                  {/* Cushion shading: light from the top-left, shadow at the bottom-right, scaled to each tile. */}
                  <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#fff" stopOpacity={dark ? 0.16 : 0.3} />
                    <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
                    <stop offset="1" stopColor="#000" stopOpacity={dark ? 0.26 : 0.14} />
                  </linearGradient>
                </defs>
                <g key={path.join('\u0000')} className={anim ? 'animate-in fade-in duration-200' : undefined}>
                  <Tiles tiles={tiles} dark={dark} total={tree.size} gradientId={gradientId} />
                </g>
              </svg>
              {tip && hoveredDesc && (
                <div
                  role="tooltip"
                  aria-hidden="true"
                  className="pointer-events-none absolute z-10 w-72 max-w-[calc(100%-0.5rem)] rounded-md border border-[var(--raft-hair-strong)] bg-popover p-2.5 font-mono text-[0.6875rem] leading-snug text-popover-foreground shadow-lg"
                  style={{ left: tipLeft, ...(tipAbove ? { bottom: height - tip.y + 10 } : { top: tip.y + 12 }) }}
                >
                  <p className="font-medium break-all">{hoveredDesc.title}</p>
                  {hoveredDesc.path && hoveredDesc.path !== hoveredDesc.title && <p className="mt-1 break-all text-muted-foreground">{hoveredDesc.path}</p>}
                  <dl className="mt-1.5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5">
                    <dt className="text-muted-foreground">type</dt>
                    <dd className="break-words">{hoveredDesc.type}</dd>
                    <dt className="text-muted-foreground">size</dt>
                    <dd className="tabular-nums">{hoveredDesc.size}</dd>
                    {hoveredDesc.owner && (
                      <>
                        <dt className="text-muted-foreground">{hovered?.more ? 'tip' : 'kind'}</dt>
                        <dd className="break-all">{hoveredDesc.owner}</dd>
                      </>
                    )}
                  </dl>
                  {hovered && !hovered.more && isZoomable(hovered.node) && <p className="mt-1.5 text-muted-foreground">{tip.keyboard ? 'Enter zooms in' : 'Click to zoom in'}</p>}
                </div>
              )}
            </div>
            <p className="mt-2 min-h-[2.5rem] font-mono text-xs text-muted-foreground" aria-live="polite">
              {hoveredDesc
                ? [hoveredDesc.title, hoveredDesc.path !== hoveredDesc.title ? hoveredDesc.path : '', hoveredDesc.type, hoveredDesc.size, hoveredDesc.owner].filter(Boolean).join(' · ')
                : `${tiles.length.toLocaleString('en-GB')} tiles drawn; entries under ${MIN_TILE} px are folded into "more files" tiles. Hover or focus a tile for details.`}
            </p>
          </div>

          <aside className="border-t border-[var(--raft-hair)] p-4 text-sm lg:border-t-0 lg:border-l" aria-label="Treemap details">
            <h3 className="raft-eyebrow">Largest here</h3>
            <ol className="mt-2 space-y-1">
              {(focus.children ?? []).slice(0, listed).map((c) => (
                <li key={c.path}>
                  <button
                    type="button"
                    onClick={() => zoomTo(c)}
                    disabled={!isZoomable(c)}
                    className="group flex w-full items-center gap-2 rounded px-1 py-0.5 text-left hover:bg-muted disabled:cursor-default disabled:hover:bg-transparent"
                    aria-label={`${c.name}, ${c.kind === 'file' ? 'file' : 'directory'}, ${fmtBytes(c.size)}, ${c.kind === 'file' ? kindLabel(c.cat) : `${c.files.toLocaleString('en-GB')} files`}${isZoomable(c) ? ', zoom in' : ''}`}
                  >
                    <span className="size-2.5 shrink-0 rounded-sm" style={{ background: kindColor(c.cat, { dark }) }} aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate font-mono text-xs">{c.name}</span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">{fmtBytes(c.size, 0)}</span>
                  </button>
                </li>
              ))}
              {(focus.children?.length ?? 0) > listed && (
                <li className="px-1 py-0.5 font-mono text-xs text-muted-foreground">
                  and {((focus.children?.length ?? 0) - listed).toLocaleString('en-GB')} more entries, {fmtBytes((focus.children ?? []).slice(listed).reduce((a, c) => a + c.size, 0))}
                </li>
              )}
            </ol>
            {!compact && (
              <>
            <h3 className="raft-eyebrow mt-5">Legend</h3>
            <ul className="mt-2 space-y-1" aria-label="Bytes by kind of file">
              {legend.map((t) => (
                <li key={t.cat} className="flex items-center gap-2 px-1 py-0.5">
                  <span className="size-2.5 shrink-0 rounded-sm" style={{ background: kindColor(t.cat, { dark }) }} aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate font-mono text-xs">{kindLabel(t.cat)}</span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">{pct(t.size, tree.size)}</span>
                </li>
              ))}
              {legendOther > 0 && (
                <li className="flex items-center gap-2 px-1 py-0.5 text-muted-foreground">
                  <span className="size-2.5 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate font-mono text-xs">{totals.length - 8} other kinds</span>
                  <span className="shrink-0 font-mono text-xs tabular-nums">{pct(legendOther, tree.size)}</span>
                </li>
              )}
            </ul>
              </>
            )}
            <p className="mt-2 font-mono text-[0.6875rem] text-muted-foreground">
              <a href={urls[arch]?.[0]} className="underline underline-offset-4 decoration-[var(--raft-hair-strong)] hover:text-foreground hover:decoration-current" target="_blank" rel="noopener">
                {image}:{tag} files.{arch}.json.gz<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
