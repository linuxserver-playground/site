/**
 * The smaller live lists: queue and capacity, recent build summaries, pull requests, issues, releases,
 * the scheduler's decision log and schedule, and the public action log. Each reads one `/api/*.json`
 * document and refreshes on the matching stream events.
 */
import * as React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { duration, repoImage, repoShort, toneOf, useControl, type ActionsPage, type Build, type IssuesPage, type JobView, type PullsPage, type QueuePage, type ReleasesPage, type SchedulerPage, type SkipsPage } from '@/lib/control';
import { ActionButton, Empty, ExtLink, MemberOnly, Offline, PanelBar, Pill, Rel, Select, Skeleton, StatePill, Table, TD, TH } from './shared';

interface Common {
  fallback: string;
  runsBase: string;
  buildsBase: string;
  imagesBase?: string;
  known?: Record<string, string[]>;
}

const Shell = ({ title, note, at, loading, error, data, reload, fallback, fallbackLabel, children, rows = 5 }: { title: string; note?: React.ReactNode; at: Date | null; loading: boolean; error: string | null; data: unknown; reload: () => void; fallback: string; fallbackLabel: string; children: React.ReactNode; rows?: number }) => (
  <section className="raft-panel overflow-hidden" aria-label={title}>
    <PanelBar title={title} note={note} at={at} />
    {!data && loading && <Skeleton rows={rows} />}
    {!data && !loading && error && <Offline error={error} retry={reload} fallback={{ label: fallbackLabel, href: fallback }} />}
    {data && error ? (
      <p role="status" className="border-b border-[var(--raft-hair)] bg-[var(--raft-amber)]/10 px-3.5 py-1.5 font-mono text-[0.6875rem]">
        Showing the last good data: {error}
      </p>
    ) : null}
    {data ? children : null}
  </section>
);

// ---------------------------------------------------------------- queue

export function Queue({ fallback, runsBase }: Common) {
  const { data, error, loading, at, reload } = useControl<QueuePage>('queue.json', ['jobs', 'runs']);
  const pct = data ? Math.min(100, Math.round(data.utilisation * 100)) : 0;
  const labels = React.useMemo(() => {
    const m = new Map<string, number>();
    for (const v of [...(data?.queued ?? []), ...(data?.in_progress ?? [])]) for (const l of v.job.labels) m.set(l, (m.get(l) ?? 0) + 1);
    return [...m].sort((a, b) => b[1] - a[1]);
  }, [data]);
  return (
    <Shell title="queue" note={data ? `${data.in_use} of ${data.limit} concurrent jobs in use` : undefined} at={at} loading={loading} error={error} data={data} reload={reload} fallback={fallback} fallbackLabel="Open the queue on the control plane">
      {data && (
        <>
          <div className="border-b border-[var(--raft-hair)] p-3.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2 font-mono text-xs">
              <span>
                <span className="text-2xl font-semibold tabular-nums">{data.in_use}</span>
                <span className="text-muted-foreground"> / {data.limit} concurrent jobs</span>
              </span>
              <span className="text-muted-foreground tabular-nums">
                {pct}% · {data.queued.length} queued
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--raft-bar-track)]" role="meter" aria-valuenow={data.in_use} aria-valuemin={0} aria-valuemax={data.limit} aria-label="Concurrency in use">
              <div className={`h-full rounded-full ${pct >= 90 ? 'bg-destructive' : pct >= 60 ? 'bg-[var(--raft-amber)]' : 'bg-[var(--raft-bar)]'}`} style={{ width: `${pct}%` }} />
            </div>
            {labels.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Runner labels in use">
                {labels.map(([l, n]) => (
                  <li key={l}>
                    <Pill tone="muted" dot={false}>
                      {l} × {n}
                    </Pill>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <JobsTable title="In progress" jobs={data.in_progress} runsBase={runsBase} reload={reload} />
          <JobsTable title="Queued" jobs={data.queued} runsBase={runsBase} reload={reload} />
        </>
      )}
    </Shell>
  );
}

/** Members can cancel from here; GitHub cancels runs, not jobs, so the button cancels the job's whole run. */
function JobsTable({ title, jobs, runsBase, reload }: { title: string; jobs: JobView[]; runsBase: string; reload: () => void }) {
  return (
    <div>
      <h3 className="px-3.5 pt-3 pb-1 font-mono text-[0.6875rem] text-muted-foreground uppercase">
        {title} · {jobs.length}
      </h3>
      {jobs.length === 0 ? (
        <p className="px-3.5 pb-3 text-xs text-muted-foreground">None.</p>
      ) : (
        <Table label={title}>
          <thead className="sr-only">
            <tr>
              <TH>Job</TH>
              <TH>Repository · branch</TH>
              <TH>Runner</TH>
              <TH>State</TH>
              <TH right>Elapsed</TH>
              <MemberOnly>{() => <TH>Actions</TH>}</MemberOnly>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--raft-hair)] border-t border-[var(--raft-hair)]">
            {jobs.map((v) => (
              <tr key={v.job.id}>
                <th scope="row" className="px-3 py-2 align-top font-mono text-xs font-normal">
                  <a href={`${runsBase}${v.job.run_id}/`} className="underline-offset-4 hover:text-primary hover:underline">
                    {v.job.name}
                  </a>
                </th>
                <TD mono>
                  {repoShort(v.job.repo)}
                  {v.branch && <span className="block text-[0.6875rem] text-foreground">{v.branch}</span>}
                  {v.event && v.event !== 'push' && <span className="block text-[0.6875rem] text-muted-foreground">{v.event.replace('_', ' ')}</span>}
                </TD>
                <TD mono>
                  {v.job.labels.join(', ')}
                  {v.job.runner_name && <span className="block text-[0.6875rem] text-muted-foreground">{v.job.runner_name}</span>}
                </TD>
                <TD>
                  <span className="flex flex-wrap gap-1">
                    <StatePill status={v.job.status} conclusion={v.job.conclusion} />
                    {v.stuck && (
                      <Pill tone="warn" dot={false}>
                        stuck?
                      </Pill>
                    )}
                  </span>
                </TD>
                <TD mono right>
                  {duration(v.elapsed_seconds)}
                  {v.threshold_seconds != null && <span className="block text-[0.6875rem] text-muted-foreground">p95 {duration(v.threshold_seconds)}</span>}
                </TD>
                <MemberOnly>
                  {(me) => (
                    <TD right>
                      <ActionButton action="cancel" body={{ run_id: v.job.run_id }} csrf={me.csrf} label="cancel run" tone="danger" confirm={`Cancel run #${v.job.run_id} of ${repoShort(v.job.repo)}? Every job in that run stops, not only ${v.job.name}.`} onDone={reload} />
                    </TD>
                  )}
                </MemberOnly>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- builds

export function Builds({ fallback, runsBase, buildsBase, known = {} }: Common) {
  // Build summaries come with the releases document (newest first) and the active runs; `/api/releases.json`
  // carries every live build that produced a Release, which is what the site has pages for.
  const { data, error, loading, at, reload } = useControl<ReleasesPage>('releases.json', ['builds', 'releases']);
  const builds = data?.releases.map((r) => r.build).filter((b): b is Build => !!b) ?? [];
  return (
    <Shell title="recent builds" note={data ? `${builds.length} with a release` : undefined} at={at} loading={loading} error={error} data={data} reload={reload} fallback={fallback} fallbackLabel="Open the releases on the control plane" rows={6}>
      {builds.length === 0 ? (
        <Empty>No builds yet.</Empty>
      ) : (
        <BuildsTable builds={builds} runsBase={runsBase} buildsBase={buildsBase} known={known} />
      )}
    </Shell>
  );
}

export function BuildsTable({ builds, runsBase, buildsBase, known, compact = false }: { builds: Build[]; runsBase: string; buildsBase: string; known: Record<string, string[]>; compact?: boolean }) {
  return (
    <Table label="Builds">
      <thead className="border-b border-[var(--raft-hair)]">
        <tr>
          <TH>{compact ? 'Tag' : 'Image · tag'}</TH>
          <TH>Result</TH>
          <TH>Reason</TH>
          <TH>Platforms</TH>
          <TH>Received</TH>
          <TH>Links</TH>
        </tr>
      </thead>
      <tbody className="divide-y divide-[var(--raft-hair)]">
        {builds.map((b) => {
          const page = b.version_tag && known[b.image]?.includes(b.version_tag) ? `${buildsBase}${b.image}/builds/${b.version_tag}/` : null;
          return (
            <tr key={`${b.repo}/${b.run_id}`}>
              <th scope="row" className="px-3 py-2.5 align-top font-normal">
                {!compact && <span className="font-medium">{b.image} </span>}
                {page ? (
                  <a href={page} className="font-mono text-xs text-foreground underline-offset-4 hover:text-primary hover:underline">
                    {b.version_tag}
                  </a>
                ) : (
                  <span className="font-mono text-xs">{b.version_tag ?? `run ${b.run_id}`}</span>
                )}
                <span className="block font-mono text-[0.6875rem] text-muted-foreground">
                  {b.branch} · {b.mode}
                  {b.pull_request ? ` · PR #${b.pull_request}` : ''}
                </span>
              </th>
              <TD>
                <span className="flex flex-wrap gap-1">
                  <StatePill status={b.result === null ? 'in_progress' : 'completed'} conclusion={b.result} />
                  {b.test_success !== null && (
                    <Pill tone={b.test_success ? 'ok' : 'bad'} dot={false}>
                      tests {b.test_success ? 'passed' : 'failed'}
                    </Pill>
                  )}
                </span>
                {b.failed_job && <span className="block font-mono text-[0.6875rem] text-[var(--raft-danger)]">{b.failed_job}</span>}
              </TD>
              <TD mono>
                {b.reason ?? '–'}
                {b.upstream && <span className="block text-[0.6875rem] text-muted-foreground">upstream {b.upstream}</span>}
              </TD>
              <TD mono>
                <span className="flex flex-wrap gap-1">
                  {b.platforms.map((p) => (
                    <Pill key={p.arch} tone={toneOf('completed', p.result ?? b.result)} dot={false}>
                      {p.arch}
                    </Pill>
                  ))}
                </span>
              </TD>
              <TD mono>
                <Rel iso={b.received_at} />
              </TD>
              <TD mono>
                <span className="flex flex-wrap gap-x-2 gap-y-0.5">
                  <a href={`${runsBase}${b.run_id}/`} className="underline-offset-4 hover:text-primary hover:underline">
                    run
                  </a>
                  {b.release_url && <ExtLink href={b.release_url}>release</ExtLink>}
                  {b.artifact_url && <ExtLink href={b.artifact_url}>artifact</ExtLink>}
                </span>
              </TD>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

// ---------------------------------------------------------------- pulls

export function Pulls({ fallback, runsBase }: Common) {
  const { data, error, loading, at, reload } = useControl<PullsPage>('pulls.json', ['pull_requests', 'runs']);
  return (
    <Shell title="open pull requests" note={data ? `${data.pulls.length} open` : undefined} at={at} loading={loading} error={error} data={data} reload={reload} fallback={fallback} fallbackLabel="Open the pull requests on the control plane">
      {data && data.pulls.length === 0 ? (
        <Empty>No open pull requests.</Empty>
      ) : (
        data && (
          <Table label="Open pull requests">
            <thead className="border-b border-[var(--raft-hair)]">
              <tr>
                <TH>Pull request</TH>
                <TH>Repository</TH>
                <TH>Build</TH>
                <TH>Review</TH>
                <TH>Opened</TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--raft-hair)]">
              {data.pulls.map(({ pull, run, quarantine_tag }) => (
                <tr key={`${pull.repo}#${pull.number}`}>
                  <th scope="row" className="px-3 py-2.5 align-top font-normal">
                    {pull.html_url ? (
                      <ExtLink href={pull.html_url} className="font-medium text-foreground">
                        {pull.title}
                      </ExtLink>
                    ) : (
                      <span className="font-medium">{pull.title}</span>
                    )}
                    <span className="block font-mono text-[0.6875rem] text-muted-foreground">
                      #{pull.number} · {pull.author ?? 'unknown'}
                      {pull.draft && ' · draft'}
                      {pull.head_fork && ' · from a fork'}
                    </span>
                  </th>
                  <TD mono>{repoShort(pull.repo)}</TD>
                  <TD>
                    {run ? (
                      <a href={`${runsBase}${run.id}/`} className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline">
                        <StatePill status={run.status} conclusion={run.conclusion} />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">no run</span>
                    )}
                    {quarantine_tag && <span className="block font-mono text-[0.6875rem] text-muted-foreground">{quarantine_tag}</span>}
                  </TD>
                  <TD mono>{pull.review_state ?? '–'}</TD>
                  <TD mono>
                    <Rel iso={pull.created_at} />
                  </TD>
                </tr>
              ))}
            </tbody>
          </Table>
        )
      )}
    </Shell>
  );
}

// ---------------------------------------------------------------- issues

export function Issues({ fallback }: Common) {
  const { data, error, loading, at, reload } = useControl<IssuesPage>('issues.json', ['issues']);
  return (
    <Shell title="open issues" note={data ? `${data.issues.length} open` : undefined} at={at} loading={loading} error={error} data={data} reload={reload} fallback={fallback} fallbackLabel="Open the issues on the control plane">
      {data && data.issues.length === 0 ? (
        <Empty>No open issues.</Empty>
      ) : (
        data && (
          <Table label="Open issues">
            <thead className="border-b border-[var(--raft-hair)]">
              <tr>
                <TH>Issue</TH>
                <TH>Repository</TH>
                <TH>Labels</TH>
                <TH>Opened</TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--raft-hair)]">
              {data.issues.map((i) => (
                <tr key={`${i.repo}#${i.number}`}>
                  <th scope="row" className="px-3 py-2.5 align-top font-normal">
                    {i.html_url ? (
                      <ExtLink href={i.html_url} className="font-medium text-foreground">
                        {i.title}
                      </ExtLink>
                    ) : (
                      <span className="font-medium">{i.title}</span>
                    )}
                    <span className="block font-mono text-[0.6875rem] text-muted-foreground">
                      #{i.number} · {i.author ?? 'unknown'}
                    </span>
                  </th>
                  <TD mono>{repoShort(i.repo)}</TD>
                  <TD>
                    <span className="flex flex-wrap gap-1">
                      {i.labels.map((l) => (
                        <Pill key={l} tone="muted" dot={false}>
                          {l}
                        </Pill>
                      ))}
                    </span>
                  </TD>
                  <TD mono>
                    <Rel iso={i.created_at} />
                  </TD>
                </tr>
              ))}
            </tbody>
          </Table>
        )
      )}
    </Shell>
  );
}

// ---------------------------------------------------------------- releases

export function Releases({ fallback, runsBase, buildsBase, known = {} }: Common) {
  const { data, error, loading, at, reload } = useControl<ReleasesPage>('releases.json', ['releases', 'builds']);
  return (
    <Shell title="releases" note={data ? `${data.releases.length} newest first` : undefined} at={at} loading={loading} error={error} data={data} reload={reload} fallback={fallback} fallbackLabel="Open the releases on the control plane" rows={6}>
      {data && data.releases.length === 0 ? (
        <Empty>No releases yet.</Empty>
      ) : (
        data && (
          <Table label="Releases">
            <thead className="border-b border-[var(--raft-hair)]">
              <tr>
                <TH>Release</TH>
                <TH>Build</TH>
                <TH>Upstream</TH>
                <TH>Published</TH>
                <TH>Links</TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--raft-hair)]">
              {data.releases.map(({ release: r, build: b }) => {
                const image = b?.image ?? repoImage(r.repo);
                const page = known[image]?.includes(r.tag) ? `${buildsBase}${image}/builds/${r.tag}/` : null;
                return (
                  <tr key={`${r.repo}@${r.tag}`}>
                    <th scope="row" className="px-3 py-2.5 align-top font-normal">
                      <span className="font-medium">{image} </span>
                      {page ? (
                        <a href={page} className="font-mono text-xs text-foreground underline-offset-4 hover:text-primary hover:underline">
                          {r.tag}
                        </a>
                      ) : (
                        <span className="font-mono text-xs">{r.tag}</span>
                      )}
                      <span className="block font-mono text-[0.6875rem] text-muted-foreground">
                        {repoShort(r.repo)}
                        {r.prerelease && ' · pre-release'}
                      </span>
                    </th>
                    <TD>
                      {b ? (
                        <span className="flex flex-wrap gap-1">
                          <StatePill status="completed" conclusion={b.result} />
                          {b.reason && (
                            <Pill tone="muted" dot={false}>
                              {b.reason}
                            </Pill>
                          )}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">no build event</span>
                      )}
                    </TD>
                    <TD mono wrap>{b?.upstream ?? '–'}</TD>
                    <TD mono>
                      <Rel iso={r.published_at ?? r.created_at} />
                    </TD>
                    <TD mono>
                      <span className="flex flex-wrap gap-x-2 gap-y-0.5">
                        {r.html_url && <ExtLink href={r.html_url}>GitHub</ExtLink>}
                        {b && (
                          <a href={`${runsBase}${b.run_id}/`} className="underline-offset-4 hover:text-primary hover:underline">
                            run
                          </a>
                        )}
                        {page && (
                          <a href={page} className="underline-offset-4 hover:text-primary hover:underline">
                            CI results
                          </a>
                        )}
                      </span>
                    </TD>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )
      )}
    </Shell>
  );
}

// ---------------------------------------------------------------- scheduler

export function Scheduler({ fallback, runsBase }: Common) {
  const [image, setImage] = React.useState('');
  const [kind, setKind] = React.useState('');
  const [outcome, setOutcome] = React.useState('');
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    // Filters come from the URL (?image=&kind=&outcome=) once, after hydration.
    const q = new URL(location.href).searchParams;
    setImage(q.get('image') ?? '');
    setKind(q.get('kind') ?? '');
    setOutcome(q.get('outcome') ?? '');
    setReady(true);
  }, []);
  const qs = new URLSearchParams();
  if (image) qs.set('image', image);
  if (kind) qs.set('kind', kind);
  if (outcome) qs.set('outcome', outcome);
  const path = ready ? `scheduler.json${qs.size ? `?${qs}` : ''}` : null;
  const { data, error, loading, at, reload } = useControl<SchedulerPage>(path, ['scheduler_decisions', 'manifests', 'skips', 'runs']);
  const skips = useControl<SkipsPage>('skips.json', ['skips']);

  React.useEffect(() => {
    if (!ready) return;
    const url = new URL(location.href);
    for (const [k, v] of [
      ['image', image],
      ['kind', kind],
      ['outcome', outcome],
    ]) {
      if (v) url.searchParams.set(k, v);
      else url.searchParams.delete(k);
    }
    history.replaceState(null, '', url);
  }, [image, kind, outcome, ready]);

  const opt = (list: string[] | undefined, all: string) => [{ value: '', label: all }, ...(list ?? []).map((x) => ({ value: x, label: x }))];
  return (
    <div className="space-y-6">
      <section className="raft-panel overflow-hidden" aria-label="Decision log">
        <PanelBar title="decision log" note={data ? `${data.decisions.length} shown · ${data.live_branches} live branches · scheduler ${data.enabled ? 'on' : 'off'}` : undefined} at={at}>
          <Select label="image" value={image} onChange={setImage} options={opt(data?.images, 'all')} />
          <Select label="kind" value={kind} onChange={setKind} options={opt(data?.kinds, 'all')} />
          <Select label="outcome" value={outcome} onChange={setOutcome} options={opt(data?.outcomes, 'all')} />
          <MemberOnly>{(me) => <ActionButton action="reconcile" body={{}} csrf={me.csrf} label="re-read manifests" confirm="Run fleet discovery now? Every live branch's image.yml is re-read in the background." onDone={reload} />}</MemberOnly>
        </PanelBar>
        {!data && (loading || !ready) && <Skeleton rows={8} />}
        {!data && !loading && ready && error && <Offline error={error} retry={reload} fallback={{ label: 'Open the scheduler on the control plane', href: fallback }} />}
        {data && data.decisions.length === 0 && <Empty>No decision matches these filters.</Empty>}
        {data && data.decisions.length > 0 && (
          <Table label="Scheduler decisions">
            <thead className="border-b border-[var(--raft-hair)]">
              <tr>
                <TH>When</TH>
                <TH>Branch</TH>
                <TH>Kind</TH>
                <TH>Outcome</TH>
                <TH>Detail</TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--raft-hair)]">
              {data.decisions.map(({ decision: d, info, run }) => (
                <tr key={d.id}>
                  <TD mono>
                    <Rel iso={d.at} />
                  </TD>
                  <TD mono>
                    {d.image} <span className="text-muted-foreground">{d.branch}</span>
                  </TD>
                  <TD mono>{d.kind}</TD>
                  <TD>
                    <Pill tone={d.outcome === 'dispatch' ? 'live' : d.outcome === 'unchanged' ? 'ok' : d.outcome === 'error' ? 'bad' : 'muted'} dot={false}>
                      {d.outcome}
                    </Pill>
                    {run && (
                      <a href={`${runsBase}${run.id}/`} className="mt-0.5 block font-mono text-[0.6875rem] underline-offset-4 hover:text-primary hover:underline">
                        run #{run.run_number ?? run.id}
                      </a>
                    )}
                  </TD>
                  <TD className="text-xs text-muted-foreground">
                    <Detail info={info} />
                  </TD>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="raft-panel overflow-hidden" aria-label="Upcoming checks">
          <PanelBar title="next 24 hours" note={data ? `${data.upcoming.length} checks` : undefined} at={at} />
          {!data && (loading || !ready) && <Skeleton rows={5} />}
          {data && data.upcoming.length === 0 && <Empty>Nothing scheduled.</Empty>}
          {data && data.upcoming.length > 0 && (
            <ol className="divide-y divide-[var(--raft-hair)]">
              {data.upcoming.map((u) => (
                <li key={`${u.image}/${u.branch}/${u.kind}/${u.at}`} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 px-3.5 py-2 font-mono text-xs">
                  <span>
                    {u.image} <span className="text-muted-foreground">{u.branch}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {u.kind} · <Rel iso={u.at} mode="until" /> <span className="text-[0.6875rem]">({new Date(u.at).toISOString().slice(11, 16)} UTC)</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="raft-panel overflow-hidden" aria-label="Skip flags">
          <PanelBar title="skip flags" note={skips.data ? `${skips.data.skips.length} active` : undefined} at={skips.at} />
          {!skips.data && skips.loading && <Skeleton rows={3} />}
          {skips.data && skips.data.skips.length === 0 && <Empty>No skip flags set.</Empty>}
          {skips.data && skips.data.skips.length > 0 && (
            <ul className="divide-y divide-[var(--raft-hair)]">
              {skips.data.skips.map((s) => (
                <li key={s.scope} className="flex flex-wrap items-start justify-between gap-2 px-3.5 py-2 text-xs">
                  <span>
                    <span className="font-mono">{s.scope}</span>
                    <span className="block text-muted-foreground">
                      {s.reason ?? 'no reason given'} · {s.set_by} · <Rel iso={s.set_at} />
                    </span>
                  </span>
                  <MemberOnly>{(me) => <ActionButton action="unskip" body={{ scope: s.scope }} csrf={me.csrf} label="unskip" size="xs" confirm={`Clear the skip flag on ${s.scope}?`} fields={[{ name: 'reason', label: 'reason', placeholder: 'why' }]} onDone={() => skips.reload()} />}</MemberOnly>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Detail({ info }: { info: Record<string, unknown> }) {
  const entries = Object.entries(info).filter(([, v]) => v !== null && v !== undefined && v !== '');
  if (entries.length === 0) return <span>–</span>;
  return (
    <dl className="flex flex-wrap gap-x-3 gap-y-0.5">
      {entries.map(([k, v]) => (
        <div key={k} className="inline-flex gap-1">
          <dt className="font-mono text-[0.6875rem] uppercase">{k}</dt>
          <dd className="max-w-[18rem] truncate font-mono text-foreground" title={String(v)}>
            {typeof v === 'string' && /^https?:\/\//.test(v) ? (
              <ExtLink href={v} className="text-foreground">
                link
              </ExtLink>
            ) : (
              String(v)
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// ---------------------------------------------------------------- actions

export function Actions({ fallback }: Common) {
  const { data, error, loading, at, reload } = useControl<ActionsPage>('actions.json', ['actions']);
  return (
    <Shell title="member actions" note={data ? `last ${data.actions.length}` : undefined} at={at} loading={loading} error={error} data={data} reload={reload} fallback={fallback} fallbackLabel="Open the management page on the control plane">
      {data && data.actions.length === 0 ? (
        <Empty>No actions yet.</Empty>
      ) : (
        data && (
          <Table label="Member actions">
            <thead className="border-b border-[var(--raft-hair)]">
              <tr>
                <TH>When</TH>
                <TH>Who</TH>
                <TH>Action</TH>
                <TH>Target</TH>
                <TH>Result</TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--raft-hair)]">
              {data.actions.map((a) => (
                <tr key={a.id}>
                  <TD mono>
                    <Rel iso={a.at} />
                  </TD>
                  <TD mono>{a.actor}</TD>
                  <TD mono>{a.action}</TD>
                  <TD mono>{a.target ?? '–'}</TD>
                  <TD>
                    <Pill tone={a.result === 'ok' ? 'ok' : 'bad'} dot={false}>
                      {a.result}
                    </Pill>
                    {a.detail && <span className="block max-w-xs truncate text-[0.6875rem] text-muted-foreground" title={a.detail}>{a.detail}</span>}
                  </TD>
                </tr>
              ))}
            </tbody>
          </Table>
        )
      )}
    </Shell>
  );
}

export const External = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
    {children} <ArrowUpRight className="size-3.5" aria-hidden="true" />
    <span className="sr-only">(opens in a new tab)</span>
  </a>
);
