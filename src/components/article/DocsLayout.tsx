/**
 * The frame every documentation page shares: breadcrumbs, the section sidebar (left), the article with its
 * title, body, updated date and edit links, the previous/next pair, and the table of contents (right rail).
 * One component for the built pages (DocsShell.astro renders it at build time, passing the body and slots as
 * static HTML) and for the editor's preview, so a preview looks like the page will. Change the docs layout here.
 */
import type * as React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { formatDate, isoDate } from '@/lib/format';
import Crumbs, { type Crumb } from './Crumbs';
import type { TocEntry } from './PostArticle';

export interface NavPage {
  id: string;
  title: string;
  url: string;
}
export interface NavGroup {
  name?: string;
  pages: NavPage[];
}
export interface NavSection {
  id: string;
  title: string;
  url: string;
}

export interface DocsLayoutProps {
  sections: NavSection[];
  section: NavSection & { groups: NavGroup[] };
  /** Id of the page being read; undefined on a section page without an index.md. */
  currentId?: string;
  /** Whether this is the section's own page (its index.md, or no page at all). */
  onIndex: boolean;
  title: string;
  description: string;
  crumbs: Crumb[];
  toc: TocEntry[];
  /** ISO date of the last change, when known. */
  updated?: string | null;
  /** False on a section page that has no index.md: no footer then. */
  hasDoc: boolean;
  prev?: NavPage;
  next?: NavPage;
  children?: React.ReactNode;
  /** The editors' bar above the body. */
  bar?: React.ReactNode;
  /** Edit links at the end of the footer. */
  footer?: React.ReactNode;
  /** Between the article and previous/next (a section's page list). */
  after?: React.ReactNode;
}

const link =
  'block rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-accent-foreground';

function DocsNav({ sections, section, currentId, onIndex, idSuffix }: Pick<DocsLayoutProps, 'sections' | 'section' | 'currentId' | 'onIndex'> & { idSuffix: string }) {
  return (
    <nav aria-label="Documentation sections" className="space-y-6">
      <div>
        <h2 className="raft-eyebrow px-2.5" id={`docs-sections-${idSuffix}`}>
          Sections
        </h2>
        <ul className="mt-2 space-y-0.5" aria-labelledby={`docs-sections-${idSuffix}`}>
          {sections.map((s) => (
            <li key={s.id}>
              <a href={s.url} className={link} aria-current={s.id === section.id ? 'location' : undefined}>
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="raft-eyebrow px-2.5" id={`docs-pages-${idSuffix}`}>
          {section.title}
        </h2>
        <ul className="mt-2 space-y-0.5" aria-labelledby={`docs-pages-${idSuffix}`}>
          <li>
            <a href={section.url} className={link} aria-current={onIndex ? 'page' : undefined}>
              Overview
            </a>
          </li>
          {section.groups.map((g, i) => (
            <li key={g.name ?? `group-${i}`}>
              {g.name && <h3 className="mt-4 mb-1.5 px-2.5 font-mono text-[0.6875rem] tracking-wide text-muted-foreground uppercase">{g.name}</h3>}
              <ul className="space-y-0.5">
                {g.pages.map((p) => (
                  <li key={p.id}>
                    <a href={p.url} className={link} aria-current={p.id === currentId ? 'page' : undefined}>
                      {p.title}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default function DocsLayout(props: DocsLayoutProps) {
  const { section, title, description, crumbs, toc, updated, hasDoc, prev, next, children, bar, footer, after } = props;
  const rail = toc.filter((h) => h.depth === 2 || h.depth === 3);
  return (
    <div className="raft-container pt-8 lg:pt-10">
      <Crumbs crumbs={crumbs} />
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,1fr)_13rem] xl:gap-14">
        <details className="raft-panel group p-2 lg:hidden">
          <summary className="cursor-pointer list-none rounded-md px-2.5 py-1.5 text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-2">
              <ArrowRight className="size-3.5 transition-transform group-open:rotate-90" aria-hidden="true" />
              In this section: {section.title}
            </span>
          </summary>
          <div className="mt-2 border-t border-[var(--raft-hair)] pt-3">
            <DocsNav {...props} idSuffix="m" />
          </div>
        </details>
        <aside aria-label="Section navigation" className="hidden lg:block lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:overflow-y-auto lg:pr-2">
          <DocsNav {...props} idSuffix="d" />
        </aside>

        <div className="min-w-0">
          <article className="w-full max-w-[46rem] min-w-0">
            <header>
              <p className="raft-eyebrow">
                <span className="text-primary" aria-hidden="true">
                  //
                </span>{' '}
                {section.title}
              </p>
              <h1 className="mt-3 text-4xl leading-[1.1] font-semibold tracking-[-0.03em] md:text-[2.75rem]">{title}</h1>
              <p className="mt-4 text-lg text-muted-foreground">{description}</p>
            </header>
            {bar}
            <div className="mt-8 border-t border-[var(--raft-hair)] pt-8">{children}</div>
            {hasDoc && (
              <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--raft-hair)] pt-6 text-sm text-muted-foreground">
                <p className="font-mono text-xs">
                  {updated ? (
                    <>
                      Last updated <time dateTime={isoDate(updated)}>{formatDate(updated)}</time>
                    </>
                  ) : (
                    <>Documentation · {section.title}</>
                  )}
                </p>
                {footer}
              </div>
            )}
          </article>

          {after}

          {(prev || next) && (
            <nav aria-label="Previous and next page" className="mt-12 max-w-[46rem]">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {prev ? (
                  <a href={prev.url} rel="prev" className="raft-panel group flex flex-col gap-1 p-4 hover:bg-muted/40">
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                      <ArrowLeft className="size-3.5" aria-hidden="true" /> Previous
                    </span>
                    <span className="font-medium group-hover:text-primary">{prev.title}</span>
                  </a>
                ) : (
                  <span />
                )}
                {next && (
                  <a href={next.url} rel="next" className="raft-panel group flex flex-col items-end gap-1 p-4 text-right hover:bg-muted/40">
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                      Next <ArrowRight className="size-3.5" aria-hidden="true" />
                    </span>
                    <span className="font-medium group-hover:text-primary">{next.title}</span>
                  </a>
                )}
              </div>
            </nav>
          )}
        </div>

        <aside aria-label="On this page" className="hidden xl:block xl:sticky xl:top-20 xl:max-h-[calc(100dvh-6rem)] xl:self-start xl:overflow-y-auto">
          {rail.length > 1 && (
            <nav aria-labelledby="toc-title">
              <h2 id="toc-title" className="raft-eyebrow">
                On this page
              </h2>
              <ol className="mt-3 space-y-1.5 border-l border-[var(--raft-hair)] text-sm">
                {rail.map((h) => (
                  <li key={h.slug}>
                    <a href={`#${h.slug}`} className={`-ml-px block border-l border-transparent py-0.5 text-muted-foreground hover:border-primary hover:text-foreground ${h.depth === 3 ? 'pl-6' : 'pl-3'}`}>
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </aside>
      </div>
    </div>
  );
}
