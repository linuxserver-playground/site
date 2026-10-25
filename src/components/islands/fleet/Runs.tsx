/**
 * Live and recent workflow runs (`/api/runs.json`) and one run in detail (`/api/runs/{id}.json`): jobs
 * with their progress, the steps timeline, logs and build links. Members can re-run failed runs and
 * cancel active ones.
 */
import * as React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { duration, repoShort, toneOf, useControl, type Build, type Job, type JobView, type Run, type RunPage, type RunsPage, type Step } from '@/lib/control';
import { ActionButton, Empty, ExtLink, MemberOnly, Offline, PanelBar, Pill, Rel, Skeleton, StatePill, Table, TD, TH, useNow } from './shared';

const TABLES = ['runs', 'jobs', 'builds'];

// ---------------------------------------------------------------- the list

export default function RunsLive({ runsBase, buildsBase, known, fallback }: { runsBase: string; buildsBase: string; known: Record<string, string[]>; fallback: string }) {
  const { data, error, loading, at, reload } = useControl<RunsPage>('runs.json', TABLES);
  return (
    <div className="space-y-6">
      <section className="raft-panel overflow-hidden" aria-labelledby="runs-live-title">
        <PanelBar title="live" note={data ? `${data.active.length} active` : undefined} at={at}>
          <h2 id="runs-live-title" className="sr-only">
            Live runs
          </h2>
        </PanelBar>
        {!data && loading && <Skeleton rows={3} />}
        {!data && !loading && error && <Offline error={error} retry={reload} fallback={{ label: 'Open the runs page on the control plane', href: fallback }} />}
        {data && data.active.length === 0 && <Empty>Nothing is running.</Empty>}
        {data && data.active.length > 0 && (
          <ul className="divide-y divide-[var(--raft-hair)]">
            {data.active.map((v) => (
              <li key={v.run.id} className="p-3.5">
                <RunHead run={v.run} elapsed={v.elapsed_seconds} stuck={v.stuck} runsBase={runsBase} reload={reload} />
                <JobBars jobs={v.jobs} />
                {v.build && <BuildLine build={v.build} buildsBase={buildsBase} known={known} />}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="raft-panel overflow-hidden" aria-labelledby="runs-recent-title">
        <PanelBar title="recent" note={data ? `last ${data.recent.length} finished` : undefined} at={at}>
          <h2 id="runs-recent-title" className="sr-only">
            Recent runs
          </h2>
        </PanelBar>
        {!data && loading && <Skeleton rows={8} />}
        {data && data.recent.length === 0 && <Empty>No finished runs yet.</Empty>}
        {data && data.recent.length > 0 && (
          <Table label="Recent runs">
            <thead className="border-b border-[var(--raft-hair)]">
              <tr>
                <TH>Run</TH>
                <TH>Repository · branch</TH>
                <TH>Result</TH>
                <TH>Trigger</TH>
                <TH>Finished</TH>
                <TH right>Took</TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--raft-hair)]">
              {data.recent.map((r) => (
                <tr key={r.id}>
                  <th scope="row" className="px-3 py-2.5 align-top font-normal">
                    <a href={`${runsBase}${r.id}/`} className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline">
                      {r.workflow_name ?? 'run'} <span className="font-mono text-xs text-muted-foreground">#{r.run_number ?? r.id}</span>
                    </a>
                    <span className="mt-0.5 block max-w-xs truncate text-xs text-muted-foreground" title={r.display_title ?? undefined}>
                      {r.display_title}
                    </span>
                  </th>
                  <TD mono>
                    {repoShort(r.repo)}
                    <span className="block text-[0.6875rem] text-muted-foreground">{r.branch}</span>
                  </TD>
                  <TD>
                    <StatePill status={r.status} conclusion={r.conclusion} />
                  </TD>
                  <TD mono>
                    {r.event}
                    {r.actor && <span className="block text-[0.6875rem] text-muted-foreground">{r.actor}</span>}
                  </TD>
                  <TD mono>
                    <Rel iso={r.updated_at} />
                  </TD>
                  <TD mono right>
                    {r.started_at ? duration((Date.parse(r.updated_at) - Date.parse(r.started_at)) / 1000) : '–'}
                  </TD>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>
    </div>
  );
}

function RunHead({ run, elapsed, stuck, runsBase, reload, detail = false }: { run: Run; elapsed: number | null; stuck: boolean; runsBase: string; reload: () => void; detail?: boolean }) {
  const now = useNow();
  const live = run.status !== 'completed';
  const seconds = live && run.started_at ? (now - Date.parse(run.started_at)) / 1000 : (elapsed ?? (run.started_at ? (Date.parse(run.updated_at) - Date.parse(run.started_at)) / 1000 : null));
  const Title = detail ? 'p' : 'h3';
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <Title className="flex flex-wrap items-center gap-2 text-sm">
          {detail ? (
            <span className="font-medium">{run.workflow_name ?? 'run'}</span>
          ) : (
            <a href={`${runsBase}${run.id}/`} className="font-medium underline-offset-4 hover:text-primary hover:underline">
              {run.workflow_name ?? 'run'}
            </a>
          )}
          <span className="font-mono text-xs text-muted-foreground">#{run.run_number ?? run.id}</span>
          <StatePill status={run.status} conclusion={run.conclusion} />
          {stuck && (
            <Pill tone="warn" dot={false} title="In progress longer than the p95 of this job's history">
              stuck?
            </Pill>
          )}
        </Title>
        <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-xs text-muted-foreground">
          <span>
            {repoShort(run.repo)} · {run.branch}
          </span>
          <span>{run.event}</span>
          {run.actor && <span>{run.actor}</span>}
          <span>
            started <Rel iso={run.started_at ?? run.created_at} />
          </span>
          <span className="tabular-nums">{duration(seconds)}</span>
        </p>
        {run.display_title && <p className="mt-1 text-xs text-muted-foreground">{run.display_title}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <MemberOnly>
          {(me) => (
            <>
              {live && <ActionButton action="cancel" body={{ run_id: run.id }} csrf={me.csrf} label="cancel" tone="danger" confirm={`Cancel run #${run.run_number ?? run.id} of ${repoShort(run.repo)}?`} onDone={reload} />}
              {!live && run.conclusion && run.conclusion !== 'success' && <ActionButton action="rerun" body={{ run_id: run.id }} csrf={me.csrf} label="re-run failed jobs" confirm={`Re-run the failed jobs of run #${run.run_number ?? run.id}?`} onDone={reload} />}
            </>
          )}
        </MemberOnly>
        {run.html_url && (
          <a href={run.html_url} target="_blank" rel="noopener" className="inline-flex h-7 items-center gap-1 rounded-md border border-[var(--raft-hair-strong)] px-2 font-mono text-xs text-muted-foreground hover:text-foreground">
            GitHub <ArrowUpRight className="size-3" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </div>
    </div>
  );
}

/** Job progress: one bar per job, filled by completed steps, coloured by state. */
function JobBars({ jobs }: { jobs: JobView[] }) {
  if (jobs.length === 0) return <p className="mt-2 font-mono text-xs text-muted-foreground">No job has reported yet.</p>;
  return (
    <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
      {jobs.map((v) => {
        const j = v.job;
        const done = j.steps.filter((s) => s.status === 'completed').length;
        const pct = j.status === 'completed' ? 100 : j.steps.length ? Math.round((done / j.steps.length) * 100) : j.status === 'in_progress' ? 10 : 0;
        const tone = toneOf(j.status, j.conclusion);
        const bar = tone === 'ok' ? 'bg-[var(--raft-ok-dot)]' : tone === 'bad' ? 'bg-destructive' : tone === 'warn' ? 'bg-[var(--raft-amber)]' : tone === 'live' ? 'bg-primary' : 'bg-[var(--raft-hair-strong)]';
        return (
          <li key={j.id} className="rounded-md border border-[var(--raft-hair)] px-2.5 py-2 text-xs">
            <span className="flex items-baseline justify-between gap-2">
              <span className="truncate font-mono" title={j.name}>
                {j.name}
              </span>
              <span className="shrink-0 font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
                {j.status === 'completed' ? (j.conclusion ?? 'done') : j.status === 'in_progress' ? `${done}/${j.steps.length || '?'} steps` : (j.status ?? 'queued')}
                {v.stuck && ' · stuck?'}
              </span>
            </span>
            <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-[var(--raft-bar-track)]" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${j.name}: ${pct}%`}>
              <span className={`block h-full rounded-full ${bar} transition-[width]`} style={{ width: `${pct}%` }} />
            </span>
            <span className="mt-1 block font-mono text-[0.6875rem] text-muted-foreground">
              {j.labels.join(', ')}
              {v.elapsed_seconds != null && ` · ${duration(v.elapsed_seconds)}`}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function BuildLine({ build, buildsBase, known }: { build: Build; buildsBase: string; known: Record<string, string[]> }) {
  const sitePage = build.version_tag && known[build.image]?.includes(build.version_tag) ? `${buildsBase}${build.image}/builds/${build.version_tag}/` : null;
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--raft-hair)] pt-2.5 font-mono text-xs">
      <span className="text-muted-foreground">build</span>
      <span>
        {build.image} {build.version_tag ?? ''}
      </span>
      <StatePill status={build.result === null ? 'in_progress' : 'completed'} conclusion={build.result} />
      {build.mode && <span className="text-muted-foreground">{build.mode}</span>}
      {build.reason && <span className="text-muted-foreground">{build.reason}</span>}
      {build.test_success !== null && <span className={build.test_success ? 'text-[var(--raft-ok)]' : 'text-[var(--raft-danger)]'}>tests {build.test_success ? 'passed' : 'failed'}</span>}
      {sitePage && (
        <a href={sitePage} className="underline underline-offset-4 decoration-[var(--raft-hair-strong)] hover:text-foreground hover:decoration-current">
          CI results
        </a>
      )}
      {build.release_url && <ExtLink href={build.release_url}>release</ExtLink>}
      {build.artifact_url && !build.release_url && <ExtLink href={build.artifact_url}>artifact</ExtLink>}
    </p>
  );
}

// ---------------------------------------------------------------- one run

export function RunDetail({ id, runsBase, buildsBase, known, fallback }: { id: string; runsBase: string; buildsBase: string; known: Record<string, string[]>; fallback: string }) {
  const { data, error, loading, at, reload } = useControl<RunPage>(`runs/${id}.json`, TABLES);
  const [selected, setSelected] = React.useState<number | null>(null);
  // Default to what is happening now, else the first job that has steps (skipped jobs have none).
  const job = data?.jobs.find((j) => j.job.id === selected) ?? data?.jobs.find((j) => j.job.status === 'in_progress') ?? data?.jobs.find((j) => j.job.steps.length > 0) ?? data?.jobs[0];
  return (
    <div className="space-y-6">
      <section className="raft-panel overflow-hidden" aria-label="Run">
        <PanelBar title={`run ${id}`} note={data ? `${data.jobs.length} jobs` : undefined} at={at} />
        {!data && loading && <Skeleton rows={4} />}
        {!data && !loading && error && <Offline error={error} retry={reload} fallback={{ label: 'Open this run on the control plane', href: fallback }} />}
        {data && (
          <div className="p-3.5">
            <RunHead run={data.run} elapsed={data.elapsed_seconds} stuck={false} runsBase={runsBase} reload={reload} detail />
            <JobBars jobs={data.jobs} />
            {data.builds.map((b) => (
              <BuildLine key={b.run_id + (b.version_tag ?? '')} build={b} buildsBase={buildsBase} known={known} />
            ))}
          </div>
        )}
      </section>

      {data && data.jobs.length > 0 && (
        <section className="raft-panel overflow-hidden" aria-labelledby="steps-title">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--raft-hair)] bg-[var(--raft-surface)] px-3.5 py-2">
            <h2 id="steps-title" className="font-mono text-xs">
              steps
            </h2>
            <label className="inline-flex items-center gap-2 font-mono text-[0.6875rem] text-muted-foreground uppercase">
              job
              <select value={job?.job.id ?? ''} onChange={(e) => setSelected(Number(e.target.value))} className="h-8 max-w-[14rem] rounded-md border border-[var(--raft-hair-strong)] bg-background px-2 font-mono text-xs text-foreground normal-case">
                {data.jobs.map((j) => (
                  <option key={j.job.id} value={j.job.id}>
                    {j.job.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {job && <Steps job={job.job} />}
        </section>
      )}
    </div>
  );
}

/** The steps of one job as a timeline: each bar's offset and width are its share of the job's wall time. */
function Steps({ job }: { job: Job }) {
  const now = useNow();
  const start = job.started_at ? Date.parse(job.started_at) : null;
  const end = job.completed_at ? Date.parse(job.completed_at) : now;
  const span = start ? Math.max(1, end - start) : 1;
  const steps = job.steps;
  return (
    <div>
      {steps.length === 0 ? (
        <Empty>{job.status === 'completed' ? 'GitHub reported no steps for this job.' : 'Waiting for the first step.'}</Empty>
      ) : (
        <ol className="divide-y divide-[var(--raft-hair)]">
          {steps.map((s) => {
            const t = toneOf(s.status, s.conclusion);
            const s0 = s.started_at ? Date.parse(s.started_at) : null;
            const s1 = s.completed_at ? Date.parse(s.completed_at) : s.status === 'in_progress' ? now : null;
            const left = start && s0 ? ((s0 - start) / span) * 100 : 0;
            const width = s0 && s1 ? Math.max(0.6, ((s1 - s0) / span) * 100) : 0;
            const bar = t === 'ok' ? 'bg-[var(--raft-ok-dot)]' : t === 'bad' ? 'bg-destructive' : t === 'warn' ? 'bg-[var(--raft-amber)]' : t === 'live' ? 'bg-primary' : 'bg-[var(--raft-hair-strong)]';
            return (
              <li key={`${s.number}-${s.name}`} className="grid grid-cols-[1.5rem_minmax(0,1fr)_5rem] items-center gap-2 px-3.5 py-1.5 text-xs sm:grid-cols-[1.5rem_minmax(0,14rem)_minmax(0,1fr)_5rem]">
                <span className="font-mono text-[0.6875rem] text-muted-foreground tabular-nums">{s.number ?? ''}</span>
                <span className="truncate" title={s.name}>
                  {s.name}
                </span>
                <span className="hidden h-2 rounded-full bg-[var(--raft-bar-track)] sm:block" aria-hidden="true">
                  <span className={`block h-full rounded-full ${bar}`} style={{ marginLeft: `${left}%`, width: `${width}%` }} />
                </span>
                <span className="text-right font-mono text-[0.6875rem] tabular-nums">
                  <StepState s={s} />
                </span>
              </li>
            );
          })}
        </ol>
      )}
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[var(--raft-hair)] px-3.5 py-2 font-mono text-[0.6875rem] text-muted-foreground">
        <span>{job.runner_name ?? (job.status === 'completed' ? 'no runner' : 'no runner yet')}</span>
        <span>{job.labels.join(', ')}</span>
        {start && <span>{duration((end - start) / 1000)}</span>}
        {job.html_url && (
          <a href={job.html_url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 underline underline-offset-4 decoration-[var(--raft-hair-strong)] hover:text-foreground hover:decoration-current">
            logs on GitHub <ArrowUpRight className="size-3" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </p>
    </div>
  );
}

function StepState({ s }: { s: Step }) {
  const t = toneOf(s.status, s.conclusion);
  const secs = s.started_at && s.completed_at ? (Date.parse(s.completed_at) - Date.parse(s.started_at)) / 1000 : null;
  const cls = t === 'ok' ? 'text-[var(--raft-ok)]' : t === 'bad' ? 'text-[var(--raft-danger)]' : t === 'live' ? 'text-primary' : 'text-muted-foreground';
  return (
    <span className={cls}>
      {t === 'live' ? 'running' : t === 'ok' ? (secs != null ? duration(secs) : 'ok') : (s.conclusion ?? s.status ?? '–')}
      <span className="sr-only">{t === 'ok' ? ', succeeded' : ''}</span>
    </span>
  );
}


/** `/fleet/runs/?run=<id>`: the detail of a run the site has no pre-rendered page for (the 404 page sends them here). */
export function RunFromQuery({ runsBase, buildsBase, known, controlUrl }: { runsBase: string; buildsBase: string; known: Record<string, string[]>; controlUrl: string }) {
  const [id, setId] = React.useState<string | null>(null);
  React.useEffect(() => {
    const v = new URL(location.href).searchParams.get('run');
    if (v && /^\d+$/.test(v)) setId(v);
  }, []);
  if (!id) return null;
  return (
    <div className="mb-8">
      <h2 className="mb-3 text-xl font-semibold tracking-tight">Run #{id}</h2>
      <RunDetail id={id} runsBase={runsBase} buildsBase={buildsBase} known={known} fallback={`${controlUrl}/runs/${id}`} />
    </div>
  );
}
