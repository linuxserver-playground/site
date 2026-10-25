import * as React from 'react';
import type { InitUnit } from '@/lib/hub';
import { initStages, reducedMotion, SOURCE_COLOR } from '@/lib/explorer';
import CopyButton from '../CopyButton';

interface Props {
  units: InitUnit[];
  image: string;
}

type Item = { kind: 'unit'; key: string; unit: InitUnit; stage: number } | { kind: 'base'; key: string; units: InitUnit[]; stages: [number, number] };

interface Column {
  items: Item[];
  stages: [number, number];
  x: number;
  width: number;
}

/** Where a unit is drawn: its own node, a row of an expanded base group, or the collapsed group it hides in. */
interface Spot {
  key: string;
  x: number;
  y: number;
  w: number;
  h: number;
  collapsed: boolean;
}

interface Edge {
  from: Spot;
  to: Spot;
  /** Unit names on each end, for highlighting. */
  a: string;
  b: string;
  dashed: boolean;
}

const CHAR = 6.6; // px per character of 11px Geist Mono
const PILL_CHAR = 5.6;
const NODE_H = 30;
const ROW_H = 20;
const GAP_Y = 10;
const COL_GAP = 32;
const PAD = 16;
const LABEL_H = 20;

const sourceLabel = (u: InitUnit, image: string) => (u.source === 'image' ? image : u.source === 'base' ? 'the base image' : u.source === 'mod' ? 'a mod' : 'unknown');
const groupLabel = (g: Extract<Item, { kind: 'base' }>) => `base init · ${g.units.length} unit${g.units.length === 1 ? '' : 's'}`;
const stageLabel = ([a, b]: [number, number]) => (a === b ? `stage ${a + 1}` : `stages ${a + 1}–${b + 1}`);

/**
 * Columns, left to right, one per stage, except that runs of stages holding nothing but base units fold
 * into one column: a LinuxServer image inherits a dozen `init-*` steps from its base and the point of the
 * drawing is where this image's units slot in between them.
 */
function buildColumns(stages: InitUnit[][]): Column[] {
  const cols: Column[] = [];
  stages.forEach((units, s) => {
    const own = units.filter((u) => u.source !== 'base');
    const base = units.filter((u) => u.source === 'base');
    const last = cols[cols.length - 1];
    const lastGroup = last?.items.length === 1 && last.items[0].kind === 'base' ? last.items[0] : undefined;
    if (!own.length && base.length && lastGroup && last.stages[1] === s - 1) {
      lastGroup.units.push(...base);
      lastGroup.stages[1] = s;
      last.stages[1] = s;
      return;
    }
    const items: Item[] = own.map((u) => ({ kind: 'unit', key: u.name, unit: u, stage: s }));
    if (base.length) items.push({ kind: 'base', key: `base-${s}`, units: [...base], stages: [s, s] });
    cols.push({ items, stages: [s, s], x: 0, width: 0 });
  });
  return cols;
}

const unitWidth = (u: InitUnit) => 10 + (u.type.length * PILL_CHAR + 10) + 8 + u.name.length * CHAR + 12;
const itemWidth = (it: Item, expanded: boolean) =>
  it.kind === 'unit'
    ? unitWidth(it.unit)
    : Math.max((groupLabel(it).length + 4) * CHAR + 24, expanded ? Math.max(...it.units.map((u) => u.name.length)) * CHAR + 44 : 0);
const itemHeight = (it: Item, expanded: boolean) => (it.kind === 'base' && expanded ? NODE_H + it.units.length * ROW_H + 6 : NODE_H);

function place(columns: Column[], expanded: Set<string>) {
  const spots = new Map<string, Spot>();
  const rects = new Map<string, { x: number; y: number; w: number; h: number }>();
  let x = PAD;
  let height = 0;
  for (const col of columns) {
    col.x = x;
    col.width = Math.max(...col.items.map((it) => itemWidth(it, expanded.has(it.key))));
    let y = PAD + LABEL_H;
    for (const it of col.items) {
      const open = expanded.has(it.key);
      const h = itemHeight(it, open);
      rects.set(it.key, { x, y, w: col.width, h });
      if (it.kind === 'unit') spots.set(it.unit.name, { key: it.key, x, y, w: col.width, h, collapsed: false });
      else
        it.units.forEach((u, i) =>
          spots.set(u.name, open ? { key: it.key, x, y: y + NODE_H + i * ROW_H, w: col.width, h: ROW_H, collapsed: false } : { key: it.key, x, y, w: col.width, h, collapsed: true })
        );
      y += h + GAP_Y;
    }
    height = Math.max(height, y - GAP_Y + PAD);
    x += col.width + COL_GAP;
  }
  return { spots, rects, width: x - COL_GAP + PAD, height };
}

function edgesOf(units: InitUnit[], spots: Map<string, Spot>): Edge[] {
  const seen = new Set<string>();
  const out: Edge[] = [];
  for (const u of units) {
    const to = spots.get(u.name)!;
    for (const d of u.depends_on) {
      const from = spots.get(d);
      if (!from || from.key === to.key) continue; // missing from the bundle, or inside the same group
      const dashed = from.collapsed || to.collapsed;
      const id = `${from.collapsed ? from.key : d}→${to.collapsed ? to.key : u.name}`;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({ from, to, a: d, b: u.name, dashed });
    }
  }
  return out;
}

const curve = (e: Edge) => {
  const x1 = e.from.x + e.from.w;
  const y1 = e.from.y + e.from.h / 2;
  const x2 = e.to.x;
  const y2 = e.to.y + e.to.h / 2;
  const dx = Math.max(12, (x2 - x1) / 2);
  return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
};

// ---------------------------------------------------------------- run script

const SH_TOKEN = /("(?:[^"\\]|\\.)*"|'[^']*')|(#.*$)|(\$\{[^}]*\}|\$[A-Za-z_][A-Za-z0-9_]*|\$[0-9@#?*!$-])|(\b(?:if|then|else|elif|fi|for|in|do|done|while|until|case|esac|function|return|exit|export|local|readonly|source|unset|shift|break|continue|set)\b)/g;

/** Shell with a light touch of colour: strings, comments, variables and keywords; nothing structural. */
function ShellCode({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => {
        if (/^#!/.test(line) || /^\s*#/.test(line)) {
          return (
            <span key={i} className="block text-muted-foreground">
              {line || ' '}
            </span>
          );
        }
        const parts: React.ReactNode[] = [];
        let last = 0;
        for (const m of line.matchAll(SH_TOKEN)) {
          if (m.index! > last) parts.push(line.slice(last, m.index));
          const cls = m[1] ? 'text-[var(--raft-ok)]' : m[2] ? 'text-muted-foreground' : m[3] ? 'text-primary' : 'font-semibold text-[var(--raft-violet)]';
          parts.push(
            <span key={m.index} className={cls}>
              {m[0]}
            </span>
          );
          last = m.index! + m[0].length;
        }
        if (last < line.length) parts.push(line.slice(last));
        return (
          <span key={i} className="block">
            {parts.length ? parts : ' '}
          </span>
        );
      })}
    </>
  );
}

function TypePill({ type }: { type: string }) {
  return <span className="rounded-sm border border-[var(--raft-hair-strong)] px-1.5 py-px font-mono text-[0.625rem] text-muted-foreground uppercase">{type}</span>;
}

// ---------------------------------------------------------------- island

/**
 * The init graph from the bundle's `init_graph.units` as a left-to-right stage view: each column is a
 * topological stage (the longest dependency path below a unit), this image's units and mods are full
 * nodes, the base image's units fold into one "base init" node per run of base-only stages, expandable to
 * a compact list. Selecting a unit shows its type, dependencies and, for the image's own units, the run
 * script. A text list carries the same information for screen readers, reduced motion and narrow screens.
 */
export default function InitGraph({ units, image }: Props) {
  const { stages, stageOf, missing } = React.useMemo(() => initStages(units), [units]);
  const columns = React.useMemo(() => buildColumns(stages), [stages]);
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set());
  const [selected, setSelected] = React.useState<string | null>(null);
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => setReduced(reducedMotion()), []);
  const { spots, rects, width, height } = React.useMemo(() => place(columns, expanded), [columns, expanded]);
  const edges = React.useMemo(() => edgesOf(units, spots), [units, spots]);
  const byName = React.useMemo(() => new Map(units.map((u) => [u.name, u])), [units]);
  const dependents = React.useCallback((name: string) => units.filter((u) => u.depends_on.includes(name)).map((u) => u.name), [units]);

  const sel = selected ? byName.get(selected) : undefined;
  const related = new Set<string>(sel ? [sel.name, ...sel.depends_on, ...dependents(sel.name)] : []);
  const counts = { base: 0, image: 0, mod: 0 };
  for (const u of units) if (u.source && u.source in counts) counts[u.source as keyof typeof counts]++;
  const services = units.filter((u) => u.type === 'longrun').map((u) => u.name);

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const select = (name: string) => setSelected((cur) => (cur === name ? null : name));
  const onKey = (fn: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };
  // Accessible names start with the node's visible text, in the order it is drawn (WCAG 2.5.3).
  const describe = (u: InitUnit, prefix = u.name) => `${prefix}, ${u.type}, from ${sourceLabel(u, image)}, stage ${stageOf.get(u.name)! + 1}${u.depends_on.length ? `, after ${u.depends_on.join(', ')}` : ', starts first'}`;
  const groupEdges = (g: Extract<Item, { kind: 'base' }>) => {
    const names = new Set(g.units.map((u) => u.name));
    let within = 0;
    let into = 0;
    let out = 0;
    for (const u of units) for (const d of u.depends_on) {
      if (names.has(u.name) && names.has(d)) within++;
      else if (names.has(u.name) && byName.has(d)) into++;
      else if (names.has(d)) out++;
    }
    return { within, into, out };
  };

  const summary = `${units.length} units, ${counts.image} from this image, ${counts.base} from the base${counts.mod ? `, ${counts.mod} from mods` : ''}, in ${stages.length} stages${services.length ? `; services: ${services.join(', ')}` : ''}`;

  const list = (imageFirst: boolean) => {
    const rank = (u: InitUnit) => (u.source === 'image' ? 0 : u.source === 'mod' ? 1 : 2);
    const ordered = [...units].sort((a, b) => (imageFirst ? rank(a) - rank(b) : 0) || stageOf.get(a.name)! - stageOf.get(b.name)! || a.name.localeCompare(b.name));
    return (
      <ol className="space-y-1.5 text-sm">
        {ordered.map((u) => (
          <li key={u.name} className="flex flex-wrap items-baseline gap-x-2">
            <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground tabular-nums" aria-label={`stage ${stageOf.get(u.name)! + 1}`}>
              {stageOf.get(u.name)! + 1}
            </span>
            <button type="button" onClick={() => select(u.name)} aria-pressed={selected === u.name} className={`font-mono text-xs font-medium underline-offset-4 hover:underline ${u.source === 'image' ? 'text-primary' : u.source === 'mod' ? 'text-[var(--raft-ok)]' : ''}`}>
              {u.name}
            </button>
            <span className="font-mono text-[0.6875rem] text-muted-foreground">
              {u.type}
              {u.source && ` · ${u.source === 'image' ? image : u.source}`}
              {u.depends_on.length > 0 && ` · after ${u.depends_on.join(', ')}`}
            </span>
          </li>
        ))}
      </ol>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--raft-hair)] bg-[var(--raft-surface)] px-3.5 py-2">
        <p className="font-mono text-xs text-muted-foreground">{summary}</p>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Legend">
          {(['image', 'mod', 'base'] as const)
            .filter((s) => counts[s])
            .map((s) => (
              <li key={s} className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm" style={{ background: SOURCE_COLOR[s] }} aria-hidden="true" />
                {s === 'image' ? 'this image' : s === 'base' ? 'base image' : 'mod'}
              </li>
            ))}
          <li className="inline-flex items-center gap-1.5">
            <TypePill type="oneshot" /> runs once
          </li>
          <li className="inline-flex items-center gap-1.5">
            <TypePill type="longrun" /> service
          </li>
        </ul>
      </div>

      {!reduced && (
        <div className="hidden overflow-x-auto sm:block" tabIndex={-1}>
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="group" aria-label={`Init units by stage, left to right; select a unit for details`} className="block font-mono text-[11px]" style={{ maxWidth: columns.length <= 6 ? '100%' : undefined, height: 'auto' }}>
            <defs>
              <marker id="ig-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="var(--muted-foreground)" />
              </marker>
              <marker id="ig-arrow-hot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="var(--primary)" />
              </marker>
            </defs>
            <g aria-hidden="true">
              {columns.map((c, i) => (
                <text key={i} x={c.x} y={PAD + 11} fill="var(--muted-foreground)" style={{ fontSize: 10 }}>
                  {stageLabel(c.stages)}
                </text>
              ))}
            </g>
            <g aria-hidden="true">
              {edges.map((e, i) => {
                const hot = !!sel && (e.a === sel.name || e.b === sel.name);
                return (
                  <path
                    key={i}
                    d={curve(e)}
                    fill="none"
                    stroke={hot ? 'var(--primary)' : 'var(--raft-hair-strong)'}
                    strokeWidth={hot ? 2 : 1.25}
                    strokeDasharray={e.dashed && !hot ? '3 3' : undefined}
                    opacity={sel && !hot ? 0.35 : 1}
                    markerEnd={`url(#${hot ? 'ig-arrow-hot' : 'ig-arrow'})`}
                  />
                );
              })}
            </g>
            {columns.flatMap((col) =>
              col.items.map((it) => {
                const r = rects.get(it.key)!;
                if (it.kind === 'unit') {
                  const u = it.unit;
                  const isSel = selected === u.name;
                  const dim = sel && !related.has(u.name);
                  const color = SOURCE_COLOR[u.source ?? ''] ?? 'var(--muted-foreground)';
                  const pillW = u.type.length * PILL_CHAR + 10;
                  return (
                    <g
                      key={it.key}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSel}
                      aria-label={describe(u, `${u.type} ${u.name}`)}
                      onClick={() => select(u.name)}
                      onKeyDown={onKey(() => select(u.name))}
                      className="cursor-pointer outline-none focus-visible:[&>rect:first-of-type]:stroke-[var(--ring)] focus-visible:[&>rect:first-of-type]:stroke-2"
                      opacity={dim ? 0.65 : 1}
                      transform={`translate(${r.x},${r.y})`}
                    >
                      <rect width={r.w} height={r.h} rx={6} fill="var(--card)" stroke={isSel ? 'var(--primary)' : color} strokeWidth={isSel ? 2 : 1.25} />
                      <rect x={0} y={0} width={4} height={r.h} rx={2} fill={color} />
                      <rect x={10} y={(r.h - 14) / 2} width={pillW} height={14} rx={3} fill="var(--muted)" stroke="var(--raft-hair-strong)" />
                      <text y={r.h / 2 + 4} fill="var(--foreground)" style={{ fontSize: 11, fontWeight: 500 }}>
                        <tspan x={10 + pillW / 2} textAnchor="middle" fill="var(--muted-foreground)" style={{ fontSize: 9.5, fontWeight: 400 }}>
                          {u.type}
                        </tspan>{' '}
                        <tspan x={18 + pillW}>{u.name}</tspan>
                      </text>
                    </g>
                  );
                }
                const open = expanded.has(it.key);
                const ec = groupEdges(it);
                return (
                  <g key={it.key} transform={`translate(${r.x},${r.y})`}>
                    <rect width={r.w} height={r.h} rx={6} fill="var(--raft-surface)" stroke="var(--raft-hair-strong)" strokeDasharray={open ? undefined : '4 3'} />
                    <g
                      role="button"
                      tabIndex={0}
                      aria-expanded={open}
                      aria-label={`${groupLabel(it)} from the base image, ${stageLabel(it.stages)}; ${ec.within} dependencies between them, ${ec.into} in, ${ec.out} out. ${open ? 'Collapse' : 'Expand'}`}
                      onClick={() => toggle(it.key)}
                      onKeyDown={onKey(() => toggle(it.key))}
                      className="cursor-pointer outline-none focus-visible:[&>rect]:stroke-[var(--ring)] focus-visible:[&>rect]:stroke-2"
                    >
                      <title>{`${it.units.map((u) => u.name).join(', ')}\n${ec.within} dependencies between them, ${ec.into} in, ${ec.out} out`}</title>
                      <rect width={r.w} height={NODE_H} rx={6} fill="transparent" stroke="transparent" />
                      <rect x={0} y={0} width={4} height={NODE_H} rx={2} fill={SOURCE_COLOR.base} />
                      <text y={NODE_H / 2 + 4} fill="var(--foreground)" style={{ fontSize: 11 }}>
                        <tspan x={12} fill="var(--muted-foreground)">
                          {open ? '▾' : '▸'}
                        </tspan>{' '}
                        <tspan x={24}>{groupLabel(it)}</tspan>
                      </text>
                    </g>
                    {open &&
                      it.units.map((u, i) => {
                        const isSel = selected === u.name;
                        const dim = sel && !related.has(u.name);
                        const spans = it.stages[0] !== it.stages[1];
                        return (
                          <g
                            key={u.name}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isSel}
                            aria-label={describe(u, spans ? `stage ${stageOf.get(u.name)! + 1} ${u.name}` : u.name)}
                            onClick={() => select(u.name)}
                            onKeyDown={onKey(() => select(u.name))}
                            className="cursor-pointer outline-none focus-visible:[&>rect]:stroke-[var(--ring)] focus-visible:[&>rect]:stroke-2"
                            opacity={dim ? 0.65 : 1}
                            transform={`translate(6,${NODE_H + i * ROW_H})`}
                          >
                            <rect width={r.w - 12} height={ROW_H} rx={4} fill={isSel ? 'var(--card)' : 'transparent'} stroke={isSel ? 'var(--primary)' : 'transparent'} strokeWidth={isSel ? 1.5 : 1} />
                            <text y={ROW_H / 2 + 4} fill="var(--foreground)" style={{ fontSize: 11 }}>
                              {spans && (
                                <>
                                  <tspan x={8} fill="var(--muted-foreground)" style={{ fontSize: 9.5 }}>
                                    {stageOf.get(u.name)! + 1}
                                  </tspan>{' '}
                                </>
                              )}
                              <tspan x={spans ? 28 : 8}>{u.name}</tspan>
                            </text>
                          </g>
                        );
                      })}
                  </g>
                );
              })
            )}
          </svg>
        </div>
      )}

      {sel && (
        <div className="border-t border-[var(--raft-hair)] p-4 text-sm" role="region" aria-live="polite" aria-label={`Details of ${sel.name}`}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="font-mono text-base font-semibold">{sel.name}</h3>
            <TypePill type={sel.type} />
            <span className="font-mono text-xs text-muted-foreground">
              from {sourceLabel(sel, image)} · stage {stageOf.get(sel.name)! + 1} of {stages.length}
            </span>
            <button type="button" onClick={() => setSelected(null)} className="ml-auto font-mono text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              close
            </button>
          </div>
          <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <dt className="raft-eyebrow">s6-rc.d</dt>
              <dd className="mt-1 font-mono text-xs break-all">
                <span className="text-muted-foreground">/etc/s6-overlay/s6-rc.d/</span>
                {sel.name}/
                <span className="block text-muted-foreground">type: {sel.type}{sel.type === 'oneshot' ? ' · up: ./run' : sel.type === 'longrun' ? ' · run' : ''}</span>
              </dd>
            </div>
            <div>
              <dt className="raft-eyebrow">Runs after</dt>
              <dd className="mt-1 flex flex-wrap gap-x-2 gap-y-1 font-mono text-xs">
                {sel.depends_on.length
                  ? sel.depends_on.map((d) =>
                      byName.has(d) ? (
                        <button key={d} type="button" onClick={() => setSelected(d)} className="underline decoration-[var(--raft-hair-strong)] underline-offset-4 hover:text-primary hover:decoration-current">
                          {d}
                        </button>
                      ) : (
                        <span key={d} className="text-muted-foreground" title="Not in this image">
                          {d}
                        </span>
                      )
                    )
                  : 'nothing: a root of the graph'}
              </dd>
            </div>
            <div>
              <dt className="raft-eyebrow">Needed by</dt>
              <dd className="mt-1 flex flex-wrap gap-x-2 gap-y-1 font-mono text-xs">
                {dependents(sel.name).length
                  ? dependents(sel.name).map((d) => (
                      <button key={d} type="button" onClick={() => setSelected(d)} className="underline decoration-[var(--raft-hair-strong)] underline-offset-4 hover:text-primary hover:decoration-current">
                        {d}
                      </button>
                    ))
                  : 'nothing'}
              </dd>
            </div>
          </dl>
          {sel.script ? (
            <div className="mt-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-xs text-muted-foreground">
                  run · {sel.script.split('\n').length} lines
                </p>
                <CopyButton text={sel.script} label={`Copy the run script of ${sel.name}`} showLabel />
              </div>
              <pre className="mt-2 max-h-96 overflow-auto rounded-md border border-[var(--raft-hair)] bg-[var(--raft-code-bg)] p-3 font-mono text-xs leading-relaxed" tabIndex={0} aria-label={`Run script of ${sel.name}`}>
                <code>
                  <ShellCode text={sel.script} />
                </code>
              </pre>
            </div>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">
              {sel.source === 'base' ? 'Defined in the base image.' : 'No script for this unit.'}
            </p>
          )}
        </div>
      )}

      <div className={`${reduced ? '' : 'sm:hidden'} border-t border-[var(--raft-hair)] px-4 py-3`}>
        <p className="mb-3 font-mono text-xs text-muted-foreground">Start order, this image’s units first</p>
        {list(true)}
      </div>
      {!reduced && (
        <details className="hidden border-t border-[var(--raft-hair)] px-4 py-3 sm:block">
          <summary className="cursor-pointer font-mono text-xs text-muted-foreground hover:text-foreground">Start order as a list</summary>
          <div className="mt-3">{list(false)}</div>
        </details>
      )}
      {missing.size > 0 && (
        <p className="border-t border-[var(--raft-hair)] px-4 py-2 font-mono text-[0.6875rem] text-muted-foreground">
          Dependencies not in this image: {[...missing].join(', ')}
        </p>
      )}
    </div>
  );
}
