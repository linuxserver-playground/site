/**
 * The website editor (/edit/), opened from the buttons on the pages themselves: `?doc=<section>/<slug>` or
 * `?post=<slug>` (with `&branch=` to join an open edit, `&title=` and `&group=` for a new one), and
 * `?new=post` or `?new=doc&section=<id>[&group=<name>]` for the new-entry form. There is no overview: the blog and
 * the docs are where work is found. It checks who is signed in, asks once for the editor's GitHub authorisation
 * (commits are the member's), then hands over to the workspace. Every change is a pull request.
 */
import * as React from 'react';
import { KeyRound } from 'lucide-react';
import { withBase } from '@/lib/base';
import { ControlError, loginUrl, useMe } from '@/lib/control';
import { authorizeUrl, docFile, DOC_SLUG, editorQuery, getEntry, getStatus, pathFromQuery, postFile, POST_SLUG, slugify, type EditorStatus, type Kind } from '@/lib/editor';
import { cn } from '@/lib/utils';
import { CookieNotice, Offline, Skeleton } from '../fleet/shared';
import Workspace, { type EditorData } from './Workspace';

type Route =
  | { mode: 'new'; kind: Kind; section: string | null; group: string | null }
  | { mode: 'edit'; path: string; branch: string | null; title: string | null; group: string | null }
  | { mode: 'none' };

function routeOf(search: string): Route {
  const params = new URLSearchParams(search);
  const n = params.get('new');
  if (n === 'doc' || n === 'post') return { mode: 'new', kind: n, section: params.get('section'), group: params.get('group') };
  const path = pathFromQuery(params);
  return path ? { mode: 'edit', path, branch: params.get('branch'), title: params.get('title'), group: params.get('group') } : { mode: 'none' };
}

const button = 'inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors disabled:pointer-events-none disabled:opacity-50';

function Gate({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="raft-panel mx-auto mt-10 max-w-xl p-6 text-center md:p-8">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-3 space-y-4 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

export default function Editor({ data }: { data: EditorData }) {
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
  if (route.mode === 'none') {
    return (
      <Gate title="Open the editor from a page">
        <p>
          Every page and post has its own Edit button for people who can edit the site, the <a className="underline underline-offset-4" href={withBase('/blog/')}>blog</a> has New post, and each{' '}
          <a className="underline underline-offset-4" href={withBase('/docs/')}>docs</a> section has New page.
        </p>
      </Gate>
    );
  }
  if (!me.authenticated) {
    return (
      <Gate title="Sign in to edit">
        <p>The editor is for members of the LinuxServer team. Sign in with GitHub, then come back here.</p>
        <a href={loginUrl(typeof location === 'undefined' ? '' : location.href)} className={cn(button, 'mx-auto border-transparent bg-primary text-primary-foreground hover:ring-2 hover:ring-primary/40')}>
          Sign in with GitHub
        </a>
        <CookieNotice />
      </Gate>
    );
  }
  if (!me.member || !me.csrf) {
    return (
      <Gate title="Members only">
        <p>You are signed in as {me.login}, who is not a member of the organisation. Suggest a change with a pull request on the site repository instead.</p>
      </Gate>
    );
  }
  if (error) return <Offline error={error} retry={() => setAttempt((a) => a + 1)} />;
  if (!status) return <Skeleton rows={6} label="Opening the editor…" />;
  if (!status.can_edit) {
    return (
      <Gate title="No write access yet">
        <p>GitHub says {status.login} cannot push to {status.repo}. Ask a maintainer for write access to the site repository, then reload this page.</p>
      </Gate>
    );
  }
  if (!status.authorized) {
    return (
      <Gate title="Let the editor commit as you">
        <p>
          Every save is a commit by you on the change's branch of {status.repo}, and publishing is a pull request. For that GitHub asks once to let the LinuxServer CI app act for you. The app can
          only do what you can do yourself, and control only uses it on the site's docs and blog. Signing out revokes it.
        </p>
        <a href={authorizeUrl(typeof location === 'undefined' ? '' : location.href)} className={cn(button, 'mx-auto border-transparent bg-primary text-primary-foreground hover:ring-2 hover:ring-primary/40')}>
          <KeyRound className="size-4" aria-hidden="true" /> Authorise on GitHub
        </a>
      </Gate>
    );
  }
  if (route.mode === 'new') return <NewEntry kind={route.kind} section={route.section} group={route.group} data={data} />;
  return (
    <Workspace
      path={route.path}
      branch={route.branch}
      csrf={me.csrf}
      login={status.login ?? me.login ?? ''}
      newTitle={route.title}
      newGroup={route.group}
      data={data}
      onUnauthorized={unauthorized}
    />
  );
}

function NewEntry({ kind, section, group, data }: { kind: Kind; section: string | null; group: string | null; data: EditorData }) {
  const [title, setTitle] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [problem, setProblem] = React.useState<React.ReactNode>(null);
  const home = data.sections.find((s) => s.id === section);
  const effective = slugTouched ? slug : slugify(title);
  const back = kind === 'post' ? withBase('/blog/') : home?.url ?? withBase('/docs/');

  if (kind === 'doc' && !home) {
    return (
      <Gate title="Which section?">
        <p>
          New pages start from a section: open one in the <a className="underline underline-offset-4" href={withBase('/docs/')}>docs</a> and use New page there. New sections are made in git.
        </p>
      </Gate>
    );
  }
  const valid = title.trim() && (kind === 'doc' ? DOC_SLUG : POST_SLUG).test(effective) && !(kind === 'doc' && effective === 'index');
  const path = kind === 'doc' ? docFile(home!.id, effective) : postFile(effective);

  const submit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    setProblem(null);
    try {
      const existing = await getEntry(path);
      if (existing.exists || existing.others.length) {
        const branch = existing.exists ? null : existing.others[0];
        setProblem(
          <>
            {existing.exists ? `There already is a ${kind === 'doc' ? 'page' : 'post'} at this address.` : 'Someone has already started one at this address.'}{' '}
            <a className="underline underline-offset-4" href={withBase(`/edit/${editorQuery(path, branch)}`)}>
              Open it
            </a>{' '}
            or pick another address.
          </>,
        );
        return;
      }
      const extra = `&title=${encodeURIComponent(title.trim())}${group ? `&group=${encodeURIComponent(group)}` : ''}`;
      location.href = withBase(`/edit/${editorQuery(path)}${extra}`);
    } catch (err) {
      setProblem(err instanceof ControlError ? err.message : 'The control plane could not be reached.');
    } finally {
      setBusy(false);
    }
  };

  const field = 'h-9 w-full rounded-md border border-[var(--raft-hair-strong)] bg-background px-2.5 text-sm';
  return (
    <form onSubmit={submit} className="raft-panel mx-auto mt-10 max-w-xl space-y-4 p-6">
      <h1 className="text-xl font-semibold tracking-tight">
        {kind === 'post' ? 'New post' : `New page in ${home!.title}`}
        {group && <span className="text-muted-foreground"> · {group}</span>}
      </h1>
      <div>
        <label htmlFor="new-title" className="text-sm font-medium">
          Title
        </label>
        <input id="new-title" required value={title} onChange={(e) => setTitle(e.target.value)} className={cn(field, 'mt-1.5')} autoFocus />
      </div>
      <div>
        <label htmlFor="new-slug" className="text-sm font-medium">
          Address
        </label>
        <div className="mt-1.5 flex items-center gap-1 font-mono text-xs text-muted-foreground">
          <span className="shrink-0">{kind === 'doc' ? `/docs/${home!.id}/` : '/blog/'}</span>
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
          Lower-case letters, digits and dashes{kind === 'post' ? ' (and _)' : ''}. It is the page's address for good, so keep it short.
        </p>
      </div>
      {problem && (
        <p role="alert" className="rounded-md border border-[var(--raft-amber)]/40 bg-[var(--raft-amber)]/10 px-3 py-2 text-sm">
          {problem}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={!valid || busy} className={cn(button, 'border-transparent bg-primary text-primary-foreground hover:ring-2 hover:ring-primary/40')}>
          {busy ? 'Checking…' : 'Start writing'}
        </button>
        <a href={back} className={cn(button, 'border-transparent text-muted-foreground hover:text-foreground')}>
          Cancel
        </a>
      </div>
      <p className="font-mono text-[0.6875rem] text-muted-foreground">Nothing is saved until you save; then it lives on its branch until its pull request merges.</p>
    </form>
  );
}
