/**
 * The editing bar on a post or docs page, for people who may edit the site (nobody else sees anything): Edit opens
 * the editor (on the page's open edit when there is one, so everyone works in one pull request), Delete proposes
 * removing the page and its files in a pull request after showing what goes, and the page's open edits are listed
 * with their pull requests. The blog index and docs sections use `NewBar` for posts and pages not published yet.
 */
import * as React from 'react';
import { GitPullRequest, Pencil, Trash2 } from 'lucide-react';
import { ControlError, useMe } from '@/lib/control';
import { authorizeUrl, deleteEntry, editorUrl, getRemoval, type EditPull, type Pending, type Removal } from '@/lib/editor';
import { cn } from '@/lib/utils';
import { ExtLink, Pill, Rel } from '../fleet/shared';
import { useEditorStatus, usePending } from './hooks';

const btn = 'inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-sm transition-colors disabled:pointer-events-none disabled:opacity-50';

export function ChecksPill({ checks }: { checks: EditPull['checks'] }) {
  if (checks === 'success') return <Pill tone="ok">checks passed</Pill>;
  if (checks === 'failure') return <Pill tone="bad">checks failed</Pill>;
  if (checks === 'pending') return <Pill tone="live">checks running</Pill>;
  return null;
}

const CHANGE: Record<Pending['change'], string> = { new: 'new', edit: 'edit', delete: 'deletion' };

/** One open edit: what it is, who started it, its pull request, and a way in. */
export function PendingRow({ edit, label }: { edit: Pending; label?: string }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 py-2">
      <div className="min-w-0">
        <p className="truncate">
          {label ?? edit.title ?? edit.key}{' '}
          <span className="font-mono text-[0.6875rem] text-muted-foreground">
            {CHANGE[edit.change]} by @{edit.owner}
            {edit.updated_at && (
              <>
                {' · '}
                <Rel iso={edit.updated_at} />
              </>
            )}
          </span>
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[0.6875rem] text-muted-foreground">
          {edit.pull ? (
            <>
              <ExtLink href={edit.pull.url} className="inline-flex items-center gap-1">
                <GitPullRequest className="size-3" aria-hidden="true" />#{edit.pull.number}
              </ExtLink>
              <ChecksPill checks={edit.pull.checks} />
            </>
          ) : (
            <span>saved, no pull request yet</span>
          )}
        </p>
      </div>
      {edit.change !== 'delete' && (
        <a href={editorUrl(edit.path, edit.branch)} className={cn(btn, 'h-7 border-[var(--raft-hair-strong)] text-xs hover:bg-muted')}>
          <Pencil className="size-3.5" aria-hidden="true" /> Open<span className="sr-only"> {edit.title ?? edit.key}</span>
        </a>
      )}
    </li>
  );
}

export default function EntryBar({ path, kind, title }: { path: string; kind: 'doc' | 'post'; title: string }) {
  const status = useEditorStatus();
  const me = useMe();
  const edits = usePending(!!status?.can_edit).filter((e) => e.path === path);
  const [deleting, setDeleting] = React.useState<'closed' | 'loading' | 'confirm' | 'busy' | 'done'>('closed');
  const [plan, setPlan] = React.useState<Removal | null>(null);
  const [message, setMessage] = React.useState('');
  const [result, setResult] = React.useState<{ ok: boolean; text: string; url?: string } | null>(null);

  if (!status?.can_edit) return null;
  const noun = kind === 'doc' ? 'page' : 'post';
  const open = edits.find((e) => e.change !== 'delete');
  const proposed = edits.find((e) => e.change === 'delete');
  const deleteBranch = open?.branch ?? null;

  const startDelete = async () => {
    setResult(null);
    setDeleting('loading');
    try {
      setPlan(await getRemoval(path, deleteBranch));
      setDeleting('confirm');
    } catch (e) {
      setResult({ ok: false, text: e instanceof ControlError ? e.message : 'The control plane could not be reached.' });
      setDeleting('closed');
    }
  };
  const confirmDelete = async () => {
    if (!me?.csrf) return;
    setDeleting('busy');
    try {
      const r = await deleteEntry(path, deleteBranch, title, message.trim() || undefined, me.csrf);
      setResult({ ok: r.ok, text: r.ok ? `The deletion is proposed in pull request #${r.pull?.number}. Merging it removes the ${noun}.` : r.detail, url: r.pull?.url });
      setDeleting(r.ok ? 'done' : 'confirm');
    } catch (e) {
      setResult({ ok: false, text: e instanceof ControlError ? e.message : 'The request failed.' });
      setDeleting('confirm');
    }
  };

  return (
    <section aria-label={`Editing this ${noun}`} className="not-prose my-6 rounded-md border border-dashed border-[var(--raft-hair-strong)] bg-[var(--raft-surface)] p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-auto font-mono text-[0.6875rem] text-muted-foreground">Editor · only people who can edit the site see this</p>
        <a href={editorUrl(path, open?.branch)} className={cn(btn, 'border-transparent bg-primary text-primary-foreground hover:ring-2 hover:ring-primary/40')}>
          <Pencil className="size-4" aria-hidden="true" /> Edit
          {open && <span className="sr-only"> (joins the open edit by {open.owner})</span>}
        </a>
        {!proposed && deleting === 'closed' && (
          <button type="button" onClick={startDelete} className={cn(btn, 'border-[var(--raft-hair-strong)] text-muted-foreground hover:bg-muted hover:text-foreground')}>
            <Trash2 className="size-4" aria-hidden="true" /> Delete
          </button>
        )}
      </div>
      {open && <p className="mt-2 text-xs text-muted-foreground">Edit joins the open edit by @{open.owner}: your saves go into the same pull request.</p>}

      {edits.length > 0 && (
        <div className="mt-3 border-t border-[var(--raft-hair)] pt-2">
          <h2 className="font-mono text-[0.6875rem] text-muted-foreground">Open edits of this {noun}</h2>
          <ul className="divide-y divide-[var(--raft-hair)]">
            {edits.map((e) => (
              <PendingRow key={e.branch} edit={e} label={e.change === 'delete' ? `Delete this ${noun}` : undefined} />
            ))}
          </ul>
        </div>
      )}

      {deleting === 'loading' && (
        <p role="status" className="mt-3 text-muted-foreground">
          Working out what deleting it removes…
        </p>
      )}
      {(deleting === 'confirm' || deleting === 'busy') && plan && (
        <div role="group" aria-label={`Delete this ${noun}`} className="mt-3 space-y-3 rounded-md border border-[var(--raft-danger)]/40 bg-[var(--raft-danger)]/5 p-3">
          {!status.authorized ? (
            <>
              <p>Deleting is a commit by you, so GitHub has to authorise the editor once first.</p>
              <a href={authorizeUrl(location.href)} className={cn(btn, 'border-[var(--raft-hair-strong)] bg-background hover:bg-muted')}>
                Authorise on GitHub
              </a>
            </>
          ) : (
            <>
              <p>
                Delete this {noun}? A pull request removes these {plan.files.length} files; when it merges the {noun} is gone for good and its address answers 404.
                {open && ` This turns @${open.owner}'s open edit into the deletion.`}
              </p>
              <ul className="max-h-40 overflow-y-auto rounded border border-[var(--raft-hair)] bg-background px-3 py-2 font-mono text-xs">
                {plan.files.map((f) => (
                  <li key={f} className="break-all">
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="delete-message" className="font-mono text-[0.6875rem] text-muted-foreground">
                  Why (optional)
                </label>
                <input
                  id="delete-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={100}
                  placeholder={`Delete the outdated ${noun}`}
                  className="h-8 min-w-0 flex-1 rounded-md border border-[var(--raft-hair-strong)] bg-background px-2.5 text-sm placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={confirmDelete} disabled={deleting === 'busy'} className={cn(btn, 'border-transparent bg-[var(--raft-danger)] text-[var(--background)] hover:opacity-90')}>
                  {deleting === 'busy' ? 'Proposing…' : 'Delete in a pull request'}
                </button>
                <button type="button" onClick={() => setDeleting('closed')} className={cn(btn, 'border-[var(--raft-hair-strong)] bg-background hover:bg-muted')}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {result && (
        <p role={result.ok ? 'status' : 'alert'} className={cn('mt-3 rounded-md border px-3 py-2', result.ok ? 'border-[var(--raft-ok)]/40 bg-[var(--raft-ok)]/10' : 'border-[var(--raft-danger)]/40 bg-[var(--raft-danger)]/10')}>
          {result.text}{' '}
          {result.url && (
            <ExtLink href={result.url} className="underline">
              Review it on GitHub
            </ExtLink>
          )}
        </p>
      )}
    </section>
  );
}
