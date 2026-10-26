/**
 * One docs page or post open in the editor: the Markdown on the left, the preview on the right (tabs on a
 * phone), and the three things an edit can do. Save commits to the member's own branch through the control
 * plane; Open pull request proposes it (merging publishes it); Discard closes the pull request and deletes the
 * branch. Images pasted, dropped or picked are kept here and go into the next save, beside the entry. The text
 * is also kept in this browser until it is saved, so a closed tab or an expired session loses nothing.
 */
import * as React from 'react';
import { ExternalLink, GitPullRequest, ImagePlus, Save, Trash2, TriangleAlert } from 'lucide-react';
import { withBase } from '@/lib/base';
import { ControlError } from '@/lib/control';
import {
  discardEntry,
  fileToBase64,
  getEntry,
  IMAGE_MAX,
  IMAGE_NAME,
  livePath,
  postTemplate,
  docTemplate,
  problems,
  publishEntry,
  saveEntry,
  SECTIONS,
  splitFrontMatter,
  type EditorEntry,
  type EditPull,
} from '@/lib/editor';
import { renderPreview } from '@/lib/markdown/preview';
import { cn } from '@/lib/utils';
import { ExtLink, Offline, Pill, Rel, Skeleton } from '../fleet/shared';
import type { CodeEditorHandle } from './CodeEditor';

const CodeEditor = React.lazy(() => import('./CodeEditor'));

const normalize = (s: string) => s.replace(/\r\n/g, '\n').replace(/\n*$/, '\n');
const draftKey = (path: string) => `lsio-editor:${path}`;

interface Draft {
  text: string;
  at: string;
}
function readDraft(path: string): Draft | null {
  try {
    const raw = localStorage.getItem(draftKey(path));
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}
function writeDraft(path: string, text: string | null) {
  try {
    if (text === null) localStorage.removeItem(draftKey(path));
    else localStorage.setItem(draftKey(path), JSON.stringify({ text, at: new Date().toISOString() }));
  } catch {}
}

interface Pending {
  file: File;
  url: string;
}
type Notice = { tone: 'ok' | 'bad' | 'warn'; text: string; link?: { href: string; label: string }; action?: { label: string; run: () => void } };

/** A file name the control plane accepts, unique among the entry's images. */
function imageName(file: File, taken: Set<string>): string | null {
  const ext = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] ?? file.type.split('/')[1] ?? '').toLowerCase().replace('jpeg', 'jpg');
  if (!['png', 'jpg', 'gif', 'webp'].includes(ext)) return null;
  const stem =
    file.name
      .replace(/\.[^.]*$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-')
      .replace(/^[^a-z0-9]+|-+$/g, '')
      .slice(0, 60) || 'image';
  let name = `${stem}.${ext}`;
  for (let i = 2; taken.has(name); i++) name = `${stem}-${i}.${ext}`;
  return IMAGE_NAME.test(name) ? name : null;
}

function ChecksPill({ pull }: { pull: EditPull }) {
  if (pull.checks === 'success') return <Pill tone="ok">checks passed</Pill>;
  if (pull.checks === 'failure') return <Pill tone="bad">checks failed</Pill>;
  if (pull.checks === 'pending') return <Pill tone="live">checks running</Pill>;
  return null;
}

export default function Workspace({ path, csrf, login, newTitle, onUnauthorized }: { path: string; csrf: string; login: string; newTitle: string | null; onUnauthorized: () => void }) {
  const [entry, setEntry] = React.useState<EditorEntry | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [attempt, setAttempt] = React.useState(0);
  const [text, setText] = React.useState('');
  const [saved, setSaved] = React.useState('');
  /** What the entry opened with (its content, or the template for a new one): leaving it untouched loses nothing. */
  const [baseline, setBaseline] = React.useState('');
  const [head, setHead] = React.useState('');
  const [pending, setPending] = React.useState<Map<string, Pending>>(() => new Map());
  const [uploaded, setUploaded] = React.useState<Map<string, string>>(() => new Map());
  const [message, setMessage] = React.useState('');
  const [busy, setBusy] = React.useState<'save' | 'publish' | 'discard' | null>(null);
  const [notice, setNotice] = React.useState<Notice | null>(null);
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [confirmDiscard, setConfirmDiscard] = React.useState(false);
  const [tab, setTab] = React.useState<'write' | 'preview'>('write');
  const [docKey, setDocKey] = React.useState(0);
  const editor = React.useRef<CodeEditorHandle>(null);
  const picker = React.useRef<HTMLInputElement>(null);

  const kind = path.startsWith('src/content/docs/') ? 'doc' : 'post';
  const dirty = normalize(text) !== normalize(saved) || pending.size > 0;
  const changed = normalize(text) !== normalize(baseline) || pending.size > 0;

  const failed = React.useCallback(
    (e: unknown, what: string) => {
      if (e instanceof ControlError && e.status === 428) return onUnauthorized();
      setNotice({ tone: 'bad', text: e instanceof ControlError ? e.message : `${what} failed.` });
    },
    [onUnauthorized],
  );

  // Load (and reload after a discard or a conflict); the text starts from the template for a new entry.
  React.useEffect(() => {
    let live = true;
    setLoadError(null);
    getEntry(path)
      .then((e) => {
        if (!live) return;
        const section = path.split('/')[3];
        const start = e.exists ? e.content : kind === 'doc' ? docTemplate(newTitle || 'Untitled page', section) : postTemplate(newTitle || 'Untitled post', login);
        setEntry(e);
        setText(start);
        setBaseline(start);
        setSaved(e.exists ? e.content : '');
        setHead(e.head);
        setPending(new Map());
        setUploaded(new Map());
        setDocKey((k) => k + 1);
        const d = readDraft(path);
        setDraft(d && normalize(d.text) !== normalize(start) ? d : null);
      })
      .catch((err) => {
        if (!live) return;
        if (err instanceof ControlError && err.status === 428) onUnauthorized();
        else setLoadError(err instanceof ControlError ? err.message : 'The entry could not be loaded.');
      });
    return () => {
      live = false;
    };
  }, [path, attempt, kind, login, newTitle, onUnauthorized]);

  // Keep unsaved text in this browser, a second after typing stops.
  React.useEffect(() => {
    if (!entry || !changed || !dirty) return;
    const t = setTimeout(() => writeDraft(path, text), 1000);
    return () => clearTimeout(t);
  }, [entry, changed, dirty, path, text]);

  React.useEffect(() => {
    if (!changed || !dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    addEventListener('beforeunload', warn);
    return () => removeEventListener('beforeunload', warn);
  }, [changed, dirty]);

  const addFiles = React.useCallback(
    async (files: File[]) => {
      const taken = new Set([...(entry?.images ?? []), ...pending.keys(), ...uploaded.keys()]);
      const added = new Map(pending);
      const lines: string[] = [];
      const refused: string[] = [];
      for (const file of files) {
        const name = file.size <= IMAGE_MAX ? imageName(file, taken) : null;
        if (!name) {
          refused.push(file.name || 'an image');
          continue;
        }
        taken.add(name);
        added.set(name, { file, url: URL.createObjectURL(file) });
        lines.push(`![${name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')}](./${name})`);
      }
      setPending(added);
      if (refused.length) setNotice({ tone: 'warn', text: `Not added: ${refused.join(', ')}. Images are png, jpg, gif or webp, up to 5 MiB each.` });
      return lines.length ? `${lines.join('\n\n')}\n` : null;
    },
    [entry, pending, uploaded],
  );

  const save = React.useCallback(async () => {
    if (!entry || busy || !dirty) return;
    setBusy('save');
    setNotice(null);
    try {
      const assets = await Promise.all([...pending].map(async ([name, p]) => ({ name, data: await fileToBase64(p.file) })));
      const r = await saveEntry({ path, content: text, head, message: message.trim() || undefined, assets }, csrf);
      if (!r.ok || !r.head) {
        setNotice({ tone: 'bad', text: r.detail || 'GitHub refused the save.' });
        return;
      }
      setHead(r.head);
      setSaved(text);
      setBaseline(text);
      setUploaded((u) => new Map([...u, ...[...pending].map(([n, p]) => [n, p.url] as [string, string])]));
      setPending(new Map());
      setMessage('');
      writeDraft(path, null);
      setDraft(null);
      setEntry((e) => (e ? { ...e, exists: true, on_branch: true } : e));
      setNotice({ tone: 'ok', text: `Saved to ${r.branch}.`, link: r.commit_url ? { href: r.commit_url, label: 'View the commit' } : undefined });
    } catch (e) {
      if (e instanceof ControlError && e.status === 409) {
        setNotice({
          tone: 'bad',
          text: `${e.message} Your text is kept in this browser.`,
          action: {
            label: 'Reload the entry',
            run: () => {
              writeDraft(path, text);
              setAttempt((a) => a + 1);
            },
          },
        });
      } else failed(e, 'Saving');
    } finally {
      setBusy(null);
    }
  }, [entry, busy, dirty, pending, path, text, head, message, csrf, failed]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        save();
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [save]);

  const parsed = React.useMemo(() => splitFrontMatter(text), [text]);
  const images = React.useMemo(() => new Set([...(entry?.images ?? []), ...pending.keys(), ...uploaded.keys()]), [entry, pending, uploaded]);
  const issues = React.useMemo(() => problems(kind, path, parsed, images), [kind, path, parsed, images]);
  const deferredBody = React.useDeferredValue(parsed.body);
  const previewImages = React.useMemo(
    () => ({ pending: new Map([...uploaded, ...[...pending].map(([n, p]) => [n, p.url] as [string, string])]), rawBase: entry?.raw_base ?? '' }),
    [uploaded, pending, entry],
  );
  const html = React.useMemo(() => (entry ? renderPreview(deferredBody, previewImages) : ''), [entry, deferredBody, previewImages]);

  const publish = async () => {
    if (!entry) return;
    setBusy('publish');
    setNotice(null);
    try {
      const title = typeof parsed.data.title === 'string' ? parsed.data.title : undefined;
      const r = await publishEntry(path, title, csrf);
      if (r.ok && r.pull) {
        setEntry({ ...entry, pull: r.pull, on_branch: true });
        setNotice({ tone: 'ok', text: `Pull request #${r.pull.number} is open. The site's checks build it; merging it publishes the change.`, link: { href: r.pull.url, label: 'Review it on GitHub' } });
      } else setNotice({ tone: 'bad', text: r.detail || 'The pull request could not be opened.' });
    } catch (e) {
      failed(e, 'Opening the pull request');
    } finally {
      setBusy(null);
    }
  };

  const discard = async () => {
    setBusy('discard');
    setNotice(null);
    try {
      const r = await discardEntry(path, csrf);
      setConfirmDiscard(false);
      if (!r.ok) {
        setNotice({ tone: 'bad', text: r.detail });
        return;
      }
      writeDraft(path, null);
      setNotice({ tone: 'ok', text: 'The edit is discarded: the pull request is closed and the branch deleted.' });
      setAttempt((a) => a + 1);
    } catch (e) {
      failed(e, 'Discarding');
    } finally {
      setBusy(null);
    }
  };

  if (loadError) return <Offline error={loadError} retry={() => setAttempt((a) => a + 1)} />;
  if (!entry) return <Skeleton rows={8} label="Opening the entry…" />;

  const live = livePath(path);
  const section = SECTIONS.find((s) => s.id === path.split('/')[3]);
  const title = typeof parsed.data.title === 'string' ? parsed.data.title : '';
  const description = typeof parsed.data.description === 'string' ? parsed.data.description : '';
  const tags = Array.isArray(parsed.data.tags) ? parsed.data.tags.filter((t): t is string => typeof t === 'string') : [];
  const hero = typeof parsed.data.hero === 'string' ? parsed.data.hero.replace(/^\.\//, '') : null;
  const heroSrc = hero ? (previewImages.pending.get(hero) ?? entry.raw_base + hero) : null;
  const date = parsed.data.date ? new Date(String(parsed.data.date instanceof Date ? parsed.data.date.toISOString() : parsed.data.date)) : null;
  const status = !entry.exists ? 'new' : dirty ? 'unsaved' : entry.on_branch ? 'saved' : 'clean';
  const btn = 'inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-sm transition-colors disabled:pointer-events-none disabled:opacity-50';

  return (
    <div className="space-y-3">
      {/* What is open, where it stands, and what can be done with it. */}
      <div className="raft-panel flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <p className="truncate font-mono text-xs text-foreground" title={path}>
            {entry.key}
          </p>
          {entry.published ? <Pill tone="ok">live</Pill> : <Pill tone="muted">not published</Pill>}
          {status === 'unsaved' && <Pill tone="warn">unsaved changes</Pill>}
          {status === 'saved' && <Pill tone="live" dot={false}>on your branch</Pill>}
          {status === 'new' && !dirty && <Pill tone="muted">new</Pill>}
          {entry.pull && (
            <>
              <ExtLink href={entry.pull.url} className="inline-flex items-center gap-1 font-mono text-xs">
                <GitPullRequest className="size-3.5" aria-hidden="true" /> #{entry.pull.number}
              </ExtLink>
              <ChecksPill pull={entry.pull} />
            </>
          )}
          {entry.published && live && (
            <a href={withBase(live)} className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground" target="_blank" rel="noopener">
              live page <ExternalLink className="size-3" aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={picker}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            multiple
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={async (e) => {
              const files = [...(e.target.files ?? [])];
              e.target.value = '';
              const md = files.length ? await addFiles(files) : null;
              if (md) editor.current?.insert(md);
            }}
          />
          <button type="button" className={cn(btn, 'border-[var(--raft-hair-strong)] hover:bg-muted')} onClick={() => picker.current?.click()}>
            <ImagePlus className="size-4" aria-hidden="true" /> Image
          </button>
          <button type="button" className={cn(btn, 'border-transparent bg-primary text-primary-foreground hover:bg-primary/85')} onClick={save} disabled={!dirty || busy !== null} title="Commit to your branch (Ctrl+S)">
            <Save className="size-4" aria-hidden="true" /> {busy === 'save' ? 'Saving…' : 'Save'}
          </button>
          {!entry.pull && (
            <button
              type="button"
              className={cn(btn, 'border-[var(--raft-hair-strong)] hover:bg-muted')}
              onClick={publish}
              disabled={dirty || !entry.on_branch || issues.length > 0 || busy !== null}
              title={dirty ? 'Save first' : !entry.on_branch ? 'Nothing saved yet' : issues.length ? 'Fix the front matter first' : 'Propose this edit; merging it publishes it'}
            >
              <GitPullRequest className="size-4" aria-hidden="true" /> {busy === 'publish' ? 'Opening…' : 'Open pull request'}
            </button>
          )}
          {entry.on_branch && !confirmDiscard && (
            <button type="button" className={cn(btn, 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground')} onClick={() => setConfirmDiscard(true)} disabled={busy !== null}>
              <Trash2 className="size-4" aria-hidden="true" /> Discard
            </button>
          )}
        </div>
        <div className="flex w-full flex-wrap items-center gap-2">
          <label htmlFor="edit-message" className="font-mono text-[0.6875rem] text-muted-foreground">
            Commit message
          </label>
          <input
            id="edit-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={100}
            placeholder={entry.exists ? 'Fix the compose example (optional)' : 'Optional'}
            className="h-8 min-w-0 flex-1 rounded-md border border-[var(--raft-hair-strong)] bg-background px-2.5 text-sm placeholder:text-muted-foreground"
          />
        </div>
        {confirmDiscard && (
          <div role="group" aria-label="Confirm discard" className="flex w-full flex-wrap items-center gap-2 rounded-md border border-[var(--raft-danger)]/40 bg-[var(--raft-danger)]/5 p-2 text-sm">
            <p className="mr-auto">Throw this edit away? {entry.pull ? `Pull request #${entry.pull.number} is closed and ` : 'The '}branch {entry.branch} is deleted. The live page is not touched.</p>
            <button type="button" className={cn(btn, 'border-transparent bg-[var(--raft-danger)] text-white hover:opacity-90')} onClick={discard} disabled={busy !== null}>
              {busy === 'discard' ? 'Discarding…' : 'Discard the edit'}
            </button>
            <button type="button" className={cn(btn, 'border-[var(--raft-hair-strong)] hover:bg-muted')} onClick={() => setConfirmDiscard(false)}>
              Keep it
            </button>
          </div>
        )}
      </div>

      {(notice || draft || issues.length > 0) && (
        <div className="space-y-2" aria-live="polite">
          {draft && (
            <div role="status" className="flex flex-wrap items-center gap-2 rounded-md border border-[var(--raft-amber)]/40 bg-[var(--raft-amber)]/10 px-3 py-2 text-sm">
              <p className="mr-auto">
                This browser kept unsaved text for this entry from <Rel iso={draft.at} />.
              </p>
              <button
                type="button"
                className={cn(btn, 'h-7 border-[var(--raft-hair-strong)] bg-background hover:bg-muted')}
                onClick={() => {
                  setText(draft.text);
                  setDocKey((k) => k + 1);
                  setDraft(null);
                }}
              >
                Restore it
              </button>
              <button
                type="button"
                className={cn(btn, 'h-7 border-transparent text-muted-foreground hover:text-foreground')}
                onClick={() => {
                  writeDraft(path, null);
                  setDraft(null);
                }}
              >
                Throw it away
              </button>
            </div>
          )}
          {notice && (
            <div
              role={notice.tone === 'bad' ? 'alert' : 'status'}
              className={cn(
                'flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border px-3 py-2 text-sm',
                notice.tone === 'ok' && 'border-[var(--raft-ok)]/40 bg-[var(--raft-ok)]/10',
                notice.tone === 'bad' && 'border-[var(--raft-danger)]/40 bg-[var(--raft-danger)]/10',
                notice.tone === 'warn' && 'border-[var(--raft-amber)]/40 bg-[var(--raft-amber)]/10',
              )}
            >
              <p>{notice.text}</p>
              {notice.link && <ExtLink href={notice.link.href} className="underline">{notice.link.label}</ExtLink>}
              {notice.action && (
                <button type="button" onClick={notice.action.run} className="underline underline-offset-4">
                  {notice.action.label}
                </button>
              )}
            </div>
          )}
          {issues.length > 0 && (
            <div role="status" className="rounded-md border border-[var(--raft-amber)]/40 bg-[var(--raft-amber)]/10 px-3 py-2 text-sm">
              <p className="inline-flex items-center gap-1.5 font-medium">
                <TriangleAlert className="size-4" aria-hidden="true" /> The site's build would refuse this front matter
              </p>
              <ul className="mt-1 list-disc pl-6">
                {issues.map((i) => (
                  <li key={i}>{i.replace(/`([^`]+)`/g, '$1')}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-1 lg:hidden" role="group" aria-label="Pane">
        {(['write', 'preview'] as const).map((p) => (
          <button key={p} type="button" aria-pressed={tab === p} onClick={() => setTab(p)} className={cn('h-8 flex-1 rounded-md border text-sm capitalize', tab === p ? 'border-[var(--raft-hair-strong)] bg-muted font-medium' : 'border-transparent text-muted-foreground')}>
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <section aria-label="Markdown" className={cn('raft-panel overflow-hidden lg:block', tab === 'write' ? 'block' : 'hidden')}>
          <div className="h-[calc(100dvh-16rem)] min-h-[28rem]">
            <React.Suspense fallback={<Skeleton rows={10} label="Loading the editor…" />}>
              <CodeEditor ref={editor} value={text} docKey={`${path}:${docKey}`} onChange={setText} onFiles={addFiles} label={`Markdown of ${entry.key}`} />
            </React.Suspense>
          </div>
        </section>
        <section aria-label="Preview" className={cn('raft-panel overflow-hidden lg:block', tab === 'preview' ? 'block' : 'hidden')}>
          <div className="h-[calc(100dvh-16rem)] min-h-[28rem] overflow-y-auto p-5 md:p-8">
            <header className="mb-8 border-b border-[var(--raft-hair)] pb-6">
              <p className="raft-eyebrow">
                <span className="text-primary" aria-hidden="true">
                  //
                </span>{' '}
                {kind === 'doc' ? (section?.title ?? 'Docs') : 'Blog'}
              </p>
              <p className="mt-3 text-3xl leading-tight font-semibold tracking-tight">{title || <span className="text-muted-foreground">No title yet</span>}</p>
              {kind === 'doc' && description && <p className="mt-3 text-lg text-muted-foreground">{description}</p>}
              {kind === 'post' && (
                <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
                  <span>{date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : 'dated when its pull request merges'}</span>
                  {typeof parsed.data.author === 'string' && <span>by {parsed.data.author}</span>}
                  {tags.map((t) => (
                    <span key={t}>#{t}</span>
                  ))}
                </p>
              )}
              {kind === 'post' && heroSrc && <img src={heroSrc} alt={typeof parsed.data.heroAlt === 'string' ? parsed.data.heroAlt : ''} className="mt-5 aspect-[1200/630] w-full rounded-md border border-[var(--raft-hair)] object-cover" />}
            </header>
            <div className="post-body prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        </section>
      </div>
      <p className="font-mono text-[0.6875rem] text-muted-foreground">
        Saves commit to <span className="text-foreground">{entry.branch}</span> as {login}. The preview is close to the site's render; the pull request's build is the exact one.
      </p>
    </div>
  );
}
