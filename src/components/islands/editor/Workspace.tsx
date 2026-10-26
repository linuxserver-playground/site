/**
 * One docs page or post open in the editor. Details (title, tags, hero…) are a form over the front matter and the
 * text pane holds the body; "Advanced editor" shows the whole file instead. Insert adds images, a gallery, a video
 * (served as uploaded, so it must already play in browsers) or a YouTube embed; files go up as soon as they are
 * added and into the next save. Split view writes beside a quick preview; Preview shows the page exactly as the
 * site lays it out (the same components), with the body rendered in the browser.
 *
 * Save commits to the edit's branch (the open one this page joined, or the member's own); Open pull request
 * proposes it, and merging publishes it; Discard closes the pull request and deletes the branch. Unsaved text is
 * kept in this browser, so a closed tab or an expired session loses nothing.
 */
import * as React from 'react';
import { Columns2, Eye, FileCode, Film, GitPullRequest, Image as ImageIcon, Images, Plus, Save, Trash2, TriangleAlert, MonitorPlay } from 'lucide-react';
import { withBase } from '@/lib/base';
import { ControlError } from '@/lib/control';
import {
  discardEntry,
  docTemplate,
  fileToBase64,
  getEntry,
  IMAGE_MAX,
  IMAGE_NAME,
  joinFile,
  livePath,
  postTemplate,
  problems,
  publishEntry,
  saveEntry,
  setFrontMatter,
  splitFile,
  splitFrontMatter,
  uploadFile,
  VIDEO_MAX,
  VIDEO_NAME,
  type EditorEntry,
} from '@/lib/editor';
import { renderPreview, type Rendered } from '@/lib/markdown/preview';
import { readingTimeOf, slugify, tagSlug, tagUrl, initials } from '@/lib/post-text';
import { cn } from '@/lib/utils';
import DocsLayout, { type NavGroup, type NavSection } from '../../article/DocsLayout';
import PostArticle from '../../article/PostArticle';
import { ExtLink, Offline, Pill, Rel, Skeleton } from '../fleet/shared';
import type { CodeEditorHandle } from './CodeEditor';
import { ChecksPill } from './EntryBar';

const CodeEditor = React.lazy(() => import('./CodeEditor'));

/** What the editor knows from the build: authors, tags and images to suggest, and the docs' sidebar for the preview. */
export interface EditorData {
  authors: { id: string; name: string; keys: string[] }[];
  tags: string[];
  containers: string[];
  sections: (NavSection & { groups: NavGroup[] })[];
}

const normalize = (s: string) => s.replace(/\r\n/g, '\n').replace(/\n*$/, '\n');
const draftKey = (path: string, branch: string) => `lsio-editor:${path}:${branch}`;

interface Draft {
  text: string;
  at: string;
}
function readDraft(key: string): Draft | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}
function writeDraft(key: string, text: string | null) {
  try {
    if (text === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify({ text, at: new Date().toISOString() }));
  } catch {}
}

/** A file added in the editor: uploading, then a blob the next save names. `ref` is how the Markdown points at it. */
interface Added {
  name: string;
  kind: 'image' | 'video';
  ref: string;
  url: string;
  sha: string | null;
  failed?: string;
  /** Committed by a save; kept so the preview still shows it from this browser. */
  saved?: boolean;
}
type Notice = { tone: 'ok' | 'bad' | 'warn'; text: string; link?: { href: string; label: string }; action?: { label: string; run: () => void } };

/** A file name the control plane accepts, unique among the entry's files. */
function fileName(file: File, taken: Set<string>): string | null {
  const ext = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] ?? file.type.split('/')[1] ?? '').toLowerCase().replace('jpeg', 'jpg');
  if (!['png', 'jpg', 'gif', 'webp', 'mp4', 'webm'].includes(ext)) return null;
  const stem =
    file.name
      .replace(/\.[^.]*$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-')
      .replace(/^[^a-z0-9]+|-+$/g, '')
      .slice(0, 60) || 'file';
  let name = `${stem}.${ext}`;
  for (let i = 2; taken.has(name); i++) name = `${stem}-${i}.${ext}`;
  return IMAGE_NAME.test(name) || VIDEO_NAME.test(name) ? name : null;
}

const altOf = (name: string) => name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');

/** `https://youtu.be/ID`, `youtube.com/watch?v=ID`, `/shorts/ID`, `/embed/ID` → the privacy-enhanced embed. */
export function youtubeEmbed(url: string): string | null {
  const m = url.trim().match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{6,})/);
  return m
    ? `<iframe src="https://www.youtube-nocookie.com/embed/${m[1]}" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>\n`
    : null;
}

const btn = 'inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-sm transition-colors disabled:pointer-events-none disabled:opacity-50';
const quiet = cn(btn, 'border-[var(--raft-hair-strong)] hover:bg-muted');
const field = 'h-8 w-full min-w-0 rounded-md border border-[var(--raft-hair-strong)] bg-background px-2.5 text-sm placeholder:text-muted-foreground';

export default function Workspace({
  path,
  branch,
  csrf,
  login,
  newTitle,
  newGroup,
  data,
  onUnauthorized,
}: {
  path: string;
  branch: string | null;
  csrf: string;
  login: string;
  newTitle: string | null;
  newGroup: string | null;
  data: EditorData;
  onUnauthorized: () => void;
}) {
  const [entry, setEntry] = React.useState<EditorEntry | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [attempt, setAttempt] = React.useState(0);
  const [text, setText] = React.useState('');
  const [saved, setSaved] = React.useState('');
  /** What the entry opened with (its content, or the template for a new one): leaving it untouched loses nothing. */
  const [baseline, setBaseline] = React.useState('');
  const [head, setHead] = React.useState('');
  const [added, setAdded] = React.useState<Added[]>([]);
  const [message, setMessage] = React.useState('');
  const [busy, setBusy] = React.useState<'save' | 'publish' | 'discard' | null>(null);
  const [notice, setNotice] = React.useState<Notice | null>(null);
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [confirmDiscard, setConfirmDiscard] = React.useState(false);
  const [view, setView] = React.useState<'split' | 'preview'>('split');
  const [tab, setTab] = React.useState<'write' | 'preview'>('write');
  const [advanced, setAdvanced] = React.useState(false);
  const [details, setDetails] = React.useState(true);
  const [docKey, setDocKey] = React.useState(0);
  const editor = React.useRef<CodeEditorHandle>(null);

  const kind = path.startsWith('src/content/docs/') ? 'doc' : 'post';
  const section = path.split('/')[3];
  const work = entry?.branch ?? branch ?? '';
  const draftAt = draftKey(path, work);
  const unsavedFiles = added.filter((a) => a.sha && !a.saved);
  const uploading = added.some((a) => !a.sha && !a.failed && !a.saved);
  const dirty = normalize(text) !== normalize(saved) || unsavedFiles.length > 0;
  const changed = normalize(text) !== normalize(baseline) || unsavedFiles.length > 0;
  const { fm } = splitFile(text);
  const raw = advanced || fm === null;

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
    getEntry(path, branch)
      .then((e) => {
        if (!live) return;
        const start = e.exists ? e.content : kind === 'doc' ? docTemplate(newTitle || 'Untitled page', section, newGroup) : postTemplate(newTitle || 'Untitled post', login);
        setEntry(e);
        setText(start);
        setBaseline(start);
        setSaved(e.exists ? e.content : '');
        setHead(e.head);
        setAdded([]);
        setDocKey((k) => k + 1);
        setDetails(!e.exists || kind === 'post');
        const d = readDraft(draftKey(path, e.branch));
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
  }, [path, branch, attempt, kind, section, login, newTitle, newGroup, onUnauthorized]);

  React.useEffect(() => {
    if (!entry || !changed || !dirty) return;
    const t = setTimeout(() => writeDraft(draftAt, text), 1000);
    return () => clearTimeout(t);
  }, [entry, changed, dirty, draftAt, text]);

  React.useEffect(() => {
    if (!(changed && dirty) && !uploading) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    addEventListener('beforeunload', warn);
    return () => removeEventListener('beforeunload', warn);
  }, [changed, dirty, uploading]);

  /** Upload files (as they are added) and answer the Markdown that shows them, or null when none was taken. */
  const addFiles = React.useCallback(
    async (files: File[], as: 'auto' | 'gallery' = 'auto'): Promise<string | null> => {
      if (!entry) return null;
      const taken = new Set([...entry.images, ...entry.media, ...added.map((a) => a.name)]);
      const fresh: (Added & { file: File })[] = [];
      const refused: string[] = [];
      for (const file of files) {
        const name = fileName(file, taken);
        const isVideo = !!name && VIDEO_NAME.test(name);
        if (!name || file.size > (isVideo ? VIDEO_MAX : IMAGE_MAX)) {
          refused.push(file.name || 'a file');
          continue;
        }
        taken.add(name);
        const ref = isVideo ? `${entry.media_url}${name}` : name;
        fresh.push({ file, name, kind: isVideo ? 'video' : 'image', ref, url: URL.createObjectURL(file), sha: null });
      }
      if (refused.length) setNotice({ tone: 'warn', text: `Not added: ${refused.join(', ')}. Images are png, jpg, gif or webp up to 5 MiB; videos mp4 or webm up to 50 MiB, already playable in browsers.` });
      if (!fresh.length) return null;
      setAdded((a) => [...a, ...fresh.map(({ file: _file, ...rest }) => rest)]);
      for (const f of fresh) {
        fileToBase64(f.file)
          .then((b64) => uploadFile(path, f.name, b64, csrf))
          .then((u) => setAdded((a) => a.map((x) => (x.name === f.name ? { ...x, sha: u.sha } : x))))
          .catch((e) => {
            setAdded((a) => a.map((x) => (x.name === f.name ? { ...x, failed: e instanceof ControlError ? e.message : 'upload failed' } : x)));
            failed(e, `Uploading ${f.name}`);
          });
      }
      const images = fresh.filter((f) => f.kind === 'image');
      const videos = fresh.filter((f) => f.kind === 'video');
      const blocks: string[] = [];
      if (images.length > 1 && as === 'gallery') {
        blocks.push(`<div class="gallery">\n\n${images.map((f) => `![${altOf(f.name)}](./${f.name}?link)`).join('\n')}\n\n</div>`);
      } else {
        blocks.push(...images.map((f) => `![${altOf(f.name)}](./${f.name}?link)`));
      }
      blocks.push(...videos.map((f) => `<video controls playsinline preload="metadata" src="${f.ref}" aria-label="${altOf(f.name)}"></video>`));
      return `${blocks.join('\n\n')}\n`;
    },
    [entry, added, path, csrf, failed],
  );

  const save = React.useCallback(async () => {
    if (!entry || busy || !dirty || uploading) return;
    setBusy('save');
    setNotice(null);
    try {
      const files = unsavedFiles.map((a) => ({ name: a.name, sha: a.sha! }));
      const r = await saveEntry({ path, content: text, head, branch: entry.branch, message: message.trim() || undefined, files }, csrf);
      if (!r.ok || !r.head) {
        setNotice({ tone: 'bad', text: r.detail || 'GitHub refused the save.' });
        return;
      }
      setHead(r.head);
      setSaved(text);
      setBaseline(text);
      setEntry((e) => (e ? { ...e, exists: true, on_branch: true, images: [...e.images, ...files.filter((f) => !VIDEO_NAME.test(f.name)).map((f) => f.name)], media: [...e.media, ...files.filter((f) => VIDEO_NAME.test(f.name)).map((f) => f.name)] } : e));
      const committed = new Set(files.map((f) => f.name));
      setAdded((a) => a.map((x) => (committed.has(x.name) ? { ...x, saved: true } : x)));
      setMessage('');
      writeDraft(draftAt, null);
      setDraft(null);
      setNotice({ tone: 'ok', text: `Saved to ${r.branch}.`, link: r.commit_url ? { href: r.commit_url, label: 'View the commit' } : undefined });
    } catch (e) {
      if (e instanceof ControlError && e.status === 409) {
        setNotice({
          tone: 'bad',
          text: `${e.message} Your text is kept in this browser.`,
          action: {
            label: 'Reload the entry',
            run: () => {
              writeDraft(draftAt, text);
              setAttempt((a) => a + 1);
            },
          },
        });
      } else failed(e, 'Saving');
    } finally {
      setBusy(null);
    }
  }, [entry, busy, dirty, uploading, unsavedFiles, path, text, head, message, csrf, draftAt, failed]);

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
  const files = React.useMemo(() => {
    const pending = new Map<string, string>();
    for (const a of added) pending.set(a.ref, a.url);
    return { pending, rawBase: entry?.raw_base ?? '', rawRoot: entry?.raw_root ?? '' };
  }, [added, entry]);
  const imageNames = React.useMemo(() => [...new Set([...(entry?.images ?? []), ...added.filter((a) => a.kind === 'image').map((a) => a.name)])], [entry, added]);
  const issues = React.useMemo(() => problems(kind, path, parsed, new Set(imageNames)), [kind, path, parsed, imageNames]);
  const deferredBody = React.useDeferredValue(parsed.body);
  const rendered = React.useMemo<Rendered>(() => (entry ? renderPreview(deferredBody, files) : { html: '', toc: [] }), [entry, deferredBody, files]);

  const setBody = React.useCallback((body: string) => setText((t) => joinFile(splitFile(t).fm ?? '', body)), []);
  const setField = React.useCallback((key: string, value: unknown) => setText((t) => setFrontMatter(t, key, value)), []);

  const publish = async () => {
    if (!entry) return;
    setBusy('publish');
    setNotice(null);
    try {
      const title = typeof parsed.data.title === 'string' ? parsed.data.title : undefined;
      const r = await publishEntry(path, entry.branch, title, csrf);
      if (r.ok && r.pull) {
        setEntry({ ...entry, pull: r.pull, on_branch: true });
        setNotice({ tone: 'ok', text: `Pull request #${r.pull.number} is open. The site's checks build it; a reviewer merges it, which publishes the change.`, link: { href: r.pull.url, label: 'Review it on GitHub' } });
      } else setNotice({ tone: 'bad', text: r.detail || 'The pull request could not be opened.' });
    } catch (e) {
      failed(e, 'Opening the pull request');
    } finally {
      setBusy(null);
    }
  };

  const discard = async () => {
    if (!entry) return;
    setBusy('discard');
    setNotice(null);
    try {
      const r = await discardEntry(path, entry.branch, csrf);
      setConfirmDiscard(false);
      if (!r.ok) {
        setNotice({ tone: 'bad', text: r.detail });
        return;
      }
      writeDraft(draftAt, null);
      setNotice({ tone: 'ok', text: 'The edit is discarded: its pull request is closed and its branch deleted.' });
      const url = new URL(location.href);
      url.searchParams.delete('branch');
      history.replaceState(null, '', url);
      location.reload();
    } catch (e) {
      failed(e, 'Discarding');
    } finally {
      setBusy(null);
    }
  };

  const insert = async (what: 'image' | 'gallery' | 'video') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = what !== 'video';
    input.accept = what === 'video' ? 'video/mp4,video/webm' : 'image/png,image/jpeg,image/gif,image/webp';
    input.onchange = async () => {
      const md = await addFiles([...(input.files ?? [])], what === 'gallery' ? 'gallery' : 'auto');
      if (md) editor.current?.insert(md);
    };
    input.click();
  };

  if (loadError) return <Offline error={loadError} retry={() => setAttempt((a) => a + 1)} />;
  if (!entry) return <Skeleton rows={8} label="Opening the entry…" />;

  const live = livePath(path);
  const title = typeof parsed.data.title === 'string' ? parsed.data.title : '';
  const joined = entry.owner.toLowerCase() !== login.toLowerCase();
  const status = !entry.exists && !entry.on_branch ? 'new' : dirty ? 'unsaved' : entry.on_branch ? 'saved' : 'clean';
  const noun = kind === 'doc' ? 'page' : 'post';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[0.6875rem] text-muted-foreground">
            Editing {kind === 'doc' ? `the docs page ${entry.key.slice(5)}` : `the post ${entry.key.slice(6)}`}
          </p>
          <h1 className="truncate text-2xl font-semibold tracking-tight">{title || `Untitled ${noun}`}</h1>
        </div>
        {live && (
          <a href={withBase(entry.published ? live : kind === 'post' ? '/blog/' : `/docs/${section}/`)} className="font-mono text-xs text-muted-foreground hover:text-foreground">
            ← back to the {entry.published ? noun : kind === 'post' ? 'blog' : 'section'}
          </a>
        )}
      </div>

      {/* Where the edit stands and what it can do. */}
      <div className="raft-panel flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {entry.published ? <Pill tone="ok">live</Pill> : <Pill tone="muted">not published</Pill>}
          {status === 'unsaved' && <Pill tone="warn">unsaved changes</Pill>}
          {status === 'saved' && (
            <Pill tone="live" dot={false}>
              saved on {entry.branch}
            </Pill>
          )}
          {uploading && <Pill tone="live">uploading</Pill>}
          {entry.pull && (
            <>
              <ExtLink href={entry.pull.url} className="inline-flex items-center gap-1 font-mono text-xs">
                <GitPullRequest className="size-3.5" aria-hidden="true" /> #{entry.pull.number}
              </ExtLink>
              <ChecksPill checks={entry.pull.checks} />
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <InsertMenu onPick={insert} onYoutube={(md) => editor.current?.insert(md)} disabled={view === 'preview'} />
          <div role="group" aria-label="View" className="inline-flex rounded-md border border-[var(--raft-hair-strong)] p-0.5">
            <button type="button" aria-pressed={view === 'split'} onClick={() => setView('split')} className={cn('inline-flex h-7 items-center gap-1.5 rounded px-2 text-sm', view === 'split' ? 'bg-muted font-medium' : 'text-muted-foreground')}>
              <Columns2 className="size-4" aria-hidden="true" /> Write
            </button>
            <button type="button" aria-pressed={view === 'preview'} onClick={() => setView('preview')} className={cn('inline-flex h-7 items-center gap-1.5 rounded px-2 text-sm', view === 'preview' ? 'bg-muted font-medium' : 'text-muted-foreground')}>
              <Eye className="size-4" aria-hidden="true" /> Preview
            </button>
          </div>
          <button type="button" className={cn(btn, 'border-transparent bg-primary text-primary-foreground hover:ring-2 hover:ring-primary/40')} onClick={save} disabled={!dirty || uploading || busy !== null} title="Commit to the edit's branch (Ctrl+S)">
            <Save className="size-4" aria-hidden="true" /> {busy === 'save' ? 'Saving…' : uploading ? 'Uploading…' : 'Save'}
          </button>
          {!entry.pull && (
            <button
              type="button"
              className={quiet}
              onClick={publish}
              disabled={dirty || !entry.on_branch || issues.length > 0 || busy !== null}
              title={dirty ? 'Save first' : !entry.on_branch ? 'Nothing saved yet' : issues.length ? 'Fix the details first' : 'Propose this edit; merging it publishes it'}
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
          <input id="edit-message" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={100} placeholder={entry.exists ? 'Fix the compose example (optional)' : 'Optional'} className={cn(field, 'flex-1')} />
        </div>
        {confirmDiscard && (
          <div role="group" aria-label="Confirm discard" className="flex w-full flex-wrap items-center gap-2 rounded-md border border-[var(--raft-danger)]/40 bg-[var(--raft-danger)]/5 p-2 text-sm">
            <p className="mr-auto">
              Throw this edit away? {entry.pull ? `Pull request #${entry.pull.number} is closed and ` : 'The '}branch {entry.branch} is deleted{joined ? `, for @${entry.owner} too` : ''}. The live {noun} is not touched.
            </p>
            <button type="button" className={cn(btn, 'border-transparent bg-[var(--raft-danger)] text-[var(--background)] hover:opacity-90')} onClick={discard} disabled={busy !== null}>
              {busy === 'discard' ? 'Discarding…' : 'Discard the edit'}
            </button>
            <button type="button" className={quiet} onClick={() => setConfirmDiscard(false)}>
              Keep it
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2" aria-live="polite">
        {joined && (
          <p role="status" className="rounded-md border border-[var(--raft-hair-strong)] bg-[var(--raft-surface)] px-3 py-2 text-sm">
            You are working in @{entry.owner}'s edit: your saves go onto {entry.branch}
            {entry.pull ? ` and its pull request #${entry.pull.number}` : ''}.
          </p>
        )}
        {!joined && !entry.on_branch && entry.others.length > 0 && (
          <p role="status" className="rounded-md border border-[var(--raft-amber)]/40 bg-[var(--raft-amber)]/10 px-3 py-2 text-sm">
            This {noun} already has an open edit by @{entry.others[0].split('/')[1]}.{' '}
            <a className="underline underline-offset-4" href={withBase(`/edit/?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(location.search)), branch: entry.others[0] })}`)}>
              Join it
            </a>{' '}
            so the change stays in one pull request.
          </p>
        )}
        {draft && (
          <div role="status" className="flex flex-wrap items-center gap-2 rounded-md border border-[var(--raft-amber)]/40 bg-[var(--raft-amber)]/10 px-3 py-2 text-sm">
            <p className="mr-auto">
              This browser kept unsaved text for this {noun} from <Rel iso={draft.at} />.
            </p>
            <button
              type="button"
              className={cn(quiet, 'h-7 bg-background')}
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
                writeDraft(draftAt, null);
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
            {notice.link && (
              <ExtLink href={notice.link.href} className="underline">
                {notice.link.label}
              </ExtLink>
            )}
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
              <TriangleAlert className="size-4" aria-hidden="true" /> The site's build would refuse these details
            </p>
            <ul className="mt-1 list-disc pl-6">
              {issues.map((i) => (
                <li key={i}>{i.replace(/`([^`]+)`/g, '$1')}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {view === 'preview' ? (
        <FullPreview kind={kind} path={path} parsed={parsed} rendered={rendered} files={files} data={data} />
      ) : (
        <>
          {!raw && (
            <details open={details} onToggle={(e) => setDetails((e.target as HTMLDetailsElement).open)} className="raft-panel group">
              <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-2">
                  <Plus className="size-3.5 transition-transform group-open:rotate-45" aria-hidden="true" /> Details
                  <span className="font-normal text-muted-foreground">{kind === 'post' ? 'title, description, author, tags, hero' : 'title, description, sub-heading, order'}</span>
                </span>
              </summary>
              <div className="border-t border-[var(--raft-hair)] p-3">
                <DetailsForm kind={kind} data={parsed.data} setField={setField} images={imageNames} section={section} editorData={data} onHero={addFiles} />
              </div>
            </details>
          )}

          <div className="flex gap-1 lg:hidden" role="group" aria-label="Pane">
            {(['write', 'preview'] as const).map((p) => (
              <button key={p} type="button" aria-pressed={tab === p} onClick={() => setTab(p)} className={cn('h-8 flex-1 rounded-md border text-sm capitalize', tab === p ? 'border-[var(--raft-hair-strong)] bg-muted font-medium' : 'border-transparent text-muted-foreground')}>
                {p}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <section aria-label={raw ? 'The whole file' : 'Body'} className={cn('raft-panel overflow-hidden lg:block', tab === 'write' ? 'block' : 'hidden')}>
              <div className="flex items-center justify-between border-b border-[var(--raft-hair)] px-3 py-1.5">
                <p className="font-mono text-[0.6875rem] text-muted-foreground">{raw ? 'Markdown file, with its front matter' : 'Markdown'}</p>
                <button
                  type="button"
                  aria-pressed={raw}
                  disabled={fm === null}
                  onClick={() => {
                    setAdvanced((a) => !a);
                    setDocKey((k) => k + 1);
                  }}
                  className="inline-flex items-center gap-1 font-mono text-[0.6875rem] text-muted-foreground hover:text-foreground disabled:opacity-60"
                  title={fm === null ? 'The file has no front matter: fix it here' : undefined}
                >
                  <FileCode className="size-3.5" aria-hidden="true" /> Advanced editor
                </button>
              </div>
              <div className="h-[calc(100dvh-18rem)] min-h-[28rem]">
                <React.Suspense fallback={<Skeleton rows={10} label="Loading the editor…" />}>
                  <CodeEditor
                    ref={editor}
                    value={raw ? text : splitFile(text).body}
                    docKey={`${path}:${docKey}:${raw}`}
                    onChange={raw ? setText : setBody}
                    onFiles={addFiles}
                    label={raw ? `Markdown file of ${entry.key}` : `Markdown of ${entry.key}`}
                  />
                </React.Suspense>
              </div>
            </section>
            <section aria-label="Quick preview" className={cn('raft-panel overflow-hidden lg:block', tab === 'preview' ? 'block' : 'hidden')}>
              <div tabIndex={0} className="h-[calc(100dvh-16rem)] min-h-[30rem] overflow-y-auto p-5 md:p-8">
                <p className="text-3xl leading-tight font-semibold tracking-tight">{title || <span className="text-muted-foreground">No title yet</span>}</p>
                {typeof parsed.data.description === 'string' && <p className="mt-3 text-lg text-muted-foreground">{parsed.data.description}</p>}
                <div className="post-body prose mt-6 max-w-none border-t border-[var(--raft-hair)] pt-6 dark:prose-invert" dangerouslySetInnerHTML={{ __html: rendered.html }} />
              </div>
            </section>
          </div>
          {added.length > 0 && (
            <p className="font-mono text-[0.6875rem] text-muted-foreground">
              Added files:{' '}
              {added.map((a) => (
                <span key={a.name} className={cn('mr-2', a.failed && 'text-[var(--raft-danger)]')}>
                  {a.name} {a.failed ? '(failed)' : a.saved ? '(saved)' : a.sha ? '(ready to save)' : '(uploading…)'}
                </span>
              ))}
            </p>
          )}
        </>
      )}
      <p className="font-mono text-[0.6875rem] text-muted-foreground">
        Saves commit to <span className="text-foreground">{entry.branch}</span> as {login}. Preview lays the {noun} out as the site does; the pull request's build is the final word.
      </p>
    </div>
  );
}

function InsertMenu({ onPick, onYoutube, disabled }: { onPick: (what: 'image' | 'gallery' | 'video') => void; onYoutube: (md: string) => void; disabled: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [yt, setYt] = React.useState<string | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && (setOpen(false), setYt(null));
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (setOpen(false), setYt(null));
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const item = 'flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-sm hover:bg-muted';
  const embed = yt !== null ? youtubeEmbed(yt) : null;
  return (
    <div ref={ref} className="relative">
      <button type="button" className={quiet} aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)} disabled={disabled}>
        <Plus className="size-4" aria-hidden="true" /> Insert
      </button>
      {open && (
        <div className="raft-panel absolute right-0 z-30 mt-1 w-72 p-1.5 shadow-lg">
          {yt === null ? (
            <>
              <button type="button" className={item} onClick={() => (setOpen(false), onPick('image'))}>
                <ImageIcon className="size-4" aria-hidden="true" /> Image
              </button>
              <button type="button" className={item} onClick={() => (setOpen(false), onPick('gallery'))}>
                <Images className="size-4" aria-hidden="true" /> Gallery of images
              </button>
              <button type="button" className={item} onClick={() => (setOpen(false), onPick('video'))}>
                <Film className="size-4" aria-hidden="true" /> Video (mp4 or webm)
              </button>
              <button type="button" className={item} onClick={() => setYt('')}>
                <MonitorPlay className="size-4" aria-hidden="true" /> YouTube video
              </button>
              <p className="px-2.5 pt-1.5 pb-1 text-[0.6875rem] text-muted-foreground">You can also paste or drop images and videos into the text.</p>
            </>
          ) : (
            <form
              className="space-y-2 p-1.5"
              onSubmit={(e) => {
                e.preventDefault();
                if (!embed) return;
                onYoutube(embed);
                setOpen(false);
                setYt(null);
              }}
            >
              <label htmlFor="yt-url" className="text-sm font-medium">
                YouTube link
              </label>
              <input id="yt-url" autoFocus value={yt} onChange={(e) => setYt(e.target.value)} placeholder="https://youtu.be/…" className={field} />
              {yt && !embed && <p className="text-xs text-[var(--raft-danger)]">That is not a YouTube video link.</p>}
              <button type="submit" disabled={!embed} className={cn(btn, 'w-full justify-center border-transparent bg-primary text-primary-foreground')}>
                Insert the video
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function Chips({ id, label, values, onChange, suggestions, placeholder }: { id: string; label: string; values: string[]; onChange: (v: string[]) => void; suggestions: string[]; placeholder: string }) {
  const [draft, setDraft] = React.useState('');
  const add = (v: string) => {
    const t = v.trim();
    if (t && !values.some((x) => x.toLowerCase() === t.toLowerCase())) onChange([...values, t]);
    setDraft('');
  };
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium">
        {label}
      </label>
      <div className="mt-1 flex min-h-8 flex-wrap items-center gap-1 rounded-md border border-[var(--raft-hair-strong)] bg-background px-1.5 py-1">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`} className="text-muted-foreground hover:text-foreground">
              ×
            </button>
          </span>
        ))}
        <input
          id={id}
          list={`${id}-list`}
          value={draft}
          onChange={(e) => (e.target.value.endsWith(',') ? add(e.target.value.slice(0, -1)) : setDraft(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(draft);
            } else if (e.key === 'Backspace' && !draft && values.length) onChange(values.slice(0, -1));
          }}
          onBlur={() => draft && add(draft)}
          placeholder={values.length ? '' : placeholder}
          className="h-6 min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <datalist id={`${id}-list`}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
    </div>
  );
}

function DetailsForm({
  kind,
  data,
  setField,
  images,
  section,
  editorData,
  onHero,
}: {
  kind: 'doc' | 'post';
  data: Record<string, unknown>;
  setField: (key: string, value: unknown) => void;
  images: string[];
  section: string;
  editorData: EditorData;
  onHero: (files: File[]) => Promise<string | null>;
}) {
  const str = (k: string) => (typeof data[k] === 'string' ? (data[k] as string) : data[k] instanceof Date ? (data[k] as Date).toISOString().slice(0, 10) : data[k] === undefined ? '' : String(data[k]));
  const list = (k: string) => (Array.isArray(data[k]) ? (data[k] as unknown[]).map(String) : []);
  const label = 'text-xs font-medium';
  const groups = editorData.sections.find((s) => s.id === section)?.groups.flatMap((g) => (g.name ? [g.name] : [])) ?? [];
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="md:col-span-2">
        <label htmlFor="fm-title" className={label}>
          Title
        </label>
        <input id="fm-title" value={str('title')} onChange={(e) => setField('title', e.target.value)} className={cn(field, 'mt-1')} />
      </div>
      <div className="md:col-span-2">
        <label htmlFor="fm-description" className={label}>
          Description {kind === 'post' && <span className="font-normal text-muted-foreground">(cards and search results; the first paragraph when empty)</span>}
        </label>
        <textarea id="fm-description" rows={2} value={str('description')} onChange={(e) => setField('description', e.target.value)} className={cn(field, 'mt-1 h-auto py-1.5')} />
      </div>
      {kind === 'post' ? (
        <>
          <div>
            <label htmlFor="fm-author" className={label}>
              Author
            </label>
            <input id="fm-author" list="fm-author-list" value={str('author')} onChange={(e) => setField('author', e.target.value)} className={cn(field, 'mt-1')} />
            <datalist id="fm-author-list">
              {editorData.authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="fm-date" className={label}>
              Date <span className="font-normal text-muted-foreground">(empty: when it merges)</span>
            </label>
            <input id="fm-date" type="date" value={str('date').slice(0, 10)} onChange={(e) => setField('date', e.target.value)} className={cn(field, 'mt-1')} />
          </div>
          <div className="md:col-span-2">
            <Chips id="fm-tags" label="Tags" values={list('tags')} onChange={(v) => setField('tags', v)} suggestions={editorData.tags} placeholder="webtop, announcement" />
          </div>
          <div>
            <label htmlFor="fm-hero" className={label}>
              Hero image
            </label>
            <div className="mt-1 flex gap-2">
              <select id="fm-hero" value={str('hero').replace(/^\.\//, '')} onChange={(e) => setField('hero', e.target.value ? `./${e.target.value}` : undefined)} className={field}>
                <option value="">None (the stock image on cards)</option>
                {images.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={quiet}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/png,image/jpeg,image/webp';
                  input.onchange = async () => {
                    const file = input.files?.[0];
                    if (!file) return;
                    const md = await onHero([file]);
                    const name = md?.match(/\]\(\.\/([^)?]+)/)?.[1];
                    if (name) setField('hero', `./${name}`);
                  };
                  input.click();
                }}
              >
                Upload
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="fm-heroalt" className={label}>
              Hero description <span className="font-normal text-muted-foreground">(for screen readers)</span>
            </label>
            <input id="fm-heroalt" value={str('heroAlt')} onChange={(e) => setField('heroAlt', e.target.value)} className={cn(field, 'mt-1')} />
          </div>
          <div>
            <Chips id="fm-images" label="Images it is about" values={list('images')} onChange={(v) => setField('images', v)} suggestions={editorData.containers} placeholder="webtop, swag" />
          </div>
          <label className="flex items-center gap-2 self-end text-sm">
            <input type="checkbox" checked={data.featured === true} onChange={(e) => setField('featured', e.target.checked || undefined)} /> Featured: pinned to the top of the blog and the home page
          </label>
        </>
      ) : (
        <>
          <div>
            <label htmlFor="fm-group" className={label}>
              Sub-heading in the sidebar
            </label>
            <input id="fm-group" list="fm-group-list" value={str('group')} onChange={(e) => setField('group', e.target.value)} className={cn(field, 'mt-1')} />
            <datalist id="fm-group-list">
              {groups.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="fm-order" className={label}>
              Order <span className="font-normal text-muted-foreground">(lowest first)</span>
            </label>
            <input id="fm-order" type="number" step={1} value={str('order')} onChange={(e) => setField('order', e.target.value === '' ? undefined : Number(e.target.value))} className={cn(field, 'mt-1')} />
          </div>
          <div className="md:col-span-2">
            <Chips id="fm-tags" label="Search words" values={list('tags')} onChange={(v) => setField('tags', v)} suggestions={[]} placeholder="extra words the search matches" />
          </div>
        </>
      )}
    </div>
  );
}

/** The page as the site will show it: the post or docs layout with this body, its details and its files. */
function FullPreview({ kind, path, parsed, rendered, files, data }: { kind: 'doc' | 'post'; path: string; parsed: ReturnType<typeof splitFrontMatter>; rendered: Rendered; files: { pending: Map<string, string>; rawBase: string; rawRoot: string }; data: EditorData }) {
  const d = parsed.data;
  const title = typeof d.title === 'string' ? d.title : 'Untitled';
  const body = <div className="post-body prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: rendered.html }} />;
  const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? new Date(v).toISOString() : null);
  const note = (
    <p className="not-prose my-6 rounded-md border border-dashed border-[var(--raft-hair-strong)] bg-[var(--raft-surface)] px-3 py-2 font-mono text-[0.6875rem] text-muted-foreground">
      Preview · not published · the editors' bar shows here on the live page
    </p>
  );
  if (kind === 'post') {
    const slug = path.split('/')[3];
    const author = typeof d.author === 'string' ? d.author : null;
    const known = author ? data.authors.find((a) => a.keys.includes(slugify(author))) : undefined;
    const tags = Array.isArray(d.tags) ? [...new Map((d.tags as unknown[]).map(String).map((t) => [tagSlug(t), { name: t, slug: tagSlug(t), url: tagUrl(tagSlug(t)) }])).values()].filter((t) => t.slug) : [];
    const hero = typeof d.hero === 'string' ? d.hero.replace(/^\.\//, '') : null;
    return (
      <div className="-mx-4 md:-mx-6">
        <PostArticle
          title={title}
          crumbs={[
            { name: 'Blog', href: '/blog/' },
            { name: title, href: `/blog/${slug}/` },
          ]}
          tags={tags}
          byline={author ? { name: known?.name ?? author, url: known ? withBase(`/blog/authors/${known.id}/`) : undefined, initials: initials(known?.name ?? author) } : undefined}
          date={iso(d.date)}
          updated={iso(d.updated)}
          readingTime={readingTimeOf(parsed.body)}
          hero={hero ? { src: files.pending.get(hero) ?? files.rawBase + hero, alt: typeof d.heroAlt === 'string' ? d.heroAlt : '' } : null}
          toc={rendered.toc}
          bar={note}
        >
          {body}
        </PostArticle>
      </div>
    );
  }
  const [, , , sectionId, file] = path.split('/');
  const slug = file.replace(/\.md$/, '');
  const id = `${sectionId}/${slug}`;
  const nav = data.sections.find((s) => s.id === sectionId) ?? { id: sectionId, title: sectionId, url: withBase(`/docs/${sectionId}/`), groups: [] };
  const group = typeof d.group === 'string' ? d.group : undefined;
  const present = nav.groups.some((g) => g.pages.some((p) => p.id === id));
  const groups =
    present || slug === 'index'
      ? nav.groups
      : nav.groups.some((g) => g.name === group)
        ? nav.groups.map((g) => (g.name === group ? { ...g, pages: [...g.pages, { id, title, url: '#' }] } : g))
        : [...nav.groups, { name: group, pages: [{ id, title, url: '#' }] }];
  return (
    <div className="-mx-4 md:-mx-6">
      <DocsLayout
        sections={data.sections}
        section={{ ...nav, groups }}
        currentId={slug === 'index' ? undefined : id}
        onIndex={slug === 'index'}
        title={title}
        description={typeof d.description === 'string' ? d.description : ''}
        crumbs={[
          { name: 'Docs', href: '/docs/' },
          { name: nav.title, href: `/docs/${sectionId}/` },
          ...(slug === 'index' ? [] : [{ name: title, href: `/docs/${sectionId}/${slug}/` }]),
        ]}
        toc={rendered.toc}
        updated={iso(d.updated)}
        hasDoc
        bar={note}
      >
        {body}
      </DocsLayout>
    </div>
  );
}
