/**
 * The open Labs proposals, on the Labs home page, for signed-in team members only (workspace docs/labs.md: anyone can
 * file a proposal, so the site does not advertise them; hiding them is presentation only, the issues are public on
 * GitHub). Reads `/api/me` and then the control plane's public `/api/issues.json`, filtered to the proposals
 * repository. Signed out, or before `/api/me` answers, it renders nothing at all: the header's sign-in is the only
 * invitation.
 */
import * as React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useControl, useMe, type Issue, type IssuesPage } from '@/lib/control';
import { Empty, ExtLink, Offline, Pager, Pill, Rel, Skeleton, usePaged } from '@/components/islands/fleet/shared';
import type { Tone } from '@/lib/control';

/** What the proposal check and the team's labels say; `proposal` is on every one, so it is left out. */
const LABEL_TONE: Record<string, Tone> = { 'meets-bar': 'ok', 'needs-info': 'warn', accepted: 'live' };
const LABEL_TEXT: Record<string, string> = { 'meets-bar': 'meets the bar', 'needs-info': 'needs info' };

export default function Proposals({ repo, fallback }: { repo: string; fallback: string }) {
  const me = useMe();
  const member = !!me?.authenticated && me.member;
  const { data, error, loading, reload } = useControl<IssuesPage>(member ? 'issues.json' : null, ['issues']);
  const proposals = React.useMemo<Issue[]>(
    () =>
      (data?.issues ?? [])
        .filter((i) => i.repo.toLowerCase() === repo.toLowerCase() && i.state === 'open')
        .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)),
    [data, repo],
  );
  const { top, visible, pager } = usePaged<Issue, HTMLElement>(proposals, 10);

  if (!member) return null;

  return (
    <section ref={top} className="raft-container scroll-mt-24 pt-20" aria-labelledby="proposals">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="raft-eyebrow">
            <span className="text-primary" aria-hidden="true">
              //
            </span>{' '}
            Team only
          </p>
          <h2 id="proposals" className="mt-2 text-2xl font-semibold tracking-tight md:text-[2rem] md:leading-tight">
            Open proposals
          </h2>
          <p className="mt-3 text-muted-foreground">
            Shown to you because you are signed in as a team member. The first check labels each one; try those that meet the bar, and elevate the ones that work.
          </p>
        </div>
        <a href={`https://github.com/${repo}/issues`} target="_blank" rel="noopener" className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary">
          All proposals on GitHub <ArrowUpRight className="size-4" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>

      <div className="raft-panel mt-8 overflow-hidden">
        {!data && loading ? (
          <Skeleton rows={3} label="Loading the open proposals…" />
        ) : !data && error ? (
          <Offline error={error} retry={reload} fallback={{ label: 'Open the issues on the control plane', href: fallback }} />
        ) : proposals.length === 0 ? (
          <Empty>No proposal is open right now.</Empty>
        ) : (
          <>
            <ul className="divide-y divide-[var(--raft-hair)]">
              {visible.map((i) => {
                const labels = i.labels.filter((l) => l !== 'proposal');
                return (
                  <li key={i.number} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      {i.html_url ? (
                        <ExtLink href={i.html_url} className="font-medium [overflow-wrap:anywhere] text-foreground">
                          {i.title}
                        </ExtLink>
                      ) : (
                        <span className="font-medium [overflow-wrap:anywhere]">{i.title}</span>
                      )}
                      <p className="mt-0.5 font-mono text-[0.6875rem] text-muted-foreground">
                        #{i.number} · {i.author ?? 'unknown'} · opened <Rel iso={i.created_at} />
                      </p>
                    </div>
                    {labels.length > 0 && (
                      <span className="flex shrink-0 flex-wrap gap-1">
                        {labels.map((l) => (
                          <Pill key={l} tone={LABEL_TONE[l] ?? 'muted'} dot={LABEL_TONE[l] === 'ok'}>
                            {LABEL_TEXT[l] ?? l}
                          </Pill>
                        ))}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            <Pager {...pager} label="Proposal pages" />
          </>
        )}
      </div>
    </section>
  );
}
