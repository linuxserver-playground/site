import * as React from 'react';
import { Maximize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Ctx {
  active: boolean;
  toggle: () => void;
}

const FullscreenContext = React.createContext<Ctx>({ active: false, toggle: () => {} });

/** Whether the nearest FullscreenFrame fills the viewport. Views that size themselves read it. */
export function useFullscreen(): boolean {
  return React.useContext(FullscreenContext).active;
}

const STATE_KEY = 'lsioFullscreen';
let counter = 0;

/**
 * A view that can take the whole viewport: the init graph and the file treemap are too big for a card.
 * The view stays mounted in place (so loaded data and selection survive) and is only restyled as a fixed
 * layer, under a bar that names it and carries an explicit "Exit full screen" button. Escape exits too, and
 * entering pushes a history entry so the browser's Back button, the exit people reach for when nothing else
 * is obvious, leaves the view instead of the page. Scroll is locked underneath while it is open.
 */
export default function FullscreenFrame({ title, children }: { title: string; children: React.ReactNode }) {
  const [active, setActive] = React.useState(false);
  const id = React.useMemo(() => `${STATE_KEY}-${++counter}`, []);
  const exitButton = React.useRef<HTMLButtonElement>(null);
  const opener = React.useRef<HTMLElement | null>(null);
  /** Whether the history entry we pushed is still the current one, so exiting can pop it. */
  const pushed = React.useRef(false);

  const enter = React.useCallback(() => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    try {
      history.pushState({ ...(history.state ?? {}), [STATE_KEY]: id }, '');
      pushed.current = true;
    } catch {
      pushed.current = false;
    }
    setActive(true);
  }, [id]);

  const leave = React.useCallback(() => {
    if (pushed.current && history.state?.[STATE_KEY] === id) {
      // popstate closes the view.
      history.back();
      return;
    }
    pushed.current = false;
    setActive(false);
  }, [id]);

  const toggle = React.useCallback(() => (active ? leave() : enter()), [active, enter, leave]);

  // Back (or Forward past our entry) leaves the view.
  React.useEffect(() => {
    if (!active) return;
    const onPop = () => {
      if (history.state?.[STATE_KEY] !== id) {
        pushed.current = false;
        setActive(false);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [active, id]);

  // Escape leaves the view, unless the view used it (the treemap zooms out first).
  React.useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      e.preventDefault();
      leave();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, leave]);

  // Lock the page behind, move focus in, and give it back on exit.
  React.useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    requestAnimationFrame(() => exitButton.current?.focus({ preventScroll: true }));
    return () => {
      root.style.overflow = previous;
      const back = opener.current;
      opener.current = null;
      if (back?.isConnected) requestAnimationFrame(() => back.focus({ preventScroll: true }));
    };
  }, [active]);

  const ctx = React.useMemo(() => ({ active, toggle }), [active, toggle]);

  return (
    <FullscreenContext.Provider value={ctx}>
      <div
        className={active ? 'fixed inset-0 z-50 flex flex-col bg-background' : undefined}
        role={active ? 'dialog' : undefined}
        aria-modal={active ? true : undefined}
        aria-label={active ? `${title}, full screen` : undefined}
      >
        {active && (
          <div className="flex h-11 shrink-0 items-center gap-3 border-b border-[var(--raft-hair)] bg-[var(--raft-surface)] px-3.5">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-[#ff5f57]/80" />
              <span className="size-2.5 rounded-full bg-[#febc2e]/80" />
              <span className="size-2.5 rounded-full bg-[#28c840]/80" />
            </span>
            <span className="truncate font-mono text-xs text-muted-foreground">{title}</span>
            <Button ref={exitButton} type="button" variant="outline" size="sm" onClick={leave} className="ml-auto">
              <X aria-hidden="true" />
              Exit full screen
            </Button>
          </div>
        )}
        <div className={active ? 'min-h-0 flex-1 overflow-auto' : undefined}>{children}</div>
      </div>
    </FullscreenContext.Provider>
  );
}

/**
 * The button that opens the view, placed in the view's own header; full screen, the bar's Exit button is the one
 * way out shown. Before hydration it is drawn but does nothing, like every island control.
 */
export function FullscreenButton({ className }: { className?: string }) {
  const { active, toggle } = React.useContext(FullscreenContext);
  if (active) return null;
  return (
    <Button type="button" variant="ghost" size="icon-sm" onClick={toggle} className={className} aria-label="View full screen" title="Full screen">
      <Maximize2 aria-hidden="true" />
    </Button>
  );
}
