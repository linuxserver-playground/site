import * as React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Mod } from '@/lib/hub';
import CopyButton from './CopyButton';

interface Props {
  mods: Mod[];
  /** Image names a mod targets or is listed for, with counts. */
  targets: { name: string; count: number }[];
  /** Image names that exist in the catalogue, so a target can link to its page. */
  images: string[];
  base: string;
}

/**
 * The mods index with a text filter and a per-image filter (?image=<name>). Universal mods are listed
 * with every image, those whose mod.yml lists the chosen image first. Each mod links to its page,
 * /mods/<branch>/. Everything is server-rendered; the filters only hide rows.
 */
export default function ModsBrowser({ mods, targets, images, base }: Props) {
  const [q, setQ] = React.useState('');
  const [image, setImage] = React.useState('');
  const [showDeprecated, setShowDeprecated] = React.useState(false);
  const ready = React.useRef(false);
  const id = React.useId();
  const known = React.useMemo(() => new Set(images), [images]);

  React.useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQ(p.get('q') ?? '');
    setImage(p.get('image') ?? '');
    ready.current = true;
    const onPop = () => {
      const p2 = new URLSearchParams(window.location.search);
      setQ(p2.get('q') ?? '');
      setImage(p2.get('image') ?? '');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  React.useEffect(() => {
    if (!ready.current) return;
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (image) p.set('image', image);
    const qs = p.toString();
    history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [q, image]);

  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const rows = mods.filter(
    (m) =>
      (showDeprecated || !m.deprecated) &&
      (!image || m.target === image || m.target === 'universal' || m.applies_to.includes(image)) &&
      terms.every((t) => `${m.name} ${m.title} ${m.summary} ${m.target} ${m.applies_to.join(' ')}`.toLowerCase().includes(t)),
  );
  const own = rows.filter((m) => m.target !== 'universal');
  const curated = image ? rows.filter((m) => m.target === 'universal' && m.applies_to.includes(image)) : [];
  const universal = rows.filter((m) => m.target === 'universal' && !curated.includes(m));
  const deprecatedCount = mods.filter((m) => m.deprecated).length;

  return (
    <div>
      <div className="raft-panel sticky top-[3.75rem] z-20 flex flex-wrap items-center gap-2 p-2">
        <div className="relative min-w-0 flex-1 basis-56">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <label htmlFor={`${id}-q`} className="sr-only">
            Filter mods
          </label>
          <Input id={`${id}-q`} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Filter ${mods.length} mods…`} autoComplete="off" spellCheck={false} className="h-9 pl-8" />
        </div>
        <label className="text-sm text-muted-foreground">
          <span className="sr-only">Image</span>
          <select value={image} onChange={(e) => setImage(e.target.value)} className="h-9 max-w-[12rem] rounded-md border border-input bg-transparent px-2 font-mono text-xs text-foreground">
            <option value="">every image</option>
            {targets.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name} ({t.count})
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={showDeprecated} onChange={(e) => setShowDeprecated(e.target.checked)} className="size-4 accent-primary" />
          show {deprecatedCount} deprecated
        </label>
        {(q || image) && (
          <button type="button" onClick={() => (setQ(''), setImage(''))} className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="size-3.5" aria-hidden="true" /> Clear
          </button>
        )}
      </div>
      <p role="status" aria-live="polite" className="mt-4 px-1 font-mono text-xs text-muted-foreground">
        {own.length} image-specific and {curated.length + universal.length} universal mod{curated.length + universal.length === 1 ? '' : 's'}
        {image && (
          <>
            {' '}
            for{' '}
            {known.has(image) ? (
              <a href={`${base}/images/${image}/`} className="text-foreground underline-offset-4 hover:underline">
                {image}
              </a>
            ) : (
              <span className="text-foreground">{image}</span>
            )}
          </>
        )}
      </p>

      {[
        { title: image ? `For ${image}` : 'Image-specific', list: own },
        { title: `Universal, suggested for ${image}`, list: curated },
        { title: curated.length ? 'Other universal mods' : 'Universal (any image)', list: universal },
      ].map((group) =>
        group.list.length ? (
          <section key={group.title} className="mt-6" aria-label={group.title}>
            <h2 className="raft-eyebrow px-1">{group.title}</h2>
            <ul className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {group.list.map((m) => (
                <li key={m.branch} className="raft-panel flex flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 truncate font-semibold">
                      <a href={`${base}/mods/${m.branch}/`} className="hover:text-primary">
                        {m.title}
                      </a>
                    </h3>
                    <span className="shrink-0 font-mono text-[0.6875rem] text-muted-foreground">
                      {m.target === 'universal' ? (
                        'universal'
                      ) : known.has(m.target) ? (
                        <a href={`${base}/images/${m.target}/`} className="underline underline-offset-4 decoration-[var(--raft-hair-strong)] hover:text-foreground hover:decoration-current">
                          {m.target}
                        </a>
                      ) : (
                        m.target
                      )}
                    </span>
                  </div>
                  {m.deprecated && (
                    <p className="mt-1 text-xs text-destructive">
                      Deprecated{m.deprecation_message ? `: ${m.deprecation_message}` : ''}
                    </p>
                  )}
                  <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">{m.summary}</p>
                  {m.applies_to.length > 1 && (
                    <p className="mt-1.5 font-mono text-[0.6875rem] text-muted-foreground">
                      {m.target === 'universal' ? 'suggested for' : 'also for'}{' '}
                      {m.applies_to
                        .filter((a) => a !== m.target)
                        .map((a, i) => (
                          <React.Fragment key={a}>
                            {i > 0 && ', '}
                            {known.has(a) ? (
                              <a href={`${base}/images/${a}/`} className="underline underline-offset-4 decoration-[var(--raft-hair-strong)] hover:text-foreground hover:decoration-current">
                                {a}
                              </a>
                            ) : (
                              a
                            )}
                          </React.Fragment>
                        ))}
                    </p>
                  )}
                  {m.env.length > 0 && (
                    <details className="mt-2 text-xs">
                      <summary className="cursor-pointer font-mono text-muted-foreground hover:text-foreground">
                        {m.env.length} setting{m.env.length === 1 ? '' : 's'}
                      </summary>
                      <ul className="mt-1.5 space-y-1">
                        {m.env.map((e) => (
                          <li key={e.name}>
                            <code className="font-mono text-foreground">{e.name}</code>
                            {e.default != null && <span className="font-mono text-muted-foreground">={e.default}</span>}
                            {e.required && <span className="ml-1 text-muted-foreground">(required)</span>}
                            <span className="text-muted-foreground"> · {e.description}</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                  <div className="mt-auto flex items-center gap-1 rounded-md border border-[var(--raft-hair)] bg-[var(--raft-code-bg)] py-0.5 pr-0.5 pl-2.5 pt-3 font-mono text-xs">
                    <span className="min-w-0 flex-1 truncate" title={m.image}>
                      <span className="text-muted-foreground">DOCKER_MODS=</span>
                      {m.image}
                    </span>
                    <CopyButton text={m.image} label={`Copy ${m.title} mod image`} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null,
      )}
      {rows.length === 0 && (
        <div className="raft-panel mt-6 grid place-items-center gap-2 px-6 py-16 text-center">
          <p className="text-lg font-medium">No mod matches.</p>
          <p className="text-sm text-muted-foreground">Try another word, or clear the image filter.</p>
        </div>
      )}
    </div>
  );
}
