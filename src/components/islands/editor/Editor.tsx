/**
 * The website editor for the documentation and the blog (/edit/). Members only: it reads who is signed in
 * from the control plane, asks once for the editor's own GitHub authorisation (commits are the member's),
 * then opens what the URL names: `?doc=<section>/<slug>`, `?post=<slug>` (with `&title=` for a new one),
 * `?new=doc|post` for the new-entry form, or nothing for the home screen (open edits, new, find a page).
 * Every change is a pull request; merging it publishes it.
 */
import * as React from 'react';
import { FilePlus, GitPullRequest, KeyRound, Pencil, Search } from 'lucide-react';
import { withBase } from '@/lib/base';
import { ControlError, loginUrl, useMe } from '@/lib/control';
import {
  authorizeUrl,
  docFile,
  DOC_SLUG,
  editorQuery,
  getEntry,
  getStatus,
  pathFromQuery,
  postFile,
  POST_SLUG,
  SECTIONS,
  slugify,
  type EditorStatus,
  type Kind,
} from '@/lib/editor';
import { cn } from '@/lib/utils';
import { CookieNotice, Empty, ExtLink, Offline, Pill, Rel, Skeleton } from '../fleet/shared';
import Workspace from './Workspace';

export interface EntryLink {
  path: string;
  title: string;
  kind: Kind;
  /** The docs section's title, or the post's year. */
  group: string;
}

type Route = { mode: 'home' } | { mode: 'new'; kind: Kind } | { mode: 'edit'; path: string; title: string | null } | { mode: 'bad' };

function routeOf(search: string): Route {
  const params = new URLSearchParams(search);
  const n = params.get('new');
  if (n === 'doc' || n === 'post') return { mode: 'new', kind: n };
  if (params.has('doc') || params.has('post')) {
    const path = pathFromQuery(params);
    return path ? { mode: 'edit', path, title: params.get('title') } : { mode: 'bad' };
  }
  return { mode: 'home' };
}

const editorUrl = (query = '') => withBase(`/edit/${query}`);
const button = 'inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors disabled:pointer-events-none disabled:opacity-50';

function Gate({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="raft-panel mx-auto max-w-xl p-6 text-center md:p-8">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-4 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

export default function Editor({ entries }: { entries: EntryLink[] }) {
  const me = useMe();
  const [route, setRoute] = React.useState<Route | null>(null);
  const [status, setStatus] = React.useState<EditorStatus | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => setRoute(routeOf(location.search)), []);
  React.useEffect(() => {
    if (!me?.member) return;
    let live = true;
    setError(null);
    getStatus()
      .then((s) => live && setStatus(s))
      .catch((e) => live && setError(e instanceof ControlError ? e.message : 'The control plane could not be reached.'));
    return () => {
      live = false;
    };
  }, [me?.member, attempt]);
  const unauthorized = React.useCallback(() => setStatus((s) => (s ? { ...s, authorized: false } : s)), []);

  if (!me || !route) return <Skeleton rows={6} label="Checking who is signed in…" />;
  if (!me.authenticated) {
    return (
      <Gate title="Sign in to edit">
        <p>The editor is for members of the LinuxServer team. Sign in with GitHub, then come back here.</p>
        <a href={loginUrl(typeof location === 'undefined' ? '' : location.href)} className={cn(button, 'mx-auto border-transparent bg-primary text-primary-foreground hover:bg-primary/85')}>
          Sign in with GitHub
        </a>
        <CookieNotice />
      </Gate>
    );
  }
  if (!me.member || !me.csrf) {
    return (
      <Gate title="Members only">
        <p>
          You are signed in as {me.login}, who is not a member of the organisation. Suggest a change with a pull request on{' '}
          <ExtLink href="https://github.com/linuxserver-playground/site" className="underline">
            the site repository
          </ExtLink>{' '}
          instead.
        </p>
      </Gate>
    );
  }
  if (error) return <Offline error={error} retry={() => setAttempt((a) => a + 1)} />;
  if (!status) return <Skeleton rows={6} label="Opening the editor…" />;
  if (!status.authorized) {
    return (
      <Gate title="Let the editor commit as you">
        <p>
          Every save is a commit by you on your own branch of {status.repo}, and publishing is a pull request you open. For that GitHub asks once to let the LinuxServer CI app act for you. The
          app can only do what you can do yourself, and control only uses it on the site's docs and blog. Signing out revokes it.
        </p>
        <a href={authorizeUrl(typeof location === 'undefined' ? '' : location.href)} className={cn(button, 'mx-auto border-transparent bg-primary text-primary-foreground hover:bg-primary/85')}>
          <KeyRound className="size-4" aria-hidden="true" /> Authorise on GitHub
        </a>
      </Gate>
    );
  }
  if (!status.can_push) {
    return (
      <Gate title="No write access yet">
        <p>
          GitHub says {status.login} cannot push to {status.repo}, so the editor cannot make your branch. Ask a maintainer for write access to the site repository, then reload this page.
        </p>
      </Gate>
    );
  }
  if (route.mode === 'bad') {
    return (
      <Gate title="Nothing to edit at this address">
        <p>The editor opens docs pages as ?doc=section/slug and posts as ?post=slug.</p>
        <a href={editorUrl()} className={cn(button, 'mx-auto border-[var(--raft-hair-strong)] hover:bg-muted')}>
          Go to the editor
        </a>
      </Gate>
    );
  }
  if (route.mode === 'new') return <NewEntry kind={route.kind} />;
  if (route.mode === 'edit') return <Workspace path={route.path} csrf={me.csrf} login={status.login ?? me.login ?? ''} newTitle={route.title} onUnauthorized={unauthorized} />;
  return <Home status={status} entries={entries} />;
}

function Home({ status, entries }: { status: EditorStatus; entries: EntryLink[] }) {
  const [query, setQuery] = React.useState('');
  const q = query.trim().toLowerCase();
  const found = (q ? entries.filter((e) => e.title.toLowerCase().includes(q) || e.path.includes(q)) : entries).slice(0, 40);
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section aria-labelledby="edits-title" className="raft-panel">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--raft-hair)] px-4 py-3">
          <h2 id="edits-title" className="font-medium">
            Your open edits
          </h2>
          <div className="flex flex-wrap gap-2">
            <a href={editorUrl('?new=post')} className={cn(button, 'h-8 border-[var(--raft-hair-strong)] hover:bg-muted')}>
              <FilePlus className="size-4" aria-hidden="true" /> New post
            </a>
            <a href={editorUrl('?new=doc')} className={cn(button, 'h-8 border-[var(--raft-hair-strong)] hover:bg-muted')}>
              <FilePlus className="size-4" aria-hidden="true" /> New docs page
            </a>
          </div>
        </div>
        {status.edits.length === 0 ? (
          <Empty>No open edits. Open a page below, or start a new one.</Empty>
        ) : (
          <ul className="divide-y divide-[var(--raft-hair)]">
            {status.edits.map((e) => (
              <li key={e.number} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{e.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-[0.6875rem] text-muted-foreground">
                    <ExtLink href={e.url} className="inline-flex items-center gap-1">
                      <GitPullRequest className="size-3" aria-hidden="true" />#{e.number}
                    </ExtLink>
                    <span>
                      updated <Rel iso={e.updated_at} />
                    </span>
                    {e.checks === 'success' && <Pill tone="ok">checks passed</Pill>}
                    {e.checks === 'failure' && <Pill tone="bad">checks failed</Pill>}
                    {e.checks === 'pending' && <Pill tone="live">checks running</Pill>}
                  </p>
                </div>
                {e.path && (
                  <a href={editorUrl(editorQuery(e.path))} className={cn(button, 'h-8 border-[var(--raft-hair-strong)] hover:bg-muted')}>
                    <Pencil className="size-3.5" aria-hidden="true" /> Continue<span className="sr-only"> editing {e.title}</span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="find-title" className="raft-panel">
        <div className="border-b border-[var(--raft-hair)] px-4 py-3">
          <h2 id="find-title" className="font-medium">
            Edit a page or post
          </h2>
          <label className="mt-3 flex h-9 items-center gap-2 rounded-md border border-[var(--raft-hair-strong)] bg-background px-2.5">
            <Search className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">Find by title</span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find by title" className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </label>
        </div>
        {found.length === 0 ? (
          <Empty>Nothing matches “{query}”.</Empty>
        ) : (
          <ul className="max-h-[32rem] divide-y divide-[var(--raft-hair)] overflow-y-auto">
            {found.map((e) => (
              <li key={e.path}>
                <a href={editorUrl(editorQuery(e.path))} className="flex items-baseline justify-between gap-3 px-4 py-2.5 hover:bg-muted/50">
                  <span className="min-w-0 truncate">{e.title}</span>
                  <span className="shrink-0 font-mono text-[0.6875rem] text-muted-foreground">
                    {e.kind === 'doc' ? 'docs' : 'blog'} · {e.group}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function NewEntry({ kind }: { kind: Kind }) {
  const [title, setTitle] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [section, setSection] = React.useState<string>(SECTIONS[0].id);
  const [busy, setBusy] = React.useState(false);
  const [problem, setProblem] = React.useState<React.ReactNode>(null);
  const effective = slugTouched ? slug : slugify(title);
  const valid = title.trim() && (kind === 'doc' ? DOC_SLUG : POST_SLUG).test(effective) && !(kind === 'doc' && effective === 'index');
  const path = kind === 'doc' ? docFile(section, effective) : postFile(effective);

  const submit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    setProblem(null);
    try {
      const existing = await getEntry(path);
      if (existing.exists) {
        setProblem(
          <>
            There already is {existing.on_branch ? 'an edit of' : 'a'} {kind === 'doc' ? 'page' : 'post'} at {existing.key}.{' '}
            <a className="underline underline-offset-4" href={editorUrl(editorQuery(path))}>
              Open it
            </a>{' '}
            or pick another name.
          </>,
        );
        return;
      }
      location.href = editorUrl(`${editorQuery(path)}&title=${encodeURIComponent(title.trim())}`);
    } catch (err) {
      setProblem(err instanceof ControlError ? err.message : 'The control plane could not be reached.');
    } finally {
      setBusy(false);
    }
  };

  const field = 'h-9 w-full rounded-md border border-[var(--raft-hair-strong)] bg-background px-2.5 text-sm';
  return (
    <form onSubmit={submit} className="raft-panel mx-auto max-w-xl space-y-4 p-6">
      <h2 className="text-xl font-semibold tracking-tight">{kind === 'doc' ? 'New docs page' : 'New post'}</h2>
      <div>
        <label htmlFor="new-title" className="text-sm font-medium">
          Title
        </label>
        <input id="new-title" required value={title} onChange={(e) => setTitle(e.target.value)} className={cn(field, 'mt-1.5')} autoFocus />
      </div>
      {kind === 'doc' && (
        <div>
          <label htmlFor="new-section" className="text-sm font-medium">
            Section
          </label>
          <select id="new-section" value={section} onChange={(e) => setSection(e.target.value)} className={cn(field, 'mt-1.5')}>
            {SECTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="new-slug" className="text-sm font-medium">
          Address
        </label>
        <div className="mt-1.5 flex items-center gap-1 font-mono text-xs text-muted-foreground">
          <span className="shrink-0">{kind === 'doc' ? `/docs/${section}/` : '/blog/'}</span>
          <input
            id="new-slug"
            value={effective}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value.toLowerCase());
            }}
            aria-describedby="new-slug-help"
            className={cn(field, 'min-w-0 font-mono text-xs')}
          />
        </div>
        <p id="new-slug-help" className="mt-1.5 text-xs text-muted-foreground">
          Lower-case letters, digits and dashes{kind === 'post' ? ' (and _)' : ''}. It is the page's URL for good, so keep it short.
        </p>
      </div>
      {problem && (
        <p role="alert" className="rounded-md border border-[var(--raft-amber)]/40 bg-[var(--raft-amber)]/10 px-3 py-2 text-sm">
          {problem}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={!valid || busy} className={cn(button, 'border-transparent bg-primary text-primary-foreground hover:bg-primary/85')}>
          {busy ? 'Checking…' : 'Start writing'}
        </button>
        <a href={editorUrl()} className={cn(button, 'border-transparent text-muted-foreground hover:text-foreground')}>
          Cancel
        </a>
      </div>
      <p className="font-mono text-[0.6875rem] text-muted-foreground">
        Nothing is saved until you save; then it lives on your branch until its pull request merges.
      </p>
    </form>
  );
}
