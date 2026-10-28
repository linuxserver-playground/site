import * as React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Arch, Package, PackagesData } from '@/lib/hub';
import { fetchMaybeGzipJSON } from '@/lib/explorer';
import ArchToggle, { IslandHeader, LoadError, Loading } from './ArchToggle';

interface Props {
  image: string;
  tag: string;
  arches: Arch[];
  /** `/api/v1/catalog/{image}/builds/{tag}/packages.{arch}.json` per architecture (newest build of a branch only). */
  urls: Partial<Record<Arch, string>>;
  /** Package counts from the bundle, shown before (and without) the full table. */
  summary: Partial<Record<Arch, { count: number; distro: string; by_type?: Record<string, number> | null }>>;
  /** The build's syft document on the repository's Pages, linked when the hub has no table (older builds). */
  sbom?: Partial<Record<Arch, string>>;
  /** Base URL for the fleet-wide package pages, with trailing slash. */
  packagesBase: string;
  initialArch?: Arch;
}

const PAGE = 100;

/**
 * The package table of one build: search by name, filter by ecosystem, see version, licences and purl.
 * The summary counts are server-rendered from the bundle; the table itself is fetched from the hub when
 * the island is opened.
 */
export default function PackageBrowser({ image, tag, arches, urls, summary, sbom, packagesBase, initialArch }: Props) {
  const [arch, setArch] = React.useState<Arch>(initialArch ?? arches[0]);
  const [state, setState] = React.useState<{ status: 'idle' | 'loading' | 'ready' | 'error'; data?: PackagesData; error?: string }>({ status: 'idle' });
  const [q, setQ] = React.useState('');
  const [type, setType] = React.useState('');
  const [limit, setLimit] = React.useState(PAGE);
  const [attempt, setAttempt] = React.useState(0);
  const id = React.useId();

  React.useEffect(() => {
    const url = urls[arch];
    if (!url) {
      setState({ status: 'idle' });
      return;
    }
    const ctrl = new AbortController();
    setState({ status: 'loading' });
    fetchMaybeGzipJSON<{ data: PackagesData }>(url, ctrl.signal)
      .then((r) => setState({ status: 'ready', data: r.data }))
      .catch((e) => !ctrl.signal.aborted && setState({ status: 'error', error: e instanceof Error ? e.message : String(e) }));
    return () => ctrl.abort();
  }, [arch, urls, attempt]);

  const all = state.data?.packages ?? [];
  const types = React.useMemo(() => {
    const m = new Map<string, number>();
    for (const p of all) m.set(p.type, (m.get(p.type) ?? 0) + 1);
    return [...m].sort((a, b) => b[1] - a[1]);
  }, [all]);
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const rows = React.useMemo(
    () =>
      all
        .filter((p) => (!type || p.type === type) && terms.every((t) => p.name.toLowerCase().includes(t) || p.version.toLowerCase().includes(t) || p.licenses.join(' ').toLowerCase().includes(t)))
        .sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version)),
    [all, type, terms.join(' ')],
  );
  const s = summary[arch];

  const slug = (p: Package) => p.name.replace(/[^A-Za-z0-9._-]+/g, '-');

  return (
    <div>
      <IslandHeader title={`packages.${arch}.json · ${s ? `${s.count.toLocaleString('en-GB')} packages · ${s.distro}` : tag}`} note="Click a package to see every image that ships it.">
        <ArchToggle arches={arches} value={arch} onChange={setArch} />
      </IslandHeader>

      {s?.by_type && (
        <ul className="flex flex-wrap gap-2 border-b border-[var(--raft-hair)] px-3.5 py-2.5 font-mono text-xs" aria-label="Packages by ecosystem">
          {Object.entries(s.by_type)
            .sort((a, b) => b[1] - a[1])
            .map(([t, n]) => (
              <li key={t}>
                <button
                  type="button"
                  onClick={() => setType(type === t ? '' : t)}
                  aria-pressed={type === t}
                  disabled={state.status !== 'ready'}
                  className="rounded-md border border-[var(--raft-hair)] px-2 py-0.5 text-muted-foreground hover:border-[var(--raft-hair-strong)] hover:text-foreground aria-pressed:border-primary aria-pressed:text-foreground disabled:cursor-default"
                >
                  {t} <span className="text-foreground">{n.toLocaleString('en-GB')}</span>
                </button>
              </li>
            ))}
        </ul>
      )}

      {state.status === 'idle' && (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          <p>The package table is available for the newest build of each branch.</p>
          {sbom?.[arch] && (
            <p className="mt-2">
              <a href={sbom[arch]} className="underline underline-offset-4 decoration-[var(--raft-hair-strong)] hover:text-foreground hover:decoration-current" target="_blank" rel="noopener">
                SBOM for this build (syft JSON, gzipped)<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </p>
          )}
        </div>
      )}
      {state.status === 'loading' && <Loading what={`the ${arch} package table`} />}
      {state.status === 'error' && <LoadError error={state.error ?? 'unknown error'} url={urls[arch]} retry={() => setAttempt((a) => a + 1)} />}

      {state.status === 'ready' && (
        <>
          <div className="flex flex-wrap items-center gap-2 border-b border-[var(--raft-hair)] p-2">
            <div className="relative min-w-0 flex-1 basis-56">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <label htmlFor={`${id}-q`} className="sr-only">
                Filter packages
              </label>
              <Input id={`${id}-q`} type="search" value={q} onChange={(e) => (setQ(e.target.value), setLimit(PAGE))} placeholder={`Filter ${all.length.toLocaleString('en-GB')} packages…`} autoComplete="off" spellCheck={false} className="h-9 pl-8" />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="sr-only">Ecosystem</span>
              <select value={type} onChange={(e) => (setType(e.target.value), setLimit(PAGE))} className="h-9 rounded-md border border-input bg-transparent px-2 font-mono text-xs text-foreground">
                <option value="">all ecosystems</option>
                {types.map(([t, n]) => (
                  <option key={t} value={t}>
                    {t} ({n})
                  </option>
                ))}
              </select>
            </label>
            <p role="status" aria-live="polite" className="ml-auto font-mono text-xs text-muted-foreground">
              {rows.length.toLocaleString('en-GB')} shown
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--raft-hair)] font-mono text-[0.6875rem] text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="px-3 py-2 font-normal">
                    Package
                  </th>
                  <th scope="col" className="px-3 py-2 font-normal">
                    Version
                  </th>
                  <th scope="col" className="px-3 py-2 font-normal">
                    Type
                  </th>
                  <th scope="col" className="hidden px-3 py-2 font-normal md:table-cell">
                    Licences
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--raft-hair)]">
                {rows.slice(0, limit).map((p) => (
                  <tr key={`${p.type}:${p.name}@${p.version}`}>
                    <td className="px-3 py-1.5 font-mono text-xs">
                      <a href={`${packagesBase}?q=${encodeURIComponent(slug(p))}`} className="text-foreground underline-offset-4 hover:text-primary hover:underline" title={p.purl ?? undefined}>
                        {p.name}
                      </a>
                    </td>
                    <td className="px-3 py-1.5 font-mono text-xs text-muted-foreground">{p.version}</td>
                    <td className="px-3 py-1.5 font-mono text-xs text-muted-foreground">{p.type}</td>
                    <td className="hidden max-w-[20rem] truncate px-3 py-1.5 text-xs text-muted-foreground md:table-cell" title={p.licenses.join(', ')}>
                      {p.licenses.join(', ') || '–'}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-sm text-muted-foreground">
                      No package matches.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {rows.length > limit && (
            <div className="border-t border-[var(--raft-hair)] p-2 text-center">
              <button type="button" onClick={() => setLimit((l) => l + PAGE * 4)} className="inline-flex h-8 items-center rounded-md border border-[var(--raft-hair-strong)] px-3 text-sm hover:bg-muted">
                Show {Math.min(PAGE * 4, rows.length - limit)} more
              </button>
            </div>
          )}
          <p className="border-t border-[var(--raft-hair)] px-3.5 py-2 font-mono text-[0.6875rem] text-muted-foreground">
            <a href={urls[arch]} className="underline underline-offset-4 decoration-[var(--raft-hair-strong)] hover:text-foreground hover:decoration-current" target="_blank" rel="noopener">
              {image}:{tag} packages.{arch}.json<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </>
      )}
    </div>
  );
}
