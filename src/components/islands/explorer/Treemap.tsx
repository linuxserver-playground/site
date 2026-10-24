import * as React from 'react';
import { hierarchy, treemap, treemapSquarify, type HierarchyRectangularNode } from 'd3-hierarchy';
import type { Arch, FileEntry, Layer } from '@/lib/hub';
import { buildTree, fmtBytes, loadFiles, packageTotals, pct, pkgColor, purlLabel, purlName, reducedMotion, type TreeNode } from '@/lib/explorer';
import { tidyInstruction } from './LayerTable';
import ArchToggle, { IslandHeader, LoadError, Loading } from './ArchToggle';

interface Props {
  image: string;
  tag: string;
  arches: Arch[];
  /** Candidate URLs for files.<arch>.json.gz, tried in order (hub copy, then the Release asset). */
  urls: Partial<Record<Arch, string[]>>;
  layers: Partial<Record<Arch, Layer[]>>;
  initialArch?: Arch;
}

type Rect = HierarchyRectangularNode<TreeNode>;

const HEADER = 20;
const MIN_LABEL_W = 48;
const MIN_LABEL_H = 16;

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

function useWidth<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const [width, setWidth] = React.useState(960);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, Math.floor(e.contentRect.width))));
    ro.observe(el);
    setWidth(Math.max(280, Math.floor(el.getBoundingClientRect().width)));
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}

/** The focus node's subtree, two levels deep; deeper directories collapse into their parent's size. */
function pruned(node: TreeNode, depth = 2): TreeNode {
  if (depth === 0 || !node.children?.length) return { ...node, children: undefined };
  return { ...node, children: node.children.map((c) => pruned(c, depth - 1)) };
}

/**
 * Layer → directory → file treemap of one architecture's file table (deduplicated bytes), coloured by
 * owning package. Click a layer or directory to zoom in; the breadcrumb zooms out. The list beside the
 * map carries the same numbers in text, so nothing depends on colour or on reading the picture.
 */
export default function Treemap({ image, tag, arches, urls, layers, initialArch }: Props) {
  const [arch, setArch] = React.useState<Arch>(initialArch ?? arches[0]);
  const [state, setState] = React.useState<{ status: 'loading' | 'ready' | 'error'; files?: FileEntry[]; error?: string }>({ status: 'loading' });
  const [path, setPath] = React.useState<string[]>([]);
  const [hover, setHover] = React.useState<TreeNode | null>(null);
  const [attempt, setAttempt] = React.useState(0);
  const dark = useDark();
  const { ref, width } = useWidth<HTMLDivElement>();

  React.useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: 'loading' });
    setPath([]);
    loadFiles(urls[arch] ?? [], ctrl.signal)
      .then((files) => setState({ status: 'ready', files }))
      .catch((e) => !ctrl.signal.aborted && setState({ status: 'error', error: e instanceof Error ? e.message : String(e) }));
    return () => ctrl.abort();
  }, [arch, urls, attempt]);

  const tree = React.useMemo(() => (state.files ? buildTree(state.files, layers[arch] ?? []) : null), [state.files, layers, arch]);
  const totals = React.useMemo(() => (state.files ? packageTotals(state.files) : []), [state.files]);

  // Walk down to the focused node.
  let focus = tree;
  for (const p of path) focus = focus?.children?.find((c) => c.path === p) ?? focus;

  const height = Math.round(Math.min(640, Math.max(300, width * (width < 640 ? 0.9 : 0.56))));
  const root = React.useMemo(() => {
    if (!focus) return null;
    const h = hierarchy(pruned(focus), (d) => d.children).sum((d) => (d.children?.length ? 0 : d.size));
    treemap<TreeNode>().size([width, height]).tile(treemapSquarify).paddingOuter(3).paddingTop((d) => (d.depth === 1 && d.children ? HEADER : 2)).paddingInner(2).round(true)(h);
    return h as Rect;
  }, [focus, width, height]);

  const anim = !reducedMotion();
  const legend = totals.slice(0, 8);
  const legendOther = totals.slice(8).reduce((a, t) => a + t.size, 0);

  const zoomInto = (n: TreeNode) => {
    if (n.kind === 'file' || !n.children?.length) return;
    setPath((p) => [...p, n.path]);
    setHover(null);
  };

  const describe = (n: TreeNode) => {
    const layer = n.layer !== undefined ? layers[arch]?.[n.layer] : undefined;
    return [
      n.kind === 'layer' ? `Layer ${n.layer}` : n.path,
      `${fmtBytes(n.size)} (${pct(n.size, tree?.size ?? 0)} of the image)`,
      n.kind !== 'file' ? `${n.files.toLocaleString('en-GB')} files` : purlLabel(n.pkg),
      n.kind === 'layer' && layer ? tidyInstruction(layer.created_by).slice(0, 80) : n.kind === 'dir' ? `mostly ${purlName(n.pkg)}` : `layer ${n.layer}`,
    ];
  };

  const crumbs = [{ label: 'image', path: [] as string[] }, ...path.map((p, i) => ({ label: p.startsWith('layer ') ? p : p.split('/').pop() || p, path: path.slice(0, i + 1) }))];

  return (
    <div>
      <IslandHeader title={`files.${arch}.json.gz · ${tree ? `${tree.files.toLocaleString('en-GB')} files · ${fmtBytes(tree.size)} uncompressed` : tag}`} note="Area is deduplicated bytes on disk; colour is the owning package. Click a layer or folder to zoom.">
        <ArchToggle arches={arches} value={arch} onChange={setArch} />
      </IslandHeader>

      {state.status === 'loading' && <Loading what={`the ${arch} file table`} />}
      {state.status === 'error' && <LoadError error={state.error ?? 'unknown error'} url={urls[arch]?.[0]} retry={() => setAttempt((a) => a + 1)} />}

      {state.status === 'ready' && tree && focus && root && (
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="min-w-0 p-3">
            <nav aria-label="Treemap zoom" className="mb-2 flex flex-wrap items-center gap-1 font-mono text-xs">
              {crumbs.map((c, i) => (
                <React.Fragment key={c.path.join('/') || 'root'}>
                  {i > 0 && <span className="text-muted-foreground" aria-hidden="true">/</span>}
                  {i === crumbs.length - 1 ? (
                    <span aria-current="location" className="text-foreground">
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
            <div ref={ref} className="w-full">
              <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block max-w-full" role="group" aria-label={`Treemap of ${focus.kind === 'root' ? 'the image' : focus.path}`} onMouseLeave={() => setHover(null)}>
                {root.descendants().filter((d) => d.depth > 0).map((d, i) => {
                  const n = d.data;
                  const w = Math.max(0, d.x1 - d.x0);
                  const h = Math.max(0, d.y1 - d.y0);
                  if (w < 1 || h < 1) return null;
                  const isGroup = d.depth === 1 && !!d.children;
                  const zoomable = n.kind !== 'file' && !!n.children?.length;
                  const fill = n.kind === 'layer' ? (dark ? 'oklch(0.3 0.03 290)' : 'oklch(0.93 0.02 290)') : pkgColor(n.pkg, { dark });
                  const label = n.kind === 'layer' ? `layer ${n.layer}` : n.name;
                  const showLabel = w >= MIN_LABEL_W && h >= MIN_LABEL_H;
                  const desc = describe(n);
                  return (
                    <g
                      key={`${n.path}-${i}`}
                      transform={`translate(${d.x0},${d.y0})`}
                      role={zoomable ? 'button' : 'img'}
                      tabIndex={zoomable ? 0 : -1}
                      aria-label={desc.join('; ')}
                      onClick={() => zoomInto(n)}
                      onKeyDown={(e) => {
                        if (zoomable && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          zoomInto(n);
                        }
                      }}
                      onMouseEnter={() => setHover(n)}
                      onFocus={() => setHover(n)}
                      className={zoomable ? 'cursor-zoom-in outline-none focus-visible:[&>rect]:stroke-[var(--ring)] focus-visible:[&>rect]:stroke-2' : 'outline-none'}
                      style={anim ? { transition: 'transform 200ms ease-out' } : undefined}
                    >
                      <title>{desc.join('\n')}</title>
                      <rect
                        width={w}
                        height={h}
                        rx={isGroup ? 4 : 2}
                        fill={fill}
                        fillOpacity={isGroup ? 0.35 : hover === n ? 1 : 0.85}
                        stroke={isGroup ? 'var(--raft-hair-strong)' : 'var(--background)'}
                        strokeWidth={1}
                      />
                      {showLabel && (
                        <text
                          x={6}
                          y={isGroup ? 14 : Math.min(h - 5, 15)}
                          className="pointer-events-none font-mono"
                          style={{ fontSize: 11, fill: isGroup ? 'var(--foreground)' : dark ? '#fff' : '#0e0b18', paintOrder: 'stroke', stroke: isGroup ? 'var(--card)' : 'none', strokeWidth: 3 }}
                        >
                          {label.length > w / 6.5 ? label.slice(0, Math.max(1, Math.floor(w / 6.5) - 1)) + '…' : label}
                          {!isGroup && h >= 30 && w >= 72 && (
                            <tspan x={6} dy={13} style={{ fontSize: 10, opacity: 0.85 }}>
                              {fmtBytes(n.size, 0)}
                            </tspan>
                          )}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
            <p className="mt-2 min-h-[2.5rem] font-mono text-xs text-muted-foreground" aria-live="polite">
              {hover ? describe(hover).join(' · ') : 'Hover or focus a block for details.'}
            </p>
          </div>

          <aside className="border-t border-[var(--raft-hair)] p-4 text-sm lg:border-t-0 lg:border-l" aria-label="Treemap details">
            <h3 className="raft-eyebrow">Largest here</h3>
            <ol className="mt-2 space-y-1">
              {(focus.children ?? []).slice(0, 10).map((c) => (
                <li key={c.path}>
                  <button
                    type="button"
                    onClick={() => zoomInto(c)}
                    disabled={!c.children?.length}
                    className="group flex w-full items-center gap-2 rounded px-1 py-0.5 text-left hover:bg-muted disabled:cursor-default disabled:hover:bg-transparent"
                    aria-label={`${c.kind === 'layer' ? `layer ${c.layer}` : c.name}, ${fmtBytes(c.size)}${c.children?.length ? ', zoom in' : ''}`}
                  >
                    <span className="size-2.5 shrink-0 rounded-sm" style={{ background: c.kind === 'layer' ? 'var(--raft-hair-strong)' : pkgColor(c.pkg, { dark }) }} aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate font-mono text-xs">{c.kind === 'layer' ? `layer ${c.layer}` : c.name}</span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">{fmtBytes(c.size, 0)}</span>
                  </button>
                </li>
              ))}
            </ol>
            <h3 className="raft-eyebrow mt-5">By package</h3>
            <ul className="mt-2 space-y-1" aria-label="Bytes by owning package">
              {legend.map((t) => (
                <li key={t.pkg ?? 'unowned'} className="flex items-center gap-2 px-1 py-0.5">
                  <span className="size-2.5 shrink-0 rounded-sm" style={{ background: pkgColor(t.pkg, { dark }) }} aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate font-mono text-xs" title={t.pkg}>
                    {purlName(t.pkg)}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">{pct(t.size, tree.size)}</span>
                </li>
              ))}
              {legendOther > 0 && (
                <li className="flex items-center gap-2 px-1 py-0.5 text-muted-foreground">
                  <span className="size-2.5 shrink-0" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate font-mono text-xs">{totals.length - 8} other packages</span>
                  <span className="shrink-0 font-mono text-xs tabular-nums">{pct(legendOther, tree.size)}</span>
                </li>
              )}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Unowned bytes are files no package manager claims: the application itself, scripts and generated data.
            </p>
            <p className="mt-2 font-mono text-[0.6875rem] text-muted-foreground">
              <a href={urls[arch]?.[0]} className="underline-offset-4 hover:text-foreground hover:underline" target="_blank" rel="noopener">
                {image}:{tag} files.{arch}.json.gz<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
