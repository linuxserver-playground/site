/**
 * Vulnerabilities of one build from the hub's `vulns.json`, fetched in the browser: a collapsible with
 * the severity summary, fixable findings grouped by package, then the ones without a fix behind a caveat.
 * Renders nothing at all when the hub does not serve the document for this build.
 */
import * as React from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { VulnMatch, VulnsData } from '@/lib/hub';
import { cn } from '@/lib/utils';

const ORDER = ['critical', 'high', 'medium', 'low', 'negligible', 'unknown'];
const rank = (s: string) => {
  const i = ORDER.indexOf(s.toLowerCase());
  return i === -1 ? ORDER.length : i;
};
const SEV: Record<string, string> = {
  critical: 'text-[var(--raft-danger)] border-destructive/40 dark:bg-destructive/15',
  high: 'text-[var(--raft-danger)] border-destructive/30 dark:bg-destructive/10',
  medium: 'text-[var(--raft-amber)] border-[var(--raft-amber)]/35 dark:bg-[var(--raft-amber)]/12',
  low: 'border-[var(--raft-hair-strong)] text-foreground',
  negligible: 'border-[var(--raft-hair)] text-muted-foreground',
  unknown: 'border-[var(--raft-hair)] text-muted-foreground',
};

export default function Vulns({ url, image, tag }: { url: string; image: string; tag: string }) {
  const [data, setData] = React.useState<VulnsData | null>(null);
  const [state, setState] = React.useState<'loading' | 'ok' | 'absent'>('loading');

  React.useEffect(() => {
    const ctrl = new AbortController();
    fetch(url, { signal: ctrl.signal })
      .then(async (r) => {
        if (!r.ok) return setState('absent');
        const j = (await r.json()) as { data?: VulnsData } & Partial<VulnsData>;
        const d = (j.data ?? j) as VulnsData;
        if (!d || !Array.isArray(d.matches)) return setState('absent');
        setData(d);
        setState('ok');
      })
      .catch((e) => {
        if ((e as Error).name !== 'AbortError') setState('absent');
      });
    return () => ctrl.abort();
  }, [url]);

  if (state !== 'ok' || !data) return null;

  const isFixed = (m: VulnMatch) => (m.fix_state ?? '').toLowerCase() === 'fixed' || !!m.fixed_in;
  const fixable = data.matches.filter(isFixed);
  const unfixed = data.matches.filter((m) => !isFixed(m));
  const s = data.summary;
  const total = data.matches.length;

  return (
    <section aria-labelledby="vulns" className="scroll-mt-24" id="vulns-section">
      <details className="raft-panel group overflow-hidden">
        <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40">
          <span className="flex flex-wrap items-center gap-3">
            <h2 id="vulns" className="text-base font-semibold tracking-tight">
              Vulnerabilities
            </h2>
            <span className="font-mono text-xs text-muted-foreground">
              {total} {total === 1 ? 'finding' : 'findings'} · {s.fixed} fixable · {s.unfixed} without a fix
            </span>
          </span>
          <span className="flex flex-wrap items-center gap-1.5">
            {ORDER.filter((k) => (s as unknown as Record<string, number>)[k] > 0).map((k) => (
              <span key={k} className={cn('inline-flex h-6 items-center gap-1 rounded-md border px-1.5 font-mono text-[0.6875rem]', SEV[k])}>
                {k} {(s as unknown as Record<string, number>)[k]}
              </span>
            ))}
            <span className="ml-1 inline-block transition-transform group-open:rotate-90" aria-hidden="true">
              ▸
            </span>
          </span>
        </summary>
        <div className="border-t border-[var(--raft-hair)]">
          <p className="px-4 py-3 text-xs text-muted-foreground">
            Scanned from the SBOM of {image} {tag}
            {data.scanner ? ` with ${data.scanner}` : ''}
            {data.db_date ? `, vulnerability database of ${data.db_date}` : ''}. A finding names a package version the database flags; whether it is reachable in this container is not assessed.
          </p>
          <Group title="Fixable" matches={fixable} note="A newer version of the package fixes these; they go away when the base image or the upstream application updates." />
          <Group title="No fix available" matches={unfixed} note="The distribution has not shipped a fix for these yet (or has decided not to). They cannot be removed by rebuilding and are listed for completeness, not as something to act on here." muted />
        </div>
      </details>
    </section>
  );
}

function Group({ title, matches, note, muted = false }: { title: string; matches: VulnMatch[]; note: string; muted?: boolean }) {
  const byPkg = new Map<string, VulnMatch[]>();
  for (const m of matches) {
    const k = `${m.package}@${m.version ?? ''}`;
    (byPkg.get(k) ?? byPkg.set(k, []).get(k)!).push(m);
  }
  const groups = [...byPkg.entries()].sort((a, b) => Math.min(...a[1].map((m) => rank(m.severity))) - Math.min(...b[1].map((m) => rank(m.severity))) || a[0].localeCompare(b[0]));
  return (
    <div className="border-t border-[var(--raft-hair)]">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-4 pt-3 pb-1">
        <h3 className={cn('text-sm font-semibold', muted && 'text-muted-foreground')}>
          {title} <span className="font-mono text-xs font-normal text-muted-foreground">{matches.length}</span>
        </h3>
      </div>
      <p className="px-4 pb-2 text-xs text-muted-foreground">{note}</p>
      {groups.length === 0 ? (
        <p className="px-4 pb-4 text-xs text-muted-foreground">None.</p>
      ) : (
        <ul className="divide-y divide-[var(--raft-hair)] border-t border-[var(--raft-hair)]">
          {groups.map(([k, list]) => (
            <li key={k} className="px-4 py-2.5">
              <p className="flex flex-wrap items-baseline gap-x-2 font-mono text-xs">
                <span className="font-medium">{list[0].package}</span>
                <span className="text-muted-foreground">{list[0].version}</span>
                {list[0].type && <span className="text-[0.6875rem] text-muted-foreground">{list[0].type}</span>}
                {!muted && list.some((m) => m.fixed_in) && <span className="text-[0.6875rem] text-[var(--raft-ok)]">fixed in {[...new Set(list.map((m) => m.fixed_in).filter(Boolean))].join(', ')}</span>}
              </p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {[...list]
                  .sort((a, b) => rank(a.severity) - rank(b.severity) || a.id.localeCompare(b.id))
                  .map((m) => {
                    const href = m.urls?.[0];
                    const cls = cn('inline-flex h-6 items-center gap-1 rounded-md border px-1.5 font-mono text-[0.6875rem]', SEV[m.severity.toLowerCase()] ?? SEV.unknown);
                    return (
                      <li key={m.id}>
                        {href ? (
                          <a href={href} target="_blank" rel="noopener" className={cn(cls, 'hover:underline')}>
                            {m.id} <span className="opacity-80">{m.severity.toLowerCase()}</span>
                            <ArrowUpRight className="size-3 opacity-70" aria-hidden="true" />
                            <span className="sr-only">(opens in a new tab)</span>
                          </a>
                        ) : (
                          <span className={cls}>
                            {m.id} <span className="opacity-80">{m.severity.toLowerCase()}</span>
                          </span>
                        )}
                      </li>
                    );
                  })}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
