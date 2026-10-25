/**
 * The header's sign-in control for the control plane: "Sign in" sends the browser to
 * `{CONTROL}/login?next=<this page>`; signed in, it shows the GitHub avatar and a sign-out menu.
 * `/api/me` is read once per page (shared with every fleet island) and the CSRF token stays in memory.
 */
import * as React from 'react';
import { LogIn } from 'lucide-react';
import { loginUrl, logout, setMe, useMe, CONTROL_URL } from '@/lib/control';

export default function SignIn({ className }: { className?: string }) {
  const me = useMe();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const signIn = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      sessionStorage.setItem('control-login', 'pending');
    } catch {}
    location.href = loginUrl(location.href);
  };

  const signOut = async () => {
    if (!me?.csrf) return;
    setBusy(true);
    try {
      await logout(me.csrf);
    } catch {}
    setMe({ authenticated: false, login: null, avatar_url: null, member: false, checked_at: null, csrf: null });
    setBusy(false);
    setOpen(false);
  };

  // Before /api/me answers (and without JavaScript) the control is a plain link to the control plane's login.
  if (!me || !me.authenticated) {
    return (
      <a
        href={`${CONTROL_URL}/login`}
        onClick={signIn}
        className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${className ?? ''}`}
        title="Team sign-in with GitHub"
      >
        <LogIn className="size-4" aria-hidden="true" />
        <span className="hidden md:inline">Sign in</span>
        <span className="sr-only md:hidden">Sign in</span>
      </a>
    );
  }

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex h-8 items-center gap-2 rounded-md px-1.5 text-sm hover:bg-muted"
        aria-label={`Signed in as ${me.login}${me.member ? ', organisation member' : ''}`}
      >
        {me.avatar_url ? (
          <img src={`${me.avatar_url}${me.avatar_url.includes('?') ? '&' : '?'}s=48`} alt="" width={24} height={24} className="size-6 rounded-full border border-[var(--raft-hair-strong)]" />
        ) : (
          <span className="grid size-6 place-items-center rounded-full bg-muted font-mono text-[0.6875rem] uppercase">{me.login?.slice(0, 2)}</span>
        )}
        {me.member && <span className="raft-pulse" aria-hidden="true" title="Organisation member" />}
      </button>
      {open && (
        <div role="menu" className="raft-panel absolute right-0 z-50 mt-1.5 w-56 p-1.5 text-sm shadow-lg">
          <p className="px-2.5 py-1.5">
            <span className="block truncate font-medium">{me.login}</span>
            <span className="block font-mono text-[0.6875rem] text-muted-foreground">{me.member ? 'organisation member · can manage the fleet' : 'signed in · not an organisation member'}</span>
          </p>
          <a role="menuitem" href={`${CONTROL_URL}/management`} target="_blank" rel="noopener" className="block rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            Control plane<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <button role="menuitem" type="button" onClick={signOut} disabled={busy} className="block w-full rounded-md px-2.5 py-1.5 text-left text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-60">
            {busy ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
}
