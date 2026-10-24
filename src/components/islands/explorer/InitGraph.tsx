import * as React from 'react';
import type { InitUnit } from '@/lib/hub';
import { SOURCE_COLOR } from '@/lib/explorer';

interface Props {
  units: InitUnit[];
  image: string;
}

interface Node {
  unit: InitUnit;
  layer: number;
  order: number;
  x: number;
  y: number;
  placeholder: boolean;
}

const H = 36;
const CHAR = 6.7;
const GAP_X = 18;
const GAP_Y = 54;
const PAD = 16;

/**
 * Layered layout of the s6-rc graph: a unit sits one row below the deepest unit it depends on; rows are
 * ordered by the average position of their dependencies (a few barycenter sweeps). Small enough to need
 * no layout library.
 */
export function layout(units: InitUnit[]): { nodes: Node[]; width: number; height: number; W: number } {
  const W = Math.max(120, Math.ceil(24 + 10 + CHAR * Math.max(...units.flatMap((u) => [u.name, ...u.depends_on]).map((n) => n.length), 8)));
  const byName = new Map<string, InitUnit>(units.map((u) => [u.name, u]));
  // Dependencies on units the bundle didn't list (a mod's unit, say) become placeholders.
  for (const u of units) for (const d of u.depends_on) if (!byName.has(d)) byName.set(d, { name: d, type: 'bundle', depends_on: [], source: null });
  const all = [...byName.values()];
  const layerOf = new Map<string, number>();
  const visiting = new Set<string>();
  const depth = (name: string): number => {
    if (layerOf.has(name)) return layerOf.get(name)!;
    if (visiting.has(name)) return 0; // cycle guard
    visiting.add(name);
    const u = byName.get(name)!;
    const d = u.depends_on.length ? Math.max(...u.depends_on.map(depth)) + 1 : 0;
    visiting.delete(name);
    layerOf.set(name, d);
    return d;
  };
  all.forEach((u) => depth(u.name));
  const layers: string[][] = [];
  for (const u of all) (layers[layerOf.get(u.name)!] ??= []).push(u.name);
  layers.forEach((l) => l.sort());
  const pos = new Map<string, number>();
  const assign = () => layers.forEach((l) => l.forEach((n, i) => pos.set(n, i)));
  assign();
  for (let sweep = 0; sweep < 4; sweep++) {
    for (let i = 1; i < layers.length; i++) {
      layers[i].sort((a, b) => bary(a) - bary(b) || a.localeCompare(b));
      assign();
    }
    for (let i = layers.length - 2; i >= 0; i--) {
      const children = (n: string) => all.filter((u) => u.depends_on.includes(n)).map((u) => pos.get(u.name)!);
      layers[i].sort((a, b) => avg(children(a), pos.get(a)!) - avg(children(b), pos.get(b)!) || a.localeCompare(b));
      assign();
    }
  }
  function bary(n: string) {
    const deps = byName.get(n)!.depends_on.map((d) => pos.get(d)!);
    return avg(deps, pos.get(n)!);
  }
  function avg(xs: number[], fallback: number) {
    return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : fallback;
  }
  const maxCols = Math.max(1, ...layers.map((l) => l.length));
  const width = PAD * 2 + maxCols * W + (maxCols - 1) * GAP_X;
  const nodes: Node[] = [];
  layers.forEach((l, li) => {
    const rowW = l.length * W + (l.length - 1) * GAP_X;
    const x0 = (width - rowW) / 2;
    l.forEach((n, i) => {
      const unit = byName.get(n)!;
      nodes.push({ unit, layer: li, order: i, x: x0 + i * (W + GAP_X), y: PAD + li * (H + GAP_Y), placeholder: !units.some((u) => u.name === n) });
    });
  });
  const height = PAD * 2 + layers.length * H + (layers.length - 1) * GAP_Y;
  return { nodes, width, height, W };
}

const TYPE_GLYPH: Record<string, string> = { oneshot: '▸', longrun: '∞', bundle: '⊞' };

/**
 * The init graph from the bundle's `init_graph.units`, drawn client-side as SVG (no d2). Units are
 * coloured by source (base image, this image, a mod) and labelled with their type; selecting a unit shows
 * its dependencies and, for the image's own units, the run script. A text list below carries the same
 * information for screen readers and small screens.
 */
export default function InitGraph({ units, image }: Props) {
  const { nodes, width, height, W } = React.useMemo(() => layout(units), [units]);
  const [selected, setSelected] = React.useState<string | null>(null);
  const byName = React.useMemo(() => new Map(nodes.map((n) => [n.unit.name, n])), [nodes]);
  const sel = selected ? byName.get(selected) : undefined;
  const dependents = (name: string) => units.filter((u) => u.depends_on.includes(name)).map((u) => u.name);
  const related = new Set<string>(sel ? [sel.unit.name, ...sel.unit.depends_on, ...dependents(sel.unit.name)] : []);
  const edges = nodes.flatMap((n) => n.unit.depends_on.map((d) => ({ from: byName.get(d)!, to: n })));
  const counts = { base: 0, image: 0, mod: 0 };
  for (const u of units) if (u.source && u.source in counts) counts[u.source as keyof typeof counts]++;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--raft-hair)] bg-[var(--raft-surface)] px-3.5 py-2">
        <p className="font-mono text-xs text-muted-foreground">
          init_graph · {units.length} units · {counts.image} from {image}, {counts.base} from the base, {counts.mod} from mods
        </p>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Legend">
          {(['base', 'image', 'mod'] as const).map((s) => (
            <li key={s} className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: SOURCE_COLOR[s] }} aria-hidden="true" />
              {s === 'image' ? 'this image' : s === 'base' ? 'base image' : 'mod'}
            </li>
          ))}
          <li className="inline-flex items-center gap-x-2 font-mono">
            <span>▸ oneshot</span>
            <span>∞ longrun</span>
            <span>⊞ bundle</span>
          </li>
        </ul>
      </div>
      <div className="overflow-x-auto" tabIndex={-1}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="group" aria-label={`Dependency graph of ${units.length} init units; select a unit for details`} className="block font-mono text-[11px]" style={{ minWidth: Math.min(width, 320), maxWidth: 'none' }}>
          <defs>
            <marker id="ig-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--muted-foreground)" />
            </marker>
          </defs>
          <g aria-hidden="true">
            {edges.map(({ from, to }, i) => {
              const x1 = from.x + W / 2;
              const y1 = from.y + H;
              const x2 = to.x + W / 2;
              const y2 = to.y;
              const my = (y1 + y2) / 2;
              const hot = sel && (related.has(from.unit.name) && related.has(to.unit.name)) && (from.unit.name === sel.unit.name || to.unit.name === sel.unit.name);
              return (
                <path
                  key={i}
                  d={`M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`}
                  fill="none"
                  stroke={hot ? 'var(--primary)' : 'var(--raft-hair-strong)'}
                  strokeWidth={hot ? 2 : 1.25}
                  opacity={sel && !hot ? 0.35 : 1}
                  markerEnd="url(#ig-arrow)"
                />
              );
            })}
          </g>
          {nodes.map((n) => {
            const color = n.placeholder ? 'var(--muted-foreground)' : SOURCE_COLOR[n.unit.source ?? ''] ?? 'var(--muted-foreground)';
            const isSel = selected === n.unit.name;
            const dim = sel && !related.has(n.unit.name);
            return (
              <g
                key={n.unit.name}
                role="button"
                tabIndex={0}
                aria-pressed={isSel}
                aria-label={`${n.unit.name} ${n.unit.type}${n.unit.source ? `, from ${n.unit.source === 'image' ? image : n.unit.source}` : ''}${n.unit.depends_on.length ? `, after ${n.unit.depends_on.join(', ')}` : ', starts first'}`}
                onClick={() => setSelected(isSel ? null : n.unit.name)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelected(isSel ? null : n.unit.name);
                  }
                }}
                className="cursor-pointer outline-none focus-visible:[&>rect]:stroke-[var(--ring)] focus-visible:[&>rect]:stroke-2"
                opacity={dim ? 0.4 : 1}
                transform={`translate(${n.x},${n.y})`}
              >
                <rect width={W} height={H} rx={6} fill="var(--card)" stroke={isSel ? 'var(--primary)' : 'var(--raft-hair-strong)'} strokeWidth={isSel ? 2 : 1} strokeDasharray={n.placeholder ? '4 3' : undefined} />
                <rect x={0} y={0} width={4} height={H} rx={2} fill={color} />
                <text x={12} y={H / 2 + 4} fill="var(--muted-foreground)" style={{ fontSize: 11 }} aria-hidden="true">
                  {TYPE_GLYPH[n.unit.type] ?? '·'}
                </text>
                <text x={26} y={H / 2 + 4} fill="var(--foreground)" style={{ fontSize: 11 }}>
                  {n.unit.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {sel && (
        <div className="border-t border-[var(--raft-hair)] p-4 text-sm" role="region" aria-live="polite" aria-label={`Details of ${sel.unit.name}`}>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="font-mono text-base font-semibold">{sel.unit.name}</h3>
            <span className="font-mono text-xs text-muted-foreground">
              {sel.unit.type}
              {sel.unit.source ? ` · from ${sel.unit.source === 'image' ? image : sel.unit.source === 'base' ? 'the base image' : 'a mod'}` : sel.placeholder ? ' · not in this bundle' : ''}
            </span>
          </div>
          <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="raft-eyebrow">Runs after</dt>
              <dd className="mt-1 font-mono text-xs">{sel.unit.depends_on.length ? sel.unit.depends_on.join(', ') : 'nothing: a root of the graph'}</dd>
            </div>
            <div>
              <dt className="raft-eyebrow">Needed by</dt>
              <dd className="mt-1 font-mono text-xs">{dependents(sel.unit.name).join(', ') || 'nothing'}</dd>
            </div>
          </dl>
          {sel.unit.script && (
            <details className="mt-3" open>
              <summary className="cursor-pointer font-mono text-xs text-muted-foreground hover:text-foreground">run script</summary>
              <pre className="mt-2 max-h-80 overflow-auto rounded-md border border-[var(--raft-hair)] bg-[var(--raft-code-bg)] p-3 font-mono text-xs leading-relaxed" tabIndex={0}>
                <code>{sel.unit.script}</code>
              </pre>
            </details>
          )}
        </div>
      )}
      <details className="border-t border-[var(--raft-hair)] px-4 py-3">
        <summary className="cursor-pointer font-mono text-xs text-muted-foreground hover:text-foreground">Start order as a list</summary>
        <ol className="mt-3 space-y-1.5 text-sm">
          {nodes
            .filter((n) => !n.placeholder)
            .sort((a, b) => a.layer - b.layer || a.order - b.order)
            .map((n) => (
              <li key={n.unit.name} className="flex flex-wrap items-baseline gap-x-2">
                <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground tabular-nums">{n.layer + 1}</span>
                <span className="font-mono text-xs font-medium">{n.unit.name}</span>
                <span className="font-mono text-[0.6875rem] text-muted-foreground">
                  {n.unit.type}
                  {n.unit.source && ` · ${n.unit.source}`}
                  {n.unit.depends_on.length > 0 && ` · after ${n.unit.depends_on.join(', ')}`}
                </span>
              </li>
            ))}
        </ol>
      </details>
    </div>
  );
}
