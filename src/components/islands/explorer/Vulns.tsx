/**
 * Vulnerabilities of one build: the scan the build made of itself when it was released (grype, with that day's
 * database), never rescanned. Informal data for readers who look for it, so it sits below the CI report, closed.
 * The counts come with the page (the hub's `vulnerabilities`); the findings are the build's `vulns.json` on its
 * image repository's Pages (`links.vulns`), fetched in the browser the first time the section is opened, with a
 * loading state and a retry. Never fetched at site build time. Renders nothing for a build without a scan.
 */
import * as React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { AnchorHeading } from '@/components/build/BuildParts';
import { LoadError, Loading } from '@/components/islands/explorer/ArchToggle';
import type { VulnMatch, VulnSummary, VulnsData } from '@/lib/hub';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

const ORDER = ['critical', 'high', 'medium', 'low', 'negligible', 'unknown'] as const;
const rank = (s: string) => {
  const i = (ORDER as readonly string[]).indexOf(s.toLowerCase());
  return i === -1 ? ORDER.length : i;
};
// Severity is the border and the tint; the text stays the foreground colour, so every chip meets 7:1 in both themes.
const SEV: Record<string, string> = {
  critical: 'border-[var(--raft-danger)]/60 bg-[var(--raft-danger)]/10 text-foreground',
  high: 'border-[var(--raft-danger)]/40 bg-[var(--raft-danger)]/5 text-foreground',
  medium: 'border-[var(--raft-amber)]/50 bg-[var(--raft-amber)]/10 text-foreground',
  low: 'border-[var(--raft-hair-strong)] text-foreground',
  negligible: 'border-[var(--raft-hair)] text-muted-foreground',
  unknown: 'border-[var(--raft-hair)] text-muted-foreground',
};
const CHIP = 'inline-flex h-6 items-center gap-1 rounded-md border px-1.5 font-mono text-[0.6875rem]';

type State = { status: 'idle' | 'loading' | 'ready' | 'missing' | 'error'; data?: VulnsData; error?: string };

/** The hub served the same document inside its API envelope before the scans moved to the repositories' Pages. */
function unwrap(j: unknown): VulnsData | null {
  const d = ((j as { data?: unknown })?.data ?? j) as VulnsData | null;
  return d && Array.isArray(d.matches) && d.summary ? d : null;
}

export default function Vulns({ url, summary, image, tag }: { url: string | null | undefined; summary?: VulnSummary | null; image: string; tag: string }) {
  const [open, setOpen] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);
  const [state, setState] = React.useState<State>({ status: 'idle' });
  const details = React.useRef<HTMLDetailsElement>(null);

  // A reader can open the section before the island hydrates (it hydrates when visible): pick that up.
  React.useEffect(() => {
    if (details.current?.open) setOpen(true);
  }, []);

  React.useEffect(() => {
    if (!open || !url) return;
    const ctrl = new AbortController();
    setState({ status: 'loading' });
    fetch(url, { signal: ctrl.signal })
      .then(async (r) => {
        if (r.status === 404) return setState({ status: 'missing' });
        if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
        const d = unwrap(await r.json());
        if (!d) throw new Error('not a vulnerability scan');
        setState({ status: 'ready', data: d });
      })
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setState({ status: 'error', error: e.message });
      });
    return () => ctrl.abort();
  }, [open, url, attempt]);

  if (!url) return null;
  const s = state.data?.summary ?? summary ?? null;
  const total = state.data ? state.data.matches.length : s ? ORDER.reduce((n, k) => n + (s[k] ?? 0), 0) : null;
  const data = state.data;

  return (
    <section aria-labelledby="vulns" className="scroll-mt-24" id="vulns-section">
      <AnchorHeading id="vulns">Vulnerabilities</AnchorHeading>
      <p className="mt-2 text-sm text-muted-foreground">
        Scanned when the image was built{data?.db_date ? `, with the vulnerability database of ${formatDate(data.db_date)}` : ''}: the image as it was released, not a current assessment.
      </p>
      <details ref={details} className="raft-panel group mt-4 overflow-hidden" onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}>
        <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40">
          <span className="font-mono text-xs text-muted-foreground">
            {total === null ? 'Findings' : `${total} ${total === 1 ? 'finding' : 'findings'}`}
            {s ? ` · ${s.fixed} fixable · ${s.unfixed} without a fix` : ''}
          </span>
          <span className="flex flex-wrap items-center gap-1.5">
            {s &&
              ORDER.filter((k) => (s[k] ?? 0) > 0).map((k) => (
                <span key={k} className={cn(CHIP, SEV[k])}>
                  {k} {s[k]}
                </span>
              ))}
            <span className="ml-1 inline-block transition-transform group-open:rotate-90" aria-hidden="true">
              ▸
            </span>
          </span>
        </summary>
        <div className="border-t border-[var(--raft-hair)]">
          {(state.status === 'idle' || state.status === 'loading') && <Loading what="the findings" />}
          {state.status === 'error' && <LoadError error={state.error ?? 'unknown error'} url={url} retry={() => setAttempt((a) => a + 1)} />}
          {state.status === 'missing' && (
            <p className="px-4 py-6 text-sm text-muted-foreground" role="status">
              The scan of {image} {tag} is not published on its repository's Pages, which keep the newest five builds of each branch.
            </p>
          )}
          {state.status === 'ready' && data && <Findings data={data} image={image} tag={tag} />}
        </div>
      </details>
    </section>
  );
}

function Findings({ data, image, tag }: { data: VulnsData; image: string; tag: string }) {
  const isFixed = (m: VulnMatch) => (m.fix_state ?? '').toLowerCase() === 'fixed';
  const fixable = data.matches.filter(isFixed);
  const unfixed = data.matches.filter((m) => !isFixed(m));
  const scanned = data.scanned_at ? ` on ${formatDate(data.scanned_at)}` : '';
  return (
    <>
      <p className="px-4 py-3 text-xs text-muted-foreground">
        {image} {tag}, scanned{scanned} with grype{data.grype_version ? ` ${data.grype_version}` : ''}
        {data.db_date ? ` and the vulnerability database of ${formatDate(data.db_date)}` : ''}. Findings match package versions only; reachability is not assessed.
      </p>
      <Group title="Fixable" matches={fixable} note="Fixed in a newer package version." />
      <Group title="No fix available" matches={unfixed} note="No fix released by the distribution." muted />
      {data.caveats?.length ? (
        <div className="border-t border-[var(--raft-hair)] px-4 py-3">
          <h3 className="text-sm font-semibold">Reading these numbers</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
            {data.caveats.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

function fixedIn(m: VulnMatch): string[] {
  const v = m.fixed_in;
  return Array.isArray(v) ? v : v ? [v] : [];
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
          {groups.map(([k, list]) => {
            const fixes = [...new Set(list.flatMap(fixedIn))];
            const arches = [...new Set(list.flatMap((m) => m.arches ?? []))];
            return (
              <li key={k} className="px-4 py-2.5">
                <p className="flex flex-wrap items-baseline gap-x-2 font-mono text-xs">
                  <span className="font-medium">{list[0].package}</span>
                  <span className="text-muted-foreground">{list[0].version}</span>
                  {list[0].type && <span className="text-[0.6875rem] text-muted-foreground">{list[0].type}</span>}
                  {arches.length === 1 && <span className="text-[0.6875rem] text-muted-foreground">{arches[0]} only</span>}
                  {!muted && fixes.length > 0 && <span className="text-[0.6875rem] text-[var(--raft-ok)]">fixed in {fixes.join(', ')}</span>}
                </p>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {[...list]
                    .sort((a, b) => rank(a.severity) - rank(b.severity) || a.id.localeCompare(b.id))
                    .map((m) => {
                      const href = m.urls?.[0];
                      const cls = cn(CHIP, SEV[m.severity.toLowerCase()] ?? SEV.unknown);
                      return (
                        <li key={m.id}>
                          {href ? (
                            <a href={href} target="_blank" rel="noopener" className={cn(cls, 'hover:underline')}>
                              {m.id} <span>{m.severity.toLowerCase()}</span>
                              <ArrowUpRight className="size-3 opacity-70" aria-hidden="true" />
                              <span className="sr-only">(opens in a new tab)</span>
                            </a>
                          ) : (
                            <span className={cls}>
                              {m.id} <span>{m.severity.toLowerCase()}</span>
                            </span>
                          )}
                        </li>
                      );
                    })}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
