/**
 * The fleet's helper repositories, below the board: what builds in the org but is not an image. docker-mods (and any
 * other `docker-*` repo without an image.yml) comes from the board's `/api/fleet.json` `helpers`; the batch projects
 * (proot-apps, selkies-layers, wheelie) from `/api/batch.json`, refreshed on `batch_runs` and `runs` events. One card
 * per repository, then one paged table per repository with failures, so a red mod branch or PRoot app is never
 * lost in the image board.
 */
import * as React from 'react';
import { LINKS } from '@/lib/site';
import { useControl, type BatchPage, type BatchProject, type BatchUnit, type HelperFailure, type HelperRepo } from '@/lib/control';
import { ActionButton, ExtLink, MemberOnly, Offline, Pager, PanelBar, Pill, Rel, Skeleton, StatePill, Table, TD, TH, usePaged } from './shared';

interface Props {
  /** The board's `helpers`; `undefined` while fleet.json is loading. */
  helpers: HelperRepo[] | undefined;
  /** `withBase('/mods/')` */
  modsBase: string;
  /** `withBase('/proot-apps/')` */
  prootBase: string;
  /** `withBase('/fleet/runs/')` */
  runsBase: string;
  /** The control plane's batch page, for the offline state. */
  fallback: string;
}

// Several tables stack here, so each pages sooner than the board.
const FAILURES_PAGE = 10;

type Browse = { label: string; href: string; external?: boolean } | null;

/** Where a helper repository is browsed on the site or its own Pages, beside its GitHub link. */
function browse(repo: string, modsBase: string, prootBase: string): Browse {
  if (repo === 'docker-mods') return { label: 'Browse the mods', href: modsBase };
  if (repo === 'proot-apps') return { label: 'PRoot Apps catalogue', href: prootBase };
  if (repo === 'wheelie') return { label: 'Wheel index', href: 'https://linuxserver-playground.github.io/wheelie/', external: true };
  return null;
}

const anchor = (repo: string) => `helper-${repo}`;

export default function HelperRepos({ helpers, modsBase, prootBase, runsBase, fallback }: Props) {
  const batch = useControl<BatchPage>('batch.json', ['batch_runs', 'runs', 'scheduler_decisions']);
  const repos = (helpers ?? []).filter((h) => !h.archived);
  const projects = batch.data?.projects ?? [];
  const failing = repos.reduce((n, h) => n + h.failing.length, 0) + projects.reduce((n, p) => n + p.failing.length, 0);

  return (
    <section aria-labelledby="helpers-title" id="helpers" className="scroll-mt-24 pt-10">
      <h2 id="helpers-title" className="text-2xl font-semibold tracking-tight md:text-[2rem] md:leading-tight">
        Non Image Repos
      </h2>
      <p className="mt-2 font-mono text-sm text-muted-foreground" aria-live="polite">
        Status - {helpers && batch.data ? (failing ? <span className="text-[var(--raft-danger)]">{failing} failing</span> : <span className="text-[var(--raft-ok)]">all passing</span>) : 'loading…'}
      </p>

      <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Non image repos">
        {helpers === undefined ? (
          <li className="raft-panel">
            <Skeleton rows={3} label="Loading the helper repositories…" />
          </li>
        ) : (
          repos.map((h) => <HelperCard key={h.repo} h={h} link={browse(h.name, modsBase, prootBase)} />)
        )}
        {!batch.data && batch.loading && (
          <li className="raft-panel xl:col-span-3">
            <Skeleton rows={3} label="Loading the batch projects…" />
          </li>
        )}
        {projects.map((p) => (
          <BatchCard key={p.repo} p={p} link={browse(p.repo, modsBase, prootBase)} />
        ))}
      </ul>
      {!batch.data && !batch.loading && batch.error && (
        <div className="raft-panel mt-3 overflow-hidden">
          <Offline error={batch.error} retry={batch.reload} fallback={{ label: 'Open the batch projects on the control plane', href: fallback }} />
        </div>
      )}

      <div className="mt-3 space-y-3">
        {repos
          .filter((h) => h.failing.length > 0)
          .map((h) => (
            <BranchFailures key={h.repo} h={h} modsBase={modsBase} runsBase={runsBase} />
          ))}
        {projects
          .filter((p) => p.failing.length > 0)
          .map((p) => (
            <UnitFailures key={p.repo} p={p} at={batch.at} />
          ))}
      </div>
    </section>
  );
}

function Card({ name, href, kind, link, children }: { name: string; href: string; kind: React.ReactNode; link: Browse; children: React.ReactNode }) {
  return (
    <li className="raft-panel flex flex-col gap-3 p-4">
      <div>
        <h3 className="font-mono text-sm font-semibold">
          <ExtLink href={href}>{name}</ExtLink>
        </h3>
        <p className="mt-0.5 font-mono text-[0.6875rem] text-muted-foreground">{kind}</p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
      {link && (
        <p className="mt-auto text-xs">
          {link.external ? (
            <ExtLink href={link.href} className="font-medium">
              {link.label}
            </ExtLink>
          ) : (
            <a href={link.href} className="font-medium underline-offset-4 hover:text-primary hover:underline">
              {link.label}
            </a>
          )}
        </p>
      )}
    </li>
  );
}

/** The red pill on a card, linking the repository's failure table. */
function FailingPill({ repo, n, what }: { repo: string; n: number; what: string }) {
  return (
    <a href={`#${anchor(repo)}`} className="rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
      <Pill tone="bad">
        {n} {what} failing
      </Pill>
    </a>
  );
}

function HelperCard({ h, link }: { h: HelperRepo; link: Browse }) {
  return (
    <Card name={h.name} href={`https://github.com/${h.repo}`} kind={`${h.branches} branch${h.branches === 1 ? '' : 'es'} built on push`} link={link}>
      {h.failing.length > 0 ? <FailingPill repo={h.name} n={h.failing.length} what={h.failing.length === 1 ? 'branch' : 'branches'} /> : <Pill tone="ok">all passing</Pill>}
      {h.running > 0 && <Pill tone="live">{h.running} running</Pill>}
      <span className="font-mono text-[0.6875rem] text-muted-foreground">
        {h.success} passing · last build <Rel iso={h.last_run_at} />
      </span>
    </Card>
  );
}

function BatchCard({ p, link }: { p: BatchProject; link: Browse }) {
  const last = p.runs[0];
  const active = p.active_run;
  return (
    <Card name={p.repo} href={`${LINKS.github}/${p.repo}`} kind={`batch · ${p.schedule}${p.live ? '' : ' · dry run'}`} link={link}>
      {p.failing.length > 0 ? <FailingPill repo={p.repo} n={p.failing.length} what={p.failing.length === 1 ? 'job' : 'jobs'} /> : <Pill tone="ok">no failing jobs</Pill>}
      {active &&
        (active.html_url ? (
          <a href={active.html_url} target="_blank" rel="noopener" className="rounded-md">
            <StatePill status={active.status} conclusion={active.conclusion} />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <StatePill status={active.status} conclusion={active.conclusion} />
        ))}
      <span className="font-mono text-[0.6875rem] text-muted-foreground">
        {last && (
          <>
            last run {last.conclusion ?? 'unknown'} <Rel iso={last.completed_at} /> ·{' '}
          </>
        )}
        next <Rel iso={p.next_at} mode="until" />
      </span>
    </Card>
  );
}

type BranchRow = HelperFailure | { branch: string; run_id: null; conclusion: string; html_url: null; at: null };

/** docker-mods: the branches whose newest build failed, newest first, each with its run. */
function BranchFailures({ h, modsBase, runsBase }: { h: HelperRepo; modsBase: string; runsBase: string }) {
  // An older control plane sends only the branch names.
  const rows: BranchRow[] = h.failures?.length ? h.failures : h.failing.map((branch) => ({ branch, run_id: null, conclusion: 'failure', html_url: null, at: null }));
  const { top, visible, pager } = usePaged<BranchRow, HTMLDivElement>(rows, FAILURES_PAGE);
  const mods = h.name === 'docker-mods';
  return (
    <div ref={top} id={anchor(h.name)} className="raft-panel scroll-mt-24 overflow-hidden">
      <PanelBar title={`${h.name} · failing`} note={`${rows.length} of ${h.branches} branches`} />
      <Table label={`${h.name} failing branches`}>
        <thead className="border-b border-[var(--raft-hair)]">
          <tr>
            <TH>Branch</TH>
            <TH>Result</TH>
            <TH>Built</TH>
            <TH>Run</TH>
            <MemberOnly>{() => <TH>Actions</TH>}</MemberOnly>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--raft-hair)]">
          {visible.map((f) => (
            <tr key={f.branch} className="bg-destructive/[0.04]">
              <th scope="row" className="px-3 py-2.5 text-left align-top font-mono text-[0.8125rem] font-normal">
                {mods ? (
                  <a href={`${modsBase}${f.branch}/`} className="underline-offset-4 hover:text-primary hover:underline">
                    {f.branch}
                  </a>
                ) : (
                  f.branch
                )}
              </th>
              <TD>
                <StatePill status="completed" conclusion={f.conclusion} />
              </TD>
              <TD mono>
                <Rel iso={f.at} />
              </TD>
              <TD mono>
                {f.run_id ? (
                  <a href={`${runsBase}${f.run_id}/`} className="underline-offset-4 hover:text-primary hover:underline">
                    run #{f.run_id}
                  </a>
                ) : (
                  <ExtLink href={`https://github.com/${h.repo}/actions?query=${encodeURIComponent(`branch:${f.branch}`)}`}>runs</ExtLink>
                )}
              </TD>
              <MemberOnly>{(me) => <TD>{f.run_id && <ActionButton action="rerun" body={{ run_id: f.run_id }} csrf={me.csrf} label="re-run" size="xs" confirm={`Re-run the failed jobs of run #${f.run_id}?`} />}</TD>}</MemberOnly>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pager {...pager} label={`${h.name} failing branches pages`} />
    </div>
  );
}

/** A batch project: the jobs (apps, layers, distro and arch) whose newest result is a failure, longest red first. */
function UnitFailures({ p, at }: { p: BatchProject; at: Date | null }) {
  const rows = React.useMemo(() => [...p.failing].sort((a, b) => a.since.localeCompare(b.since) || a.unit.localeCompare(b.unit)), [p.failing]);
  const { top, visible, pager } = usePaged<BatchUnit, HTMLDivElement>(rows, FAILURES_PAGE);
  const workflows = new Set(rows.map((u) => u.workflow)).size > 1;
  return (
    <div ref={top} id={anchor(p.repo)} className="raft-panel scroll-mt-24 overflow-hidden">
      <PanelBar title={`${p.repo} · failing`} note={`${rows.length} ${rows.length === 1 ? 'job' : 'jobs'}`} at={at} />
      <Table label={`${p.repo} failing jobs`}>
        <thead className="border-b border-[var(--raft-hair)]">
          <tr>
            <TH>Job</TH>
            {workflows && <TH>Workflow</TH>}
            <TH>Failing since</TH>
            <TH>Last run</TH>
            <TH>Log</TH>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--raft-hair)]">
          {visible.map((u) => (
            <tr key={`${u.workflow}/${u.unit}`} className="bg-destructive/[0.04]">
              <th scope="row" className="px-3 py-2.5 text-left align-top font-mono text-[0.8125rem] font-normal">
                <span className="[overflow-wrap:anywhere]">{u.unit}</span>
              </th>
              {workflows && <TD className="text-xs text-muted-foreground">{u.workflow}</TD>}
              <TD mono>
                <Rel iso={u.since} />
              </TD>
              <TD mono>
                <Rel iso={u.run_created_at} />
              </TD>
              <TD mono>{u.html_url ? <ExtLink href={u.html_url}>job log</ExtLink> : <span className="text-muted-foreground">–</span>}</TD>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pager {...pager} label={`${p.repo} failing jobs pages`} />
    </div>
  );
}
