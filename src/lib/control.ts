/**
 * The control plane's JSON API (control/views.py in linuxserver-playground/control, "Driving control from
 * the website" in its README): shapes, URLs, credentialed fetch, the member actions and the React hooks the
 * fleet islands share. Browser-safe: no astro:* imports.
 *
 * Every request carries the session cookie (`credentials: "include"`); the cookie is the only credential.
 * The CSRF token comes from `/api/me` per page load and lives in memory only.
 */
import * as React from 'react';

/** The control plane's origin, without a trailing slash. `PUBLIC_CONTROL_URL` at build time. */
export const CONTROL_URL: string = ((import.meta.env?.PUBLIC_CONTROL_URL as string | undefined) ?? 'https://ci.thelamer.duckdns.org:8443').replace(/\/+$/, '');

export const controlApi = (path: string) => `${CONTROL_URL}/api/${path.replace(/^\/+/, '')}`;
/** The control plane's own HTML page for an image. */
export const controlImageUrl = (name: string) => `${CONTROL_URL}/images/${name}`;
export const controlRunUrl = (id: number | string) => `${CONTROL_URL}/runs/${id}`;
export const controlBuildUrl = (repo: string, runId: number | string) => `${CONTROL_URL}/builds/${repo}/${runId}`;
/** Sign-in: GitHub OAuth on the control plane, then straight back to `next` (an absolute URL on the site). */
export const loginUrl = (next: string) => `${CONTROL_URL}/login?next=${encodeURIComponent(next)}`;

// ---------------------------------------------------------------------------------------------------
// Shapes (pydantic models in control/views.py and control/model.py)

export interface FleetRow {
  repo: string;
  image: string;
  branch: string;
  default_branch: boolean;
  archived: boolean;
  /** success | failure | cancelled | … | null before the first build. */
  result: string | null;
  built_at: string | null;
  run_id: number | null;
  reason: string | null;
  version_tag: string | null;
  released: string | null;
  released_at: string | null;
  upstream: string | null;
  drift: 'ahead' | 'same' | 'unknown' | string;
  next_check: string | null;
  last_check: string | null;
  last_outcome: string | null;
  source: string | null;
  /** The upstream release, commit or package page for `upstream`, else the project's releases page or website. */
  upstream_url?: string | null;
  package_check: boolean;
  /** Matching skip scopes (`image`, `image/branch`, `image/branch/version`), plus `archived`. */
  skip: string[];
  /** The same flags with their reason, author and time (older control planes leave it out). */
  skips?: Skip[];
}
/** A `docker-*` repo that is not an image (no image.yml on its default branch), with each branch's newest build. */
export interface HelperRepo {
  repo: string;
  name: string;
  archived: boolean;
  branches: number;
  success: number;
  running: number;
  failing: string[];
  /** The failing branches with the run that failed, newest first (older control planes leave it out). */
  failures?: HelperFailure[];
  last_run_at: string | null;
}
export interface HelperFailure { branch: string; run_id: number; conclusion: string; html_url: string | null; at: string }
export interface FleetPage { rows: FleetRow[]; images: number; helpers?: HelperRepo[]; generated_at: string }

export interface Run {
  id: number;
  repo: string;
  workflow_name: string | null;
  event: string | null;
  branch: string | null;
  head_sha: string | null;
  run_number: number | null;
  status: string | null;
  conclusion: string | null;
  started_at: string | null;
  html_url: string | null;
  actor: string | null;
  display_title: string | null;
  attempt: number;
  created_at: string;
  updated_at: string;
}
export interface Step { name: string; status?: string | null; conclusion?: string | null; number?: number | null; started_at?: string | null; completed_at?: string | null }
export interface Job {
  id: number;
  run_id: number;
  repo: string;
  name: string;
  status: string | null;
  conclusion: string | null;
  started_at: string | null;
  completed_at: string | null;
  runner_name: string | null;
  runner_group: string | null;
  labels: string[];
  steps: Step[];
  html_url: string | null;
  created_at: string;
  updated_at: string;
}
/** `branch` and `event` come from the job's run (queue page only; jobs carry no branch). */
export interface JobView { job: Job; elapsed_seconds: number | null; threshold_seconds: number | null; stuck: boolean; branch?: string | null; event?: string | null }
export interface Build {
  repo: string;
  run_id: number;
  run_url: string | null;
  image: string;
  branch: string | null;
  mode: string | null;
  pull_request: number | null;
  reason: string | null;
  /** success | failure | null while running. */
  result: string | null;
  failed_job: string | null;
  version_tag: string | null;
  release_tag: string | null;
  upstream: string | null;
  upstream_clean: string | null;
  semver: string | null;
  ls_build: number | null;
  test_success: boolean | null;
  release_url: string | null;
  artifact_url: string | null;
  index_digest: string | null;
  /** A released build: `pending` until the hub serves it, then `live` (the site renders it from then on). */
  publish_state?: 'pending' | 'live' | 'overdue' | 'expired' | null;
  platforms: { arch: string; result?: string | null }[];
  received_at: string;
  created_at: string;
  updated_at: string;
}
export interface RunView { run: Run; jobs: JobView[]; elapsed_seconds: number | null; stuck: boolean; build: Build | null }
export interface RunsPage { active: RunView[]; recent: Run[]; generated_at: string }
export interface RunPage { run: Run; jobs: JobView[]; builds: Build[]; elapsed_seconds: number | null }
export interface QueuePage { queued: JobView[]; in_progress: JobView[]; limit: number; in_use: number; utilisation: number; generated_at: string }
export interface PullRequest {
  repo: string;
  number: number;
  title: string;
  author: string | null;
  state: string;
  draft: boolean;
  head_sha: string | null;
  head_fork: boolean;
  merged_at: string | null;
  review_state: string | null;
  html_url: string | null;
  created_at: string;
  updated_at: string;
}
export interface PullView { pull: PullRequest; run: Run | null; quarantine_tag: string | null }
export interface PullsPage { pulls: PullView[] }
export interface Issue { repo: string; number: number; title: string; author: string | null; state: string; labels: string[]; html_url: string | null; created_at: string; updated_at: string }
export interface IssuesPage { issues: Issue[] }
export interface Release { repo: string; tag: string; name: string | null; prerelease: boolean; published_at: string | null; html_url: string | null; body: string | null; created_at: string; updated_at: string }
export interface ReleaseView { release: Release; build: Build | null }
export interface ReleasesPage { releases: ReleaseView[] }
export interface BuildPage { build: Build; bundle: Record<string, unknown> | null; run: Run | null; jobs: JobView[] }
export interface Repo { full_name: string; name: string; default_branch: string; archived: boolean; is_image: boolean; image_name: string | null }
export interface ImagePage {
  repo: Repo;
  image: string;
  tag: string | null;
  rows: FleetRow[];
  latest: Build | null;
  builds: Build[];
  releases: Release[];
  open_pulls: number;
  open_issues: number;
  badge_url: string;
}
export interface SchedulerDecision { id: number; at: string; image: string; branch: string; kind: string; outcome: string; detail: string | null }
export interface DecisionView { decision: SchedulerDecision; info: Record<string, unknown>; run: Run | null }

/** `/api/batch.json`: the batch build projects (proot-apps, selkies-layers, wheelie) control schedules. */
export interface BatchRun { run_id: number; attempt: number; repo: string; workflow: string; conclusion: string | null; html_url: string | null; completed_at: string; failed: string[]; newly_failing: string[]; recovered: string[]; alerted: boolean; evaluated_at: string }
/** One job of a batch project (an app, a layer-distro-arch, a distro and arch) whose newest result is kept. */
export interface BatchUnit { repo: string; workflow: string; unit: string; state: 'pass' | 'fail' | string; since: string; run_id: number; run_created_at: string; html_url: string | null; updated_at: string }
export interface BatchProject {
  repo: string;
  workflow: string;
  ref: string;
  schedule: string;
  cap: number;
  live: boolean;
  note: string;
  next_at: string;
  parallel_now: number;
  active_run: Run | null;
  last_decision: DecisionView | null;
  last_dispatch: DecisionView | null;
  /** The newest evaluated runs, newest first. */
  runs: BatchRun[];
  /** Units whose newest result is a failure. */
  failing: BatchUnit[];
}
export interface BatchPage { enabled: boolean; projects: BatchProject[]; generated_at: string }
export interface Upcoming { image: string; branch: string; kind: string; at: string }
export interface SchedulerPage {
  enabled: boolean;
  decisions: DecisionView[];
  image: string | null;
  outcome: string | null;
  kind: string | null;
  images: string[];
  outcomes: string[];
  kinds: string[];
  upcoming: Upcoming[];
  live_branches: number;
  generated_at: string;
}
export interface Skip { scope: string; reason: string | null; set_by: string; set_at: string }
export interface SkipsPage { skips: Skip[] }
export interface Action { id: number; at: string; actor: string; action: string; target: string | null; result: string; detail: string | null }
export interface ActionsPage { actions: Action[] }
export interface Me { authenticated: boolean; login: string | null; avatar_url: string | null; member: boolean; checked_at: string | null; csrf: string | null }

export type ActionName = 'rerun' | 'cancel' | 'dispatch' | 'packages' | 'skip' | 'unskip' | 'reconcile';
export interface ActionResult { ok: boolean; action_id?: number | null; detail?: string | null }
export const DISPATCH_REASONS = ['manual', 'rebuild', 'packages', 'upstream'] as const;

// ---------------------------------------------------------------------------------------------------
// Fetching

export class ControlError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** One credentialed GET of `/api/<path>`. Throws `ControlError` on a non-2xx answer or a network failure. */
export async function fetchControl<T>(path: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(controlApi(path), { credentials: 'include', signal, headers: { Accept: 'application/json' } });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new ControlError(0, 'The control plane could not be reached.');
  }
  if (!res.ok) throw new ControlError(res.status, res.status === 404 ? 'Not found on the control plane.' : `The control plane answered ${res.status}.`);
  return (await res.json()) as T;
}

/** `POST /api/actions/<action>` with a JSON body and the CSRF header. Resolves with the logged result; rejects on 4xx. */
export async function postAction(action: ActionName, body: Record<string, string | number>, csrf: string): Promise<ActionResult> {
  let res: Response;
  try {
    res = await fetch(controlApi(`actions/${action}`), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf, Accept: 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ControlError(0, 'The control plane could not be reached.');
  }
  const data = (await res.json().catch(() => ({}))) as ActionResult & { detail?: string };
  if (res.status === 401) throw new ControlError(401, 'Your session has expired. Sign in again.');
  if (res.status === 403) throw new ControlError(403, 'Only organisation members can do this.');
  if (res.status === 429) throw new ControlError(429, 'Too many actions in the last hour. Try again later.');
  if (!res.ok) throw new ControlError(res.status, typeof data.detail === 'string' ? data.detail : `The control plane answered ${res.status}.`);
  return data;
}

export async function logout(csrf: string): Promise<void> {
  await fetch(controlApi('logout'), { method: 'POST', credentials: 'include', headers: { 'X-CSRF-Token': csrf } });
}

// ---------------------------------------------------------------------------------------------------
// Live updates: one EventSource per page, shared by every island

type Listener = (table: string, key: unknown) => void;
let source: EventSource | null = null;
const listeners = new Set<Listener>();
let streamState: 'idle' | 'open' | 'error' = 'idle';
const stateListeners = new Set<(s: typeof streamState) => void>();

function setStreamState(s: typeof streamState) {
  streamState = s;
  for (const l of stateListeners) l(s);
}

function openStream() {
  if (source || typeof EventSource === 'undefined') return;
  source = new EventSource(controlApi('stream'), { withCredentials: true });
  source.onopen = () => setStreamState('open');
  source.onerror = () => setStreamState('error');
  source.onmessage = (ev) => {
    let data: { type?: string; key?: unknown } = {};
    try {
      data = JSON.parse(ev.data);
    } catch {
      return;
    }
    if (!data.type) return;
    for (const l of listeners) l(data.type, data.key);
  };
}

function closeStreamIfIdle() {
  if (listeners.size === 0 && source) {
    source.close();
    source = null;
    setStreamState('idle');
  }
}

/** Subscribes to the control plane's SSE feed while mounted; `fn` is called with the changed table. */
export function useStream(fn: Listener | null) {
  React.useEffect(() => {
    if (!fn) return;
    listeners.add(fn);
    openStream();
    return () => {
      listeners.delete(fn);
      closeStreamIfIdle();
    };
  }, [fn]);
}

/** The feed's connection state, for a "live" indicator. */
export function useStreamState() {
  const [s, setS] = React.useState(streamState);
  React.useEffect(() => {
    stateListeners.add(setS);
    setS(streamState);
    return () => {
      stateListeners.delete(setS);
    };
  }, []);
  return s;
}

export interface Loaded<T> {
  data: T | null;
  /** The message of the last failure, when the data is stale or missing. */
  error: string | null;
  loading: boolean;
  /** When `data` was last fetched. */
  at: Date | null;
  reload: () => void;
}

/**
 * Fetches `/api/<path>` on mount and again, debounced, whenever the stream reports a change to one of
 * `tables` (every table when `tables` is omitted). Keeps the last good data through a failed refresh.
 */
export function useControl<T>(path: string | null, tables?: string[]): Loaded<T> {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(!!path);
  const [at, setAt] = React.useState<Date | null>(null);
  const [tick, setTick] = React.useState(0);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const tablesKey = tables?.join(',') ?? '*';

  React.useEffect(() => {
    if (!path) return;
    const ctrl = new AbortController();
    setLoading(true);
    fetchControl<T>(path, ctrl.signal)
      .then((d) => {
        setData(d);
        setError(null);
        setAt(new Date());
      })
      .catch((e) => {
        if ((e as Error).name === 'AbortError') return;
        setError((e as Error).message);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [path, tick]);

  const onEvent = React.useCallback(
    (table: string) => {
      if (tablesKey !== '*' && !tablesKey.split(',').includes(table)) return;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setTick((t) => t + 1), 400);
    },
    [tablesKey],
  );
  useStream(path ? onEvent : null);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  const reload = React.useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, at, reload };
}

// ---------------------------------------------------------------------------------------------------
// Who am I: one request per page, shared

let mePromise: Promise<Me> | null = null;
let meValue: Me | null = null;
const meListeners = new Set<(m: Me | null) => void>();
const ANON: Me = { authenticated: false, login: null, avatar_url: null, member: false, checked_at: null, csrf: null };

export function loadMe(force = false): Promise<Me> {
  if (!mePromise || force) {
    mePromise = fetchControl<Me>('me')
      .catch(() => ANON)
      .then((m) => {
        meValue = m;
        for (const l of meListeners) l(m);
        return m;
      });
  }
  return mePromise;
}

export function setMe(m: Me | null) {
  meValue = m;
  mePromise = m ? Promise.resolve(m) : null;
  for (const l of meListeners) l(m);
}

/**
 * `null` until `/api/me` has answered; then who is signed in (or the anonymous answer). The first render is
 * always `null`, like the server's, even when another island already has the answer: islands hydrate at
 * different times, and starting from a known `me` would not match the server-rendered HTML.
 */
export function useMe(): Me | null {
  const [me, set] = React.useState<Me | null>(null);
  React.useEffect(() => {
    set(meValue);
    meListeners.add(set);
    loadMe();
    return () => {
      meListeners.delete(set);
    };
  }, []);
  return me;
}

// ---------------------------------------------------------------------------------------------------
// Small formatting helpers for live data (the visitor's clock, not the snapshot's)

/** "3 min ago" / "2 h ago" / "5 d ago", compact for dense tables. */
export function ago(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return '–';
  const s = Math.max(0, (now - Date.parse(iso)) / 1000);
  if (s < 45) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  if (s < 86400 * 14) return `${Math.round(s / 86400)} d ago`;
  return `${Math.round(s / (86400 * 7))} wk ago`;
}

/** "in 12 min" / "in 3 h" for the next scheduled check. */
export function until(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return '–';
  const s = (Date.parse(iso) - now) / 1000;
  if (s <= 30) return 'due now';
  if (s < 3600) return `in ${Math.round(s / 60)} min`;
  if (s < 86400) return `in ${Math.round(s / 3600)} h`;
  return `in ${Math.round(s / 86400)} d`;
}

/** 488 → "8 min 8 s"; 27 → "27 s"; 7322 → "2 h 2 min". */
export function duration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return '–';
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s} s`;
  if (s < 3600) return `${Math.floor(s / 60)} min${s % 60 ? ` ${s % 60} s` : ''}`;
  return `${Math.floor(s / 3600)} h${Math.floor((s % 3600) / 60) ? ` ${Math.floor((s % 3600) / 60)} min` : ''}`;
}

/** Full UTC timestamp for `title` attributes: "2026-10-25 00:14:09 UTC". */
export const stamp = (iso: string | null | undefined) => (iso ? new Date(iso).toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC') : '');

/** The image name of a repository: `linuxserver-playground/docker-sonarr` → `sonarr`. */
export const repoImage = (repo: string) => repo.split('/').pop()!.replace(/^docker-/, '');
export const repoShort = (repo: string) => repo.split('/').pop()!;

/** A green / red / amber / grey tone for a run or job state. */
export type Tone = 'ok' | 'bad' | 'warn' | 'muted' | 'live';
export function toneOf(status: string | null | undefined, conclusion?: string | null): Tone {
  if (status === 'in_progress' || status === 'queued' || status === 'waiting' || status === 'pending' || status === 'requested') return 'live';
  const c = (conclusion ?? status ?? '').toLowerCase();
  if (c === 'success' || c === 'passed' || c === 'ok') return 'ok';
  if (c === 'failure' || c === 'failed' || c === 'timed_out' || c === 'startup_failure' || c === 'error') return 'bad';
  if (c === 'cancelled' || c === 'canceled' || c === 'action_required' || c === 'stale') return 'warn';
  return 'muted';
}
