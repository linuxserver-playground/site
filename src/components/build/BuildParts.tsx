/**
 * The non-interactive parts of a build page, as React so they render in two places from one source: at build
 * time on images/[name]/builds/[tag].astro (server-rendered, no JavaScript) for the builds the site was built
 * with, and in the browser on the 404 fallback (LiveBuildPage) for a build the hub has and the site does not yet.
 * Interactive pieces (copy button, logo) come in as slots so each page supplies its own.
 */
import * as React from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Minus, X } from 'lucide-react';
import { withBase } from '@/lib/base';
import { buildUrl, classify } from '@/lib/build-helpers';
import type { BuildPage } from '@/lib/build-page';
import { bytes, formatDate, isoDate, relative, shortDigest } from '@/lib/format';
import type { Classification } from '@/lib/hub';
import { cn } from '@/lib/utils';

/** AnchorHeading.astro in React: the id is a public contract, the "#" link copies the section URL (Layout wires it). */
export function AnchorHeading({ id, as: Tag = 'h2', className = 'text-xl font-semibold tracking-tight', children }: { id: string; as?: 'h2' | 'h3'; className?: string; children: React.ReactNode }) {
  return (
    <Tag id={id} className={cn('group/anchor', className)}>
      {children}
      <a href={`#${id}`} className="heading-anchor" aria-label="Copy link to this section" data-anchor>
        #
      </a>
    </Tag>
  );
}

const TONE: Record<string, string> = {
  upstream: 'border-primary/40 text-primary',
  mixed: 'border-primary/40 text-primary',
  base: 'border-[var(--raft-violet)]/50 text-[var(--raft-violet)]',
  packages: 'border-[var(--raft-hair-strong)] text-foreground',
  linuxserver: 'border-[var(--raft-hair-strong)] text-foreground',
  none: 'border-[var(--raft-hair)] text-muted-foreground',
  initial: 'border-[var(--raft-hair)] text-muted-foreground',
};

/** ClassBadge.astro in React. */
export function ClassBadge({ classification, className }: { classification?: Classification | null; className?: string }) {
  const c = classify(classification);
  if (!c) return null;
  return (
    <span className={cn('inline-flex rounded border px-1.5 py-px font-mono text-[0.6875rem] leading-4', TONE[classification!] ?? TONE.none, className)} title={c.desc}>
      {c.label}
    </span>
  );
}

function ResultIcon({ result }: { result: string }) {
  if (result === 'success') return <Check className="size-3.5" aria-hidden="true" />;
  if (result === 'failure') return <X className="size-3.5" aria-hidden="true" />;
  return <Minus className="size-3.5" aria-hidden="true" />;
}

const NEIGHBOUR = 'inline-flex h-9 items-center gap-1 rounded-md border border-[var(--raft-hair)] px-2.5 text-muted-foreground hover:border-[var(--raft-hair-strong)] hover:text-foreground';

export function BuildHeader({ page, now, logo, copy }: { page: BuildPage; now: Date; logo?: React.ReactNode; copy?: React.ReactNode }) {
  const { b, image, tag, prev, newerSameBranch, newest, result, summary, crumbs } = page;
  const all = [{ name: 'Home', href: '/' }, ...crumbs];
  return (
    <header className="relative overflow-hidden border-b border-[var(--raft-hair)]" data-pagefind-body>
      <div className="raft-aurora pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="raft-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="raft-container relative py-10 md:py-12">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-muted-foreground">
            {all.map((c, i) => (
              <li key={c.href} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden="true">/</span>}
                {i === all.length - 1 ? (
                  <span aria-current="page" className="text-foreground">
                    {c.name}
                  </span>
                ) : (
                  <a href={withBase(c.href)} className="hover:text-foreground">
                    {c.name}
                  </a>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-center">
          <a href={withBase(image.url)} className="grid size-16 shrink-0 place-items-center rounded-xl border border-[var(--raft-hair-strong)] bg-card p-2.5 shadow-[var(--raft-shadow)]" aria-label={`Back to ${image.name}`}>
            {logo}
          </a>
          <div className="min-w-0">
            <p className="font-mono text-sm text-muted-foreground">
              <a href={withBase(image.url)} className="hover:text-foreground">
                {image.name}
              </a>{' '}
              · build
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="font-mono text-3xl font-semibold tracking-tight md:text-4xl">{tag}</h1>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs',
                  result === 'success' ? 'bg-[var(--raft-ok)]/15 text-[var(--raft-ok)]' : result === 'failure' ? 'bg-destructive/15 text-destructive' : 'border border-[var(--raft-hair-strong)] text-muted-foreground',
                )}
              >
                <ResultIcon result={result} />
                {result}
              </span>
              <ClassBadge classification={summary?.classification ?? page.record.diff?.classification} className="text-xs" />
              {newest && <span className="rounded-md border border-[var(--raft-hair-strong)] px-2 py-0.5 font-mono text-xs text-muted-foreground">newest on {b.branch}</span>}
            </div>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
              <span>
                <time dateTime={b.created}>{formatDate(b.created)}</time> · {relative(b.created, now)}
              </span>
              <span>{b.platforms.map((p) => `${p.arch} ${bytes(p.size)}`).join(' · ')}</span>
              <span>{b.base.image.replace('ghcr.io/linuxserver/', '')}</span>
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex max-w-2xl flex-1 items-center gap-2 rounded-md border border-[var(--raft-hair-strong)] bg-[var(--raft-code-bg)] py-1 pr-1 pl-4 font-mono text-sm">
            <span className="min-w-0 flex-1 truncate">
              <span className="text-primary" aria-hidden="true">
                ${' '}
              </span>
              {page.pull}
            </span>
            {copy}
          </div>
          <nav aria-label="Neighbouring builds" className="flex items-center gap-2 font-mono text-xs">
            {prev && (
              <a href={withBase(buildUrl(image.name, prev.tag))} className={NEIGHBOUR}>
                <ArrowLeft className="size-3.5" aria-hidden="true" /> {prev.tag}
              </a>
            )}
            {newerSameBranch && (
              <a href={withBase(buildUrl(image.name, newerSameBranch.tag))} className={NEIGHBOUR}>
                {newerSameBranch.tag} <ArrowRight className="size-3.5" aria-hidden="true" />
              </a>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export function BuildRecordSection({ page }: { page: BuildPage }) {
  const { b, facts, tagList, arches, record, testsPassed, testsTotal, testsFailedNames } = page;
  const tests = record.tests ?? null;
  return (
    <section aria-labelledby="record" className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="raft-panel p-5">
        <AnchorHeading id="record" className="raft-eyebrow">
          Build record
        </AnchorHeading>
        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2.5 text-sm sm:grid-cols-[auto_minmax(0,1fr)]">
          {facts.map((f) => (
            <React.Fragment key={f.label}>
              <dt className="text-muted-foreground sm:pr-2">{f.label}</dt>
              <dd className={cn('min-w-0 break-all', f.mono && 'font-mono text-[0.8125rem]')} title={f.title}>
                {f.href ? (
                  <a href={f.href} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-foreground underline-offset-4 hover:text-primary hover:underline">
                    {f.value}
                    <ArrowUpRight className="size-3 text-muted-foreground" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ) : (
                  f.value
                )}
              </dd>
            </React.Fragment>
          ))}
        </dl>
        {tagList.length > 0 && (
          <details className="mt-4 border-t border-[var(--raft-hair)] pt-3">
            <summary className="cursor-pointer font-mono text-xs text-muted-foreground hover:text-foreground">{tagList.length} tags pushed</summary>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {tagList.map((t) => (
                <li key={t} className="rounded border border-[var(--raft-hair)] px-1.5 py-px font-mono text-[0.6875rem]">
                  {t}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
      <div className="space-y-3">
        <div className="raft-panel relative overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="border-b border-[var(--raft-hair)] bg-[var(--raft-surface)] px-4 py-2.5 text-left font-mono text-xs text-muted-foreground uppercase">Platforms</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Architecture</th>
                <th scope="col">Result</th>
                <th scope="col">Size</th>
                <th scope="col">Digest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--raft-hair)]">
              {b.platforms.map((p) => (
                <tr key={p.arch} className="align-top">
                  <th scope="row" className="px-4 py-3 font-mono text-[0.8125rem] font-normal">
                    {p.arch}
                    {p.runner && <span className="block text-[0.6875rem] text-muted-foreground">{p.runner}</span>}
                  </th>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">
                    <span className={cn('inline-flex items-center gap-1', p.result === 'success' ? 'text-[var(--raft-ok)]' : p.result === 'failure' ? 'text-destructive' : 'text-muted-foreground')}>
                      <ResultIcon result={p.result} />
                      {p.result}
                    </span>
                    {p.build_seconds != null && <span className="block font-mono text-[0.6875rem] text-muted-foreground">{Math.round(p.build_seconds)} s</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap tabular-nums">
                    {bytes(p.size)}
                    <span className="block text-[0.6875rem] text-muted-foreground">
                      {bytes(p.uncompressed_size)} on disk{p.layers != null && ` · ${p.layers} layers`}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[0.6875rem] text-muted-foreground" title={p.digest ?? undefined}>
                    {shortDigest(p.digest)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="raft-panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="raft-eyebrow">Tests</h2>
            <a href="#ci" className="inline-flex items-center gap-1 text-sm font-medium hover:text-primary">
              Full CI report <ArrowRight className="size-3.5" aria-hidden="true" />
            </a>
          </div>
          {!b.test.enabled ? (
            <p className="mt-3 text-sm text-muted-foreground">Testing is disabled for this image.</p>
          ) : (
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {Object.entries(b.test.per_arch ?? Object.fromEntries(arches.map((a) => [a, b.test.success]))).map(([a, ok]) => {
                const sm = tests?.summary[a as keyof typeof tests.summary];
                return (
                  <li key={a} className="flex items-center justify-between gap-3 rounded-md border border-[var(--raft-hair)] px-3 py-2 text-sm">
                    <span className="font-mono text-[0.8125rem]">{a}</span>
                    <span className={cn('inline-flex items-center gap-1 text-xs', ok ? 'text-[var(--raft-ok)]' : 'text-destructive')}>
                      {ok ? <Check className="size-3.5" aria-hidden="true" /> : <X className="size-3.5" aria-hidden="true" />}
                      {ok ? 'passed' : 'failed'}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">{sm ? `${sm.passed}/${sm.total}${sm.startup_seconds != null ? ` · ${sm.startup_seconds.toFixed(1)} s` : ''}` : '–'}</span>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            {testsTotal > 0 && (
              <>
                {testsPassed} of {testsTotal} checks passed
                {testsFailedNames.length > 0 && <>; failed: {testsFailedNames.join(', ')}</>}.
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

const ELSEWHERE = 'inline-flex h-8 items-center gap-1 rounded-md border border-[var(--raft-hair)] px-2.5 text-muted-foreground hover:border-[var(--raft-hair-strong)] hover:text-foreground';

/** The CI report section's heading row; the report itself is the CiReport island. */
export function CiHeading({ page }: { page: BuildPage }) {
  const { b, controlBuild } = page;
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <AnchorHeading id="ci">CI report</AnchorHeading>
      </div>
      <nav aria-label="This run elsewhere" className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <a href={controlBuild} target="_blank" rel="noopener" className={ELSEWHERE}>
          build status <ArrowUpRight className="size-3.5" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        <a href={b.workflow.run_url} target="_blank" rel="noopener" className={ELSEWHERE}>
          run #{b.workflow.run_id} <ArrowUpRight className="size-3.5" aria-hidden="true" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        <a href={withBase(`/fleet/runs/${b.workflow.run_id}/`)} className={ELSEWHERE}>
          run details <ArrowRight className="size-3.5" aria-hidden="true" />
        </a>
      </nav>
    </div>
  );
}

// .post-body sets article-sized text; notes stay at the panel's size, with headings as small bold labels.
const NOTES_PROSE =
  'post-body prose max-w-none break-words text-sm! text-muted-foreground prose-p:my-1.5 prose-headings:mt-4 prose-headings:mb-1.5 prose-headings:text-sm prose-headings:font-semibold prose-img:my-2 prose-img:rounded-md [&_table]:block [&_table]:overflow-x-auto dark:prose-invert';

/**
 * Release notes and the data links. `notesHtml` is renderNotes' output (sanitised to its allowlist); nothing else
 * is ever set as HTML here, and without it the notes are plain text. Both panels stay short: the data links sit in
 * two columns, and the notes scroll inside the panel past that height, upstream notes open by default.
 */
export function NotesAndData({ page, notesHtml, dataAsOf }: { page: BuildPage; notesHtml?: { linuxserver: string; upstream: string }; dataAsOf: { label: string; date: Date } }) {
  const { b, upstreamSource } = page;
  // Without rendered notes (the live page: the renderer only runs at build time) the Markdown is shown as text.
  const notes = (html: string | undefined, text: string, className: string) =>
    html !== undefined ? <div className={cn(NOTES_PROSE, className)} dangerouslySetInnerHTML={{ __html: html }} /> : <p className={cn('text-sm break-words whitespace-pre-wrap text-muted-foreground', className)}>{text}</p>;
  return (
    <section aria-labelledby="notes" className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_30rem]">
      <div className="raft-panel p-5">
        <AnchorHeading id="notes" className="raft-eyebrow">
          Release notes
        </AnchorHeading>
        {/* Keyboard users can scroll the box; the region name says what it holds. */}
        <div className="mt-1 max-h-64 overflow-y-auto overscroll-contain pr-2" tabIndex={0} role="region" aria-label="Release notes text">
          {b.notes?.linuxserver && (
            <div className="mt-2">
              <h3 className="text-sm font-semibold">LinuxServer changes</h3>
              {notes(notesHtml?.linuxserver, b.notes.linuxserver, 'mt-1')}
            </div>
          )}
          {b.notes?.upstream && (
            <details className="mt-4" open>
              <summary className="cursor-pointer text-sm font-semibold hover:text-primary">
                Upstream changes{b.version.upstream && ` for ${b.version.upstream}`}
              </summary>
              {notes(notesHtml?.upstream, b.notes.upstream, 'mt-2')}
              {upstreamSource && (
                <p className="mt-2 text-xs">
                  <a href={upstreamSource} target="_blank" rel="noopener" className="underline underline-offset-4 decoration-[var(--raft-hair-strong)] hover:text-foreground hover:decoration-current">
                    Source<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </p>
              )}
            </details>
          )}
          {!b.notes?.linuxserver && !b.notes?.upstream && <p className="mt-2 text-sm text-muted-foreground">No release notes.</p>}
        </div>
      </div>
      <nav className="raft-panel p-2" aria-label="Release assets and API">
        <h2 className="raft-eyebrow px-3 pt-2 pb-1">Data</h2>
        <ul className="grid grid-cols-1 gap-x-1 text-sm sm:grid-cols-2">
          {page.dataLinks.map((l) => (
            <li key={l.label} className="min-w-0">
              <a href={l.href} target="_blank" rel="noopener" className="flex items-center justify-between gap-2 rounded-md px-3 py-1.5 font-mono text-xs hover:bg-muted">
                <span className="truncate">{l.label}</span>
                <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="px-3 pt-3 pb-1 font-mono text-[0.6875rem] text-muted-foreground">
          {dataAsOf.label} <time dateTime={isoDate(dataAsOf.date)}>{formatDate(dataAsOf.date)}</time>
        </p>
      </nav>
    </section>
  );
}
