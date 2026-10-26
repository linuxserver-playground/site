/**
 * A blog post as it reads: header (tags, title, byline, date, reading time, hero), the body beside its contents
 * rail, and the footer. One component for the built page (blog/[slug].astro renders it at build time, passing
 * the body and the slots as static HTML) and for the editor's preview (the body rendered in the browser), so a
 * preview looks like the post will. Change the post's layout here, never in only one of the two.
 */
import type * as React from 'react';
import { formatDate, formatDateLong, isoDate } from '@/lib/format';
import Crumbs, { type Crumb } from './Crumbs';

export interface PostTag {
  name: string;
  slug: string;
  url: string;
}
export interface PostByline {
  name: string;
  url?: string;
  initials: string;
}
export interface HeroImage {
  src: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
  alt: string;
}
export interface TocEntry {
  depth: number;
  slug: string;
  text: string;
}

export interface PostArticleProps {
  title: string;
  crumbs: Crumb[];
  tags: PostTag[];
  byline?: PostByline;
  /** ISO date; null for a post that gets its date when its pull request merges. */
  date: string | null;
  updated?: string | null;
  readingTime: number;
  /** The post's own hero; none for posts on the stock image (it shows on cards only). */
  hero?: HeroImage | null;
  toc: TocEntry[];
  /** The rendered Markdown (wrapped in PostBody on the built page). */
  children?: React.ReactNode;
  /** The editors' bar above the body. */
  bar?: React.ReactNode;
  /** Edit links at the end of the footer. */
  footer?: React.ReactNode;
  /** Extra panels in the rail under the contents (the images the post is about). */
  rail?: React.ReactNode;
}

export default function PostArticle({ title, crumbs, tags, byline, date, updated, readingTime, hero, toc, children, bar, footer, rail }: PostArticleProps) {
  return (
    <article>
      <header className="relative overflow-hidden">
        <div className="raft-aurora pointer-events-none absolute inset-0 opacity-60" aria-hidden="true"></div>
        <div className="raft-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
        <div className="raft-container relative pt-10 pb-10 md:pt-14">
          <Crumbs crumbs={crumbs} />
          <div className="mx-auto mt-10 max-w-3xl text-center">
            {tags.length > 0 && (
              <ul className="flex flex-wrap justify-center gap-1.5" aria-label="Tags">
                {tags.map((t) => (
                  <li key={t.slug}>
                    <a href={t.url} className="rounded-md border border-[var(--raft-hair)] bg-background/50 px-2 py-0.5 font-mono text-xs text-muted-foreground hover:text-foreground">
                      #{t.slug}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <h1 className="mt-5 text-4xl leading-[1.1] font-semibold tracking-[-0.035em] md:text-[3.25rem]">{title}</h1>
            <p className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
              {byline && (
                <span className="inline-flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-otter-magenta to-otter-violet font-mono text-[0.625rem] font-semibold text-white" aria-hidden="true">
                    {byline.initials}
                  </span>
                  {byline.url ? (
                    <a href={byline.url} className="font-medium text-foreground hover:text-primary">
                      {byline.name}
                    </a>
                  ) : (
                    <span className="font-medium text-foreground">{byline.name}</span>
                  )}
                </span>
              )}
              {byline && <span aria-hidden="true">·</span>}
              {date ? (
                <time dateTime={isoDate(date)} className="font-mono text-xs">
                  {formatDateLong(date)}
                </time>
              ) : (
                <span className="font-mono text-xs">dated when it is published</span>
              )}
              <span aria-hidden="true">·</span>
              <span className="font-mono text-xs">{readingTime} min read</span>
            </p>
          </div>
          {hero && (
            <div className="raft-panel mx-auto mt-10 max-w-5xl overflow-hidden">
              <img
                src={hero.src}
                srcSet={hero.srcSet}
                sizes={hero.sizes}
                width={hero.width}
                height={hero.height}
                alt={hero.alt}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="max-h-[34rem] w-full object-cover"
              />
            </div>
          )}
        </div>
      </header>

      {/* Same width as the hero: text aligned to its left edge, contents in a right rail. */}
      <div className="raft-container">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 pt-8 lg:grid-cols-[minmax(0,1fr)_14rem] xl:gap-16">
          <div className="w-full max-w-[46rem] min-w-0">
            {bar}
            {children}
            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--raft-hair)] pt-6 text-sm text-muted-foreground">
              <p className="font-mono text-xs">
                {updated ? (
                  <>
                    Last updated <time dateTime={isoDate(updated)}>{formatDate(updated)}</time>
                  </>
                ) : date ? (
                  <>
                    Published <time dateTime={isoDate(date)}>{formatDate(date)}</time>
                  </>
                ) : (
                  <>Not published yet</>
                )}
              </p>
              {footer}
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:overflow-y-auto">
            {toc.length > 2 && (
              <nav aria-labelledby="toc-title" className="hidden lg:block">
                <h2 id="toc-title" className="raft-eyebrow">
                  On this page
                </h2>
                <ol className="mt-3 space-y-1.5 border-l border-[var(--raft-hair)] text-sm">
                  {toc.map((h) => (
                    <li key={h.slug}>
                      <a
                        href={`#${h.slug}`}
                        className={`-ml-px block border-l border-transparent py-0.5 text-muted-foreground hover:border-primary hover:text-foreground ${h.depth === 3 ? 'pl-6' : 'pl-3'}`}
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            {rail}
          </aside>
        </div>
      </div>
    </article>
  );
}
