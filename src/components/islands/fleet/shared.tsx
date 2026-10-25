/**
 * Building blocks of the fleet islands: status pills, live relative times, the loading and offline states,
 * the member-only gate and the inline confirmation every management action goes through.
 */
import * as React from 'react';
import { Check, CloudOff, Minus, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ago, until, stamp, toneOf, useMe, useStreamState, postAction, ControlError, type ActionName, type ActionResult, type Me, type Tone } from '@/lib/control';

// ---------------------------------------------------------------- time

/** The current time, refreshed every 30 s, so relative labels age while the page is open. */
export function useNow(): number {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

/** "3 min ago" (or "in 12 min") with the full UTC timestamp in `title`. */
export function Rel({ iso, mode = 'ago', className }: { iso: string | null | undefined; mode?: 'ago' | 'until'; className?: string }) {
  const now = useNow();
  if (!iso) return <span className={cn('text-muted-foreground', className)}>–</span>;
  return (
    <time dateTime={iso} title={stamp(iso)} className={cn('tabular-nums whitespace-nowrap', className)}>
      {mode === 'ago' ? ago(iso, now) : until(iso, now)}
    </time>
  );
}

// ---------------------------------------------------------------- pills

// Tinted backgrounds only in dark mode: on white even an 8% tint pulls the 11px text under 7:1.
const TONE: Record<Tone, string> = {
  ok: 'text-[var(--raft-ok)] border-[var(--raft-ok)]/30 dark:bg-[var(--raft-ok)]/12',
  bad: 'text-[var(--raft-danger)] border-destructive/30 dark:bg-destructive/10',
  warn: 'text-[var(--raft-amber)] border-[var(--raft-amber)]/35 dark:bg-[var(--raft-amber)]/12',
  muted: 'border-[var(--raft-hair-strong)] text-muted-foreground',
  live: 'border-primary/40 text-primary',
};

/** A status pill: green, red, amber, grey or "live" (primary, pulsing dot). Text always carries the meaning. */
export function Pill({ tone, children, title, className, dot = true }: { tone: Tone; children: React.ReactNode; title?: string; className?: string; dot?: boolean }) {
  return (
    <span title={title} className={cn('inline-flex h-6 items-center gap-1.5 rounded-md border px-1.5 font-mono text-[0.6875rem] whitespace-nowrap', TONE[tone], className)}>
      {dot && tone === 'live' && <span className="raft-pulse" aria-hidden="true" />}
      {dot && tone === 'ok' && <Check className="size-3" aria-hidden="true" />}
      {dot && tone === 'bad' && <X className="size-3" aria-hidden="true" />}
      {dot && tone === 'muted' && <Minus className="size-3" aria-hidden="true" />}
      {children}
    </span>
  );
}

/** A run, job or build state as a pill; `null` reads as "no build". */
export function StatePill({ status, conclusion, label }: { status: string | null | undefined; conclusion?: string | null; label?: string }) {
  const tone = toneOf(status, conclusion);
  const text = label ?? (tone === 'live' ? (status ?? 'running').replace('_', ' ') : (conclusion ?? status ?? 'no build').replace('_', ' '));
  return <Pill tone={tone}>{text}</Pill>;
}

export function DriftPill({ drift }: { drift: string }) {
  const tone: Tone = drift === 'ahead' ? 'warn' : drift === 'same' ? 'ok' : 'muted';
  const title = drift === 'ahead' ? 'Upstream has a newer version than the released tag' : drift === 'same' ? 'The released tag matches upstream' : 'The scheduler has not compared this branch yet';
  return (
    <Pill tone={tone} title={title} dot={false}>
      {drift === 'ahead' ? '↑ ahead' : drift === 'same' ? '= same' : '? unknown'}
    </Pill>
  );
}

// ---------------------------------------------------------------- live indicator

/** "live" / "reconnecting" / "offline" from the shared event stream, for a panel header. */
export function LiveDot({ at }: { at?: Date | null }) {
  const s = useStreamState();
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[0.6875rem] text-muted-foreground" title={at ? `Data fetched ${stamp(at.toISOString())}` : undefined}>
      {s === 'open' ? (
        <>
          <span className="raft-pulse" aria-hidden="true" /> live
        </>
      ) : s === 'error' ? (
        <>
          <span className="inline-block size-2 rounded-full bg-[var(--raft-amber)]" aria-hidden="true" /> reconnecting
        </>
      ) : (
        <>
          <span className="inline-block size-2 rounded-full bg-[var(--raft-hair-strong)]" aria-hidden="true" /> polling off
        </>
      )}
    </span>
  );
}

// ---------------------------------------------------------------- states

/** Designed loading state: a few shimmering rows the size of the table that is coming. */
export function Skeleton({ rows = 5, label = 'Loading from the control plane…' }: { rows?: number; label?: string }) {
  return (
    <div className="p-4" role="status" aria-live="polite">
      <p className="sr-only">{label}</p>
      <div className="space-y-2.5" aria-hidden="true">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="h-3.5 w-24 rounded bg-[var(--raft-bar-track)] motion-safe:animate-pulse" />
            <span className="h-3.5 flex-1 rounded bg-[var(--raft-bar-track)] motion-safe:animate-pulse" style={{ maxWidth: `${55 - i * 7}%` }} />
            <span className="h-5 w-16 rounded-md border border-[var(--raft-hair)] motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** The honest state when the control plane cannot be reached: what is missing, where it lives, retry. */
export function Offline({ error, retry, fallback }: { error: string; retry: () => void; fallback?: { label: string; href: string } }) {
  return (
    <div className="grid place-items-center gap-2 px-6 py-12 text-center" role="alert">
      <CloudOff className="size-6 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium">Live data is unavailable right now.</p>
      <p className="max-w-md text-xs text-muted-foreground">{error} This panel reads the control plane's JSON API in your browser; nothing here is cached by the site.</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={retry} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--raft-hair-strong)] px-3 text-sm hover:bg-muted">
          <RefreshCw className="size-3.5" aria-hidden="true" /> Try again
        </button>
        {fallback && (
          <a href={fallback.href} target="_blank" rel="noopener" className="text-xs text-muted-foreground underline underline-offset-4 decoration-[var(--raft-hair-strong)] hover:text-foreground hover:decoration-current">
            {fallback.label}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-4 py-8 text-center text-sm text-muted-foreground">{children}</p>;
}

/** Header strip of a live panel: a title, a count or note, the live dot and whatever controls follow. */
export function PanelBar({ title, note, at, children }: { title: string; note?: React.ReactNode; at?: Date | null; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-[var(--raft-hair)] bg-[var(--raft-surface)] px-3.5 py-2">
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-mono text-xs text-foreground">{title}</p>
        {note && <p className="font-mono text-[0.6875rem] text-muted-foreground">{note}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        <LiveDot at={at} />
      </div>
    </div>
  );
}

/** Table shell: the panel scrolls horizontally on narrow screens so the page never does. */
export function Table({ children, className, label }: { children: React.ReactNode; className?: string; label?: string }) {
  return (
    <div className="relative overflow-x-auto">
      <table className={cn('w-full text-left text-sm', className)} aria-label={label}>
        {children}
      </table>
    </div>
  );
}
export const TH = ({ children, className, right }: { children?: React.ReactNode; className?: string; right?: boolean }) => (
  <th scope="col" className={cn('px-3 py-2 font-mono text-[0.6875rem] font-normal text-muted-foreground uppercase whitespace-nowrap', right && 'text-right', className)}>
    {children}
  </th>
);
export const TD = ({ children, className, right, mono, title }: { children?: React.ReactNode; className?: string; right?: boolean; mono?: boolean; title?: string }) => (
  <td title={title} className={cn('px-3 py-2.5 align-top', right && 'text-right', mono && 'font-mono text-xs tabular-nums', className)}>
    {children}
  </td>
);

export const ExtLink = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
  <a href={href} target="_blank" rel="noopener" className={cn('underline-offset-4 hover:text-primary hover:underline', className)}>
    {children}
    <span className="sr-only"> (opens in a new tab)</span>
  </a>
);

/** A small select styled like the site's inputs. */
export function Select({ label, value, onChange, options, className }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string }) {
  const id = React.useId();
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <label htmlFor={id} className="font-mono text-[0.6875rem] text-muted-foreground uppercase">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="h-8 rounded-md border border-[var(--raft-hair-strong)] bg-background px-2 font-mono text-xs text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </span>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-[var(--raft-hair-strong)] px-2.5 font-mono text-xs select-none has-[:checked]:border-primary/50 has-[:checked]:text-primary">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span aria-hidden="true" className={cn('inline-block size-2 rounded-full', checked ? 'bg-primary' : 'bg-[var(--raft-hair-strong)]')} />
      {label}
    </label>
  );
}

// ---------------------------------------------------------------- members and actions

/** Renders `children(me)` only for signed-in organisation members; nothing otherwise. */
export function MemberOnly({ children }: { children: (me: Me & { csrf: string }) => React.ReactNode }) {
  const me = useMe();
  if (!me || !me.member || !me.csrf) return null;
  return <>{children(me as Me & { csrf: string })}</>;
}

export interface ActionField {
  name: string;
  label: string;
  /** A picker when `options` is set, else a text input. */
  options?: readonly string[] | string[];
  placeholder?: string;
  required?: boolean;
}

/**
 * A management button that confirms in place: the first click opens a small form (fields, confirm and
 * cancel), the confirm posts the action with the CSRF header and shows the logged result underneath. The
 * stream event that follows refreshes the surrounding panel; `onDone` lets a caller refresh sooner.
 */
export function ActionButton({
  action,
  body,
  csrf,
  label,
  confirm,
  fields = [],
  tone = 'default',
  onDone,
  className,
  size = 'sm',
}: {
  action: ActionName;
  body: Record<string, string | number>;
  csrf: string;
  label: string;
  /** The question asked before posting. */
  confirm: string;
  fields?: ActionField[];
  tone?: 'default' | 'danger';
  onDone?: (r: ActionResult) => void;
  className?: string;
  size?: 'sm' | 'xs';
}) {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [values, setValues] = React.useState<Record<string, string>>(() => Object.fromEntries(fields.map((f) => [f.name, f.options?.[0] ?? ''])));
  const [result, setResult] = React.useState<{ ok: boolean; text: string } | null>(null);
  const firstField = React.useRef<HTMLSelectElement | HTMLInputElement>(null);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const id = React.useId();

  React.useEffect(() => {
    if (open) firstField.current?.focus();
  }, [open]);

  const submit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const r = await postAction(action, { ...body, ...values }, csrf);
      setResult({ ok: r.ok, text: r.detail || (r.ok ? 'Done.' : 'Refused.') });
      onDone?.(r);
      if (r.ok) setOpen(false);
    } catch (err) {
      setResult({ ok: false, text: err instanceof ControlError ? err.message : 'The request failed.' });
    } finally {
      setBusy(false);
      trigger.current?.focus();
    }
  };

  const btn = size === 'xs' ? 'h-6 px-1.5 text-[0.6875rem]' : 'h-7 px-2 text-xs';
  return (
    <span className={cn('relative inline-flex flex-col items-start gap-1', className)}>
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          setOpen((o) => !o);
          setResult(null);
        }}
        className={cn(
          'inline-flex items-center rounded-md border font-mono whitespace-nowrap focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
          btn,
          tone === 'danger' ? 'border-destructive/40 text-[var(--raft-danger)] hover:bg-destructive/10' : 'border-[var(--raft-hair-strong)] text-foreground hover:bg-muted',
          open && 'bg-muted',
        )}
      >
        {label}
      </button>
      {open && (
        <form id={id} onSubmit={submit} className="raft-panel z-20 flex min-w-56 flex-col gap-2 p-3 text-sm shadow-lg" aria-label={`Confirm: ${label}`}>
          <p className="text-[0.8125rem]">{confirm}</p>
          {fields.map((f, i) => {
            const fid = `${id}-${f.name}`;
            return (
              <label key={f.name} htmlFor={fid} className="flex flex-col gap-1 font-mono text-[0.6875rem] text-muted-foreground uppercase">
                {f.label}
                {f.options ? (
                  <select
                    id={fid}
                    ref={i === 0 ? (firstField as React.RefObject<HTMLSelectElement>) : undefined}
                    value={values[f.name]}
                    onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    className="h-8 rounded-md border border-[var(--raft-hair-strong)] bg-background px-2 font-mono text-xs text-foreground normal-case"
                  >
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={fid}
                    ref={i === 0 ? (firstField as React.RefObject<HTMLInputElement>) : undefined}
                    value={values[f.name]}
                    required={f.required}
                    placeholder={f.placeholder}
                    onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                    className="h-8 rounded-md border border-[var(--raft-hair-strong)] bg-background px-2 font-mono text-xs text-foreground normal-case"
                  />
                )}
              </label>
            );
          })}
          <div className="mt-1 flex items-center gap-2">
            <button type="submit" disabled={busy} className={cn('inline-flex h-7 items-center rounded-md px-2.5 text-xs font-medium disabled:opacity-60', tone === 'danger' ? 'bg-destructive text-background' : 'bg-primary text-primary-foreground hover:bg-primary/85')}>
              {busy ? 'Sending…' : 'Confirm'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="inline-flex h-7 items-center rounded-md border border-[var(--raft-hair-strong)] px-2.5 text-xs hover:bg-muted">
              Cancel
            </button>
          </div>
        </form>
      )}
      {result && (
        <span role="status" className={cn('font-mono text-[0.6875rem]', result.ok ? 'text-[var(--raft-ok)]' : 'text-[var(--raft-danger)]')}>
          {result.text}
        </span>
      )}
    </span>
  );
}

/** Skip / unskip for one scope (`image`, `image/branch`), from the row's own flags. */
export function SkipControls({ scope, flags, csrf, onDone }: { scope: string; flags: string[]; csrf: string; onDone?: () => void }) {
  const active = flags.includes(scope);
  return active ? (
    <ActionButton action="unskip" body={{ scope }} csrf={csrf} label="unskip" size="xs" confirm={`Clear the skip flag on ${scope}? The scheduler will dispatch builds for it again.`} fields={[{ name: 'reason', label: 'reason', placeholder: 'why' }]} onDone={onDone} />
  ) : (
    <ActionButton action="skip" body={{ scope }} csrf={csrf} label="skip" size="xs" tone="danger" confirm={`Set a skip flag on ${scope}? The scheduler will stop dispatching builds for it until it is cleared.`} fields={[{ name: 'reason', label: 'reason', placeholder: 'why', required: true }]} onDone={onDone} />
  );
}

/** Dispatch (with a reason picker) and package-check buttons for one branch. */
export function BranchActions({ repo, branch, csrf, onDone, packageCheck = true }: { repo: string; branch: string; csrf: string; onDone?: () => void; packageCheck?: boolean }) {
  return (
    <>
      <ActionButton
        action="dispatch"
        body={{ repo, branch }}
        csrf={csrf}
        label="dispatch"
        size="xs"
        confirm={`Dispatch build.yml on ${repoLabel(repo)} ${branch}?`}
        fields={[{ name: 'reason', label: 'reason', options: ['manual', 'rebuild', 'packages', 'upstream'] }]}
        onDone={onDone}
      />
      {packageCheck && <ActionButton action="packages" body={{ repo, branch }} csrf={csrf} label="packages" size="xs" confirm={`Run a package check on ${repoLabel(repo)} ${branch} now? This resets the branch's weekly slot.`} onDone={onDone} />}
    </>
  );
}

const repoLabel = (repo: string) => repo.split('/').pop();

/** The one-line notice for browsers that drop the cross-site cookie (Safari) after a sign-in round trip. */
export function CookieNotice() {
  const me = useMe();
  const [pending, setPending] = React.useState(false);
  React.useEffect(() => {
    try {
      if (sessionStorage.getItem('control-login') === 'pending') {
        setPending(true);
        sessionStorage.removeItem('control-login');
      }
    } catch {}
  }, []);
  if (!pending || !me || me.authenticated) return null;
  return (
    <p role="status" className="rounded-md border border-[var(--raft-amber)]/40 bg-[var(--raft-amber)]/10 px-3 py-2 text-xs text-foreground">
      You signed in, but this browser did not send the control plane's cookie back to the site (Safari blocks cross-site cookies). Chromium-based browsers work; the control plane's own pages always do.
    </p>
  );
}
