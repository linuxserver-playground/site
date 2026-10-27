import * as React from 'react';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { ProotApp } from '@/lib/hub';
import CopyButton from './CopyButton';

export type ProotAppCard = ProotApp & {
  /** The icon resized at build time; absent when the app has none. */
  iconSrc?: string;
};

interface Props {
  apps: ProotAppCard[];
  /** Categories with their app counts, largest first. */
  categories: { name: string; count: number }[];
}

/** A monogram tile coloured from the name, for an app without an icon (as ImageLogo does for images). */
function Monogram({ name }: { name: string }) {
  let hue = 0;
  for (const c of name) hue = (hue * 31 + c.charCodeAt(0)) % 360;
  return (
    <span
      aria-hidden="true"
      className="grid size-8 place-items-center rounded-[22%] text-sm font-semibold text-white uppercase"
      style={{ background: `linear-gradient(135deg,oklch(0.62 0.17 ${hue}),oklch(0.45 0.17 ${(hue + 40) % 360}))` }}
    >
      {name.slice(0, 1)}
    </span>
  );
}

/**
 * The PRoot Apps catalogue as a grid, with a text filter, a category filter (?q=, ?category=) and an arm64 toggle.
 * Each card carries the app's install command. Everything is server-rendered; the filters only hide cards.
 */
export default function ProotAppsBrowser({ apps, categories }: Props) {
  const [q, setQ] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [arm64, setArm64] = React.useState(false);
  const ready = React.useRef(false);
  const id = React.useId();

  React.useEffect(() => {
    const read = () => {
      const p = new URLSearchParams(window.location.search);
      setQ(p.get('q') ?? '');
      setCategory(p.get('category') ?? '');
      setArm64(p.get('arch') === 'arm64');
    };
    read();
    ready.current = true;
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, []);
  React.useEffect(() => {
    if (!ready.current) return;
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (category) p.set('category', category);
    if (arm64) p.set('arch', 'arm64');
    const qs = p.toString();
    history.replaceState(null, '', qs ? `?${qs}${window.location.hash}` : window.location.pathname + window.location.hash);
  }, [q, category, arm64]);

  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const rows = apps.filter(
    (a) =>
      (!category || a.category === category) &&
      (!arm64 || a.platforms.includes('arm64')) &&
      terms.every((t) => `${a.name} ${a.title} ${a.category} ${a.description}`.toLowerCase().includes(t)),
  );
  const chip =
    'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';

  return (
    <div>
      <div className="raft-panel sticky top-[3.75rem] z-20 flex flex-wrap items-center gap-2 p-2">
        <div className="relative min-w-0 flex-1 basis-56">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <label htmlFor={`${id}-q`} className="sr-only">
            Filter apps
          </label>
          <Input id={`${id}-q`} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Filter ${apps.length} apps…`} autoComplete="off" spellCheck={false} className="h-9 pl-8" />
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={arm64} onChange={(e) => setArm64(e.target.checked)} className="size-4 accent-primary" />
          runs on arm64
        </label>
        {(q || category || arm64) && (
          <button type="button" onClick={() => (setQ(''), setCategory(''), setArm64(false))} className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="size-3.5" aria-hidden="true" /> Clear
          </button>
        )}
      </div>

      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Categories">
        {[{ name: '', count: apps.length }, ...categories].map((c) => (
          <li key={c.name || 'all'}>
            <button
              type="button"
              aria-pressed={category === c.name}
              onClick={() => setCategory(c.name)}
              className={`${chip} ${category === c.name ? 'border-primary bg-primary/10 text-foreground' : 'border-[var(--raft-hair-strong)] text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              {c.name || 'All'}
              <span className="font-mono text-[0.6875rem]">{c.count}</span>
            </button>
          </li>
        ))}
      </ul>

      <p role="status" aria-live="polite" className="mt-4 px-1 font-mono text-xs text-muted-foreground">
        {rows.length} app{rows.length === 1 ? '' : 's'}
        {category && ` in ${category}`}
        {arm64 && ' for arm64'}
      </p>

      <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((a) => {
          const command = `proot-apps install ${a.name}`;
          return (
            <li key={a.name} id={`app-${a.name}`} className="raft-panel flex scroll-mt-32 flex-col p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-md border border-[var(--raft-hair)] bg-[var(--raft-surface)] p-1.5">
                  {a.iconSrc ? <img src={a.iconSrc} alt="" width={32} height={32} loading="lazy" decoding="async" className="size-8 object-contain" /> : <Monogram name={a.title} />}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{a.title}</h3>
                  <p className="flex flex-wrap items-center gap-x-2 font-mono text-xs text-muted-foreground">
                    <span>{a.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{a.platforms.join(', ')}</span>
                  </p>
                </div>
                <a href={a.url} target="_blank" rel="noopener" className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">{a.title} build files (opens in a new tab)</span>
                </a>
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{a.description}</p>
              <div className="mt-auto pt-4">
                <div className="flex items-center gap-1 rounded-md border border-[var(--raft-hair)] bg-[var(--raft-code-bg)] py-0.5 pr-0.5 pl-2.5 font-mono text-xs">
                  <span className="min-w-0 flex-1 truncate" title={command}>
                    <span className="text-primary" aria-hidden="true">
                      ${' '}
                    </span>
                    {command}
                  </span>
                  <CopyButton text={command} label={`Copy the install command for ${a.title}`} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {rows.length === 0 && (
        <div className="raft-panel mt-6 grid place-items-center gap-2 px-6 py-16 text-center">
          <p className="text-lg font-medium">No app matches.</p>
          <p className="text-sm text-muted-foreground">Try another word, or clear the filters.</p>
        </div>
      )}
    </div>
  );
}
