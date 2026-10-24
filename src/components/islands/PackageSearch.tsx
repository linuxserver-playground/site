import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { PackageData, PackageIndexEntry } from '@/lib/hub';
import { fetchMaybeGzipJSON } from '@/lib/explorer';

interface Props {
  index: PackageIndexEntry[];
  ecosystems: { type: string; count: number }[];
  /** `${HUB_URL}/api/v1/packages/` */
  apiBase: string;
  /** Base path for image links. */
  base: string;
}

const PAGE = 60;

/**
 * Fleet-wide package search over the hub's package index (snapshotted). Selecting a package fetches
 * `/api/v1/packages/{slug}.json` from the hub for every image, tag and architecture that ships it. The
 * query lives in the URL (?q=) so results can be linked to.
 */
export default function PackageSearch({ index, ecosystems, apiBase, base }: Props) {
  const [q, setQ] = React.useState('');
  const [type, setType] = React.useState('');
  const [limit, setLimit] = React.useState(PAGE);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [detail, setDetail] = React.useState<{ status: 'idle' | 'loading' | 'ready' | 'error'; data?: PackageData; error?: string }>({ status: 'idle' });
  const ready = React.useRef(false);
  const id = React.useId();

  React.useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const initial = p.get('q') ?? '';
    setQ(initial);
    setType(p.get('type') ?? '');
    const exact = index.find((e) => e.slug === initial || e.name === initial);
    if (exact) setSelected(exact.slug);
    ready.current = true;
  }, [index]);

  React.useEffect(() => {
    if (!ready.current) return;
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (type) p.set('type', type);
    const qs = p.toString();
    history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [q, type]);

  React.useEffect(() => {
    if (!selected) {
      setDetail({ status: 'idle' });
      return;
    }
    const ctrl = new AbortController();
    setDetail({ status: 'loading' });
    fetchMaybeGzipJSON<{ data: PackageData }>(`${apiBase}${encodeURIComponent(selected)}.json`, ctrl.signal)
      .then((r) => setDetail({ status: 'ready', data: r.data }))
      .catch((e) => !ctrl.signal.aborted && setDetail({ status: 'error', error: e instanceof Error ? e.message : String(e) }));
    return () => ctrl.abort();
  }, [selected, apiBase]);

  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const results = React.useMemo(() => {
    const list = index.filter((e) => (!type || e.types.includes(type)) && terms.every((t) => e.name.toLowerCase().includes(t)));
    if (terms.length) {
      const t0 = terms[0];
      list.sort((a, b) => rank(a.name, t0) - rank(b.name, t0) || b.images - a.images || a.name.localeCompare(b.name));
    } else list.sort((a, b) => b.images - a.images || a.name.localeCompare(b.name));
    return list;
  }, [index, type, terms.join(' ')]);

  const d = detail.data;
  const holdersByImage = React.useMemo(() => {
    const m = new Map<string, PackageData['holders']>();
    for (const h of d?.holders ?? []) m.set(h.image, [...(m.get(h.image) ?? []), h]);
    return [...m].sort((a, b) => a[0].localeCompare(b[0]));
  }, [d]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <div className="min-w-0">
        <div className="raft-panel flex flex-wrap items-center gap-2 p-2">
          <div className="relative min-w-0 flex-1 basis-40">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <label htmlFor={`${id}-q`} className="sr-only">
              Search packages
            </label>
            <Input id={`${id}-q`} type="search" value={q} onChange={(e) => (setQ(e.target.value), setLimit(PAGE))} placeholder={`Search ${index.length.toLocaleString('en-GB')} packages…`} autoComplete="off" spellCheck={false} className="h-9 pl-8" />
          </div>
          <label className="text-sm text-muted-foreground">
            <span className="sr-only">Ecosystem</span>
            <select value={type} onChange={(e) => (setType(e.target.value), setLimit(PAGE))} className="h-9 max-w-[9rem] rounded-md border border-input bg-transparent px-2 font-mono text-xs text-foreground">
              <option value="">all types</option>
              {ecosystems.map((e) => (
                <option key={e.type} value={e.type}>
                  {e.type} ({e.count})
                </option>
              ))}
            </select>
          </label>
        </div>
        <p role="status" aria-live="polite" className="mt-3 px-1 font-mono text-xs text-muted-foreground">
          {results.length.toLocaleString('en-GB')} package{results.length === 1 ? '' : 's'}
          {type && ` of type ${type}`}
        </p>
        <ul className="raft-panel mt-2 max-h-[32rem] divide-y divide-[var(--raft-hair)] overflow-y-auto" aria-label="Packages">
          {results.slice(0, limit).map((e) => {
            const on = selected === e.slug;
            return (
              <li key={e.slug}>
                <button
                  type="button"
                  onClick={() => setSelected(on ? null : e.slug)}
                  aria-pressed={on}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${on ? 'bg-accent text-accent-foreground' : ''}`}
                >
                  <span className="min-w-0 flex-1 truncate font-mono text-xs">{e.name}</span>
                  <span className="shrink-0 font-mono text-[0.6875rem] text-muted-foreground">{e.types.join(', ')}</span>
                  <span className="w-6 shrink-0 text-right font-mono text-xs tabular-nums" aria-label={`${e.images} images`}>
                    {e.images}
                  </span>
                </button>
              </li>
            );
          })}
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted-foreground">No package matches.</li>}
          {results.length > limit && (
            <li className="p-2 text-center">
              <button type="button" onClick={() => setLimit((l) => l + PAGE * 4)} className="inline-flex h-8 items-center rounded-md border border-[var(--raft-hair-strong)] px-3 text-sm hover:bg-muted">
                Show more
              </button>
            </li>
          )}
        </ul>
      </div>

      <div className="min-w-0">
        {!selected && (
          <div className="raft-panel grid min-h-64 place-items-center p-8 text-center text-sm text-muted-foreground">
            <p>Pick a package to see every image that ships it, with the version per release tag and architecture.</p>
          </div>
        )}
        {selected && detail.status === 'loading' && (
          <div className="raft-panel grid min-h-64 place-items-center p-8 text-center text-sm text-muted-foreground" role="status" aria-live="polite">
            <p>Loading {selected} from the hub…</p>
          </div>
        )}
        {selected && detail.status === 'error' && (
          <div className="raft-panel grid min-h-64 place-items-center gap-2 p-8 text-center text-sm" role="alert">
            <p>Could not load {selected}.</p>
            <p className="font-mono text-xs text-muted-foreground">{detail.error}</p>
            <a href={`${apiBase}${encodeURIComponent(selected)}.json`} className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline" target="_blank" rel="noopener">
              Open the API document<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        )}
        {selected && detail.status === 'ready' && d && (
          <div className="raft-panel">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--raft-hair)] p-4">
              <div className="min-w-0">
                <h2 className="font-mono text-lg font-semibold break-all">{d.name}</h2>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {d.types.join(', ')} · {d.images.length} image{d.images.length === 1 ? '' : 's'} · {d.versions.length} version{d.versions.length === 1 ? '' : 's'}
                </p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close package details">
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className="border-b border-[var(--raft-hair)] p-4">
              <h3 className="raft-eyebrow">Versions shipped</h3>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {d.versions.map((v) => (
                  <li key={v} className="rounded border border-[var(--raft-hair)] px-1.5 py-px font-mono text-xs">
                    {v}
                  </li>
                ))}
              </ul>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[var(--raft-hair)] font-mono text-[0.6875rem] text-muted-foreground uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-2 font-normal">
                      Image
                    </th>
                    <th scope="col" className="px-4 py-2 font-normal">
                      Build
                    </th>
                    <th scope="col" className="px-4 py-2 font-normal">
                      Arch
                    </th>
                    <th scope="col" className="px-4 py-2 font-normal">
                      Version
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--raft-hair)]">
                  {holdersByImage.flatMap(([image, hs]) =>
                    hs.map((h, i) => (
                      <tr key={`${image}-${h.tag}-${h.arch}`}>
                        <td className="px-4 py-1.5 font-mono text-xs">
                          {i === 0 && (
                            <a href={`${base}/images/${image}/`} className="text-foreground underline-offset-4 hover:text-primary hover:underline">
                              {image}
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-1.5 font-mono text-xs">
                          <a href={`${base}/images/${image}/builds/${h.tag}/`} className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                            {h.tag}
                          </a>
                          <span className="ml-2 text-[0.6875rem] text-muted-foreground">{h.branch}</span>
                        </td>
                        <td className="px-4 py-1.5 font-mono text-xs text-muted-foreground">{h.arch}</td>
                        <td className="px-4 py-1.5 font-mono text-xs" title={h.purl ?? undefined}>
                          {h.version} <span className="text-muted-foreground">({h.type})</span>
                        </td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>
            <p className="border-t border-[var(--raft-hair)] px-4 py-2 font-mono text-[0.6875rem] text-muted-foreground">
              <a href={`${apiBase}${encodeURIComponent(d.slug)}.json`} className="underline-offset-4 hover:text-foreground hover:underline" target="_blank" rel="noopener">
                api/v1/packages/{d.slug}.json<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/** 0 exact, 1 prefix, 2 contains. */
function rank(name: string, term: string): number {
  const n = name.toLowerCase();
  return n === term ? 0 : n.startsWith(term) ? 1 : 2;
}
