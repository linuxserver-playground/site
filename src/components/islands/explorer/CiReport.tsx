/**
 * The CI report of one build, rendered from the hub's `tests.json` (server-rendered from the snapshot,
 * so the summary and the test table are in the HTML) plus the unpacked report files fetched on demand:
 * the screenshot (lightbox on click), the container and browser logs (loaded when opened, copyable), the
 * package diff against the previous release, and links to the harness's own HTML and the run.
 */
import * as React from 'react';
import { ArrowUpRight, Check, Copy, Download, Minus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { Arch, TestsData } from '@/lib/hub';
import { cn } from '@/lib/utils';

interface Props {
  image: string;
  tag: string;
  tests: TestsData | null;
  /** `${HUB_URL}/builds/<image>/<tag>/` */
  reportDir: string;
  /** The hub's `tests.json`, fetched when the snapshot has none (a build ingested after the last refresh). */
  testsUrl: string;
  /** The run on the control plane and on GitHub. */
  runUrl?: string | null;
  controlUrl?: string | null;
  testEnabled: boolean;
}

const FILES = ['screenshot.png', 'container.log', 'browser.log', 'sysinfo.txt', 'package_diff.txt', 'index.html'] as const;

export default function CiReport(props: Props) {
  const [tests, setTests] = React.useState<TestsData | null>(props.tests);
  const [state, setState] = React.useState<'idle' | 'loading' | 'missing' | 'error'>(props.tests ? 'idle' : 'loading');
  const arches = React.useMemo(() => Object.keys(tests?.reports ?? tests?.summary ?? {}) as Arch[], [tests]);
  const [arch, setArch] = React.useState<Arch | null>(null);
  const current = arch && arches.includes(arch) ? arch : arches[0];

  React.useEffect(() => {
    if (props.tests) return;
    const ctrl = new AbortController();
    fetch(props.testsUrl, { signal: ctrl.signal })
      .then(async (r) => {
        if (r.status === 404) return setState('missing');
        if (!r.ok) throw new Error(String(r.status));
        const j = (await r.json()) as { data: TestsData };
        setTests(j.data);
        setState('idle');
      })
      .catch((e) => {
        if ((e as Error).name !== 'AbortError') setState('error');
      });
    return () => ctrl.abort();
  }, [props.tests, props.testsUrl]);

  if (!props.testEnabled) {
    return <p className="px-4 py-5 text-sm text-muted-foreground">Testing is disabled for this image.</p>;
  }
  if (!tests) {
    return (
      <p className="px-4 py-5 text-sm text-muted-foreground" role="status">
        {state === 'loading' && 'Loading the test report…'}
        {state === 'missing' && 'No test report for this build yet.'}
        {state === 'error' && (
          <>
            The report could not be loaded.{' '}
            <a href={props.testsUrl} className="underline underline-offset-4">
              tests.json
            </a>
          </>
        )}
      </p>
    );
  }

  const report = current ? tests.reports?.[current] : undefined;
  const summary = current ? tests.summary?.[current] : undefined;
  const file = (name: (typeof FILES)[number]) => `${props.reportDir}${current}/${name}`;

  return (
    <div>
      {/* Per-arch result pills double as the switch between reports */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--raft-hair)] bg-[var(--raft-surface)] px-3.5 py-2">
        <div role="tablist" aria-label="Architecture" className="flex flex-wrap gap-1.5">
          {arches.map((a) => {
            const s = tests.summary?.[a];
            const ok = s?.success ?? tests.reports?.[a]?.success;
            const selected = a === current;
            return (
              <button
                key={a}
                role="tab"
                type="button"
                aria-selected={selected}
                onClick={() => setArch(a)}
                className={cn(
                  'inline-flex h-7 items-center gap-1.5 rounded-md border bg-background px-2 font-mono text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  ok ? 'border-[var(--raft-ok)]/30 text-[var(--raft-ok)]' : 'border-destructive/30 text-[var(--raft-danger)]',
                  selected ? 'shadow-[inset_0_0_0_1px_var(--raft-hair-strong)]' : 'border-dashed',
                )}
              >
                {ok ? <Check className="size-3.5" aria-hidden="true" /> : <X className="size-3.5" aria-hidden="true" />}
                {a}
                {s && (
                  <span className="text-muted-foreground tabular-nums">
                    {s.passed}/{s.total}
                  </span>
                )}
              </button>
            );
          })}
          {arches.length === 0 && <span className="font-mono text-xs text-muted-foreground">no per-arch report</span>}
        </div>
        <p className="flex flex-wrap gap-x-3 font-mono text-[0.6875rem] text-muted-foreground">
          {report?.ci_version && <span>ci {report.ci_version}</span>}
          {report?.engine && <span>docker {report.engine}</span>}
          {report?.finished && <time dateTime={report.finished}>{report.finished.replace('T', ' ').replace('Z', ' UTC')}</time>}
        </p>
      </div>

      {report && (
        <div className="grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0">
            {/* Facts */}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-[var(--raft-hair)] p-4 text-sm sm:grid-cols-4">
              <Fact label="Startup" value={report.startup_seconds != null ? `${report.startup_seconds.toFixed(1)} s` : '–'} />
              <Fact label="Listening" value={summary?.listening_ports?.length ? summary.listening_ports.join(', ') : report.runtime?.listening_tcp?.length ? report.runtime.listening_tcp.map((p) => `${p}/tcp`).join(', ') : 'nothing'} />
              <Fact label="Warnings" value={String(summary?.warnings ?? report.tests.filter((t) => t.status === 'WARN').length)} tone={(summary?.warnings ?? 0) > 0 ? 'warn' : undefined} />
              <Fact label="Memory · PIDs" value={`${report.runtime?.rss_bytes != null ? `${(report.runtime.rss_bytes / 1048576).toFixed(0)} MB` : '–'} · ${report.runtime?.pids ?? '–'}`} />
              {report.runtime?.s6_services?.length ? <Fact label="s6 services" value={report.runtime.s6_services.join(', ')} /> : null}
              {report.runtime?.changed_paths != null && <Fact label="Changed paths" value={String(report.runtime.changed_paths)} />}
              {report.runner && <Fact label="Runner" value={report.runner} />}
            </dl>

            {/* Test table */}
            <div className="relative overflow-x-auto">
              <table className="w-full text-left text-sm" id="tests">
                <caption className="sr-only">Tests on {current}</caption>
                <thead className="border-b border-[var(--raft-hair)] font-mono text-[0.6875rem] text-muted-foreground uppercase">
                  <tr>
                    <th scope="col" className="px-4 py-2 font-normal">
                      Test
                    </th>
                    <th scope="col" className="px-4 py-2 font-normal">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-2 font-normal">
                      Message
                    </th>
                    <th scope="col" className="px-4 py-2 text-right font-normal">
                      Seconds
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--raft-hair)]">
                  {report.tests.map((t, i) => (
                    <tr key={`${t.name}-${i}`} className="align-top">
                      <th scope="row" className="px-4 py-2 font-normal">
                        {t.name}
                      </th>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <Status s={t.status} />
                      </td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{t.message}</td>
                      <td className="px-4 py-2 text-right font-mono text-xs tabular-nums">{t.seconds != null ? t.seconds.toFixed(1) : '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Logs and diff */}
            <div className="divide-y divide-[var(--raft-hair)] border-t border-[var(--raft-hair)]">
              <LogDetails title="Container log" url={file('container.log')} />
              <LogDetails title="Browser log" url={file('browser.log')} />
              <LogDetails title="Package diff versus the previous release" url={file('package_diff.txt')} openByDefault emptyText="No package changes found." />
              <LogDetails title="System info" url={file('sysinfo.txt')} />
            </div>
          </div>

          <aside className="border-t border-[var(--raft-hair)] lg:border-t-0 lg:border-l" aria-label="Screenshot and report files">
            <Screenshot url={file('screenshot.png')} arch={current!} image={props.image} />
            <ul className="p-2 text-sm">
              {[
                { label: `Harness report (${current})`, href: file('index.html') },
                { label: 'Report index', href: props.reportDir },
                ...(props.controlUrl ? [{ label: 'Run status', href: props.controlUrl }] : []),
                ...(props.runUrl ? [{ label: 'Run on GitHub', href: props.runUrl }] : []),
                ...(summary?.tarball ? [{ label: `test.${current}.tar.gz`, href: summary.tarball }] : []),
                { label: 'tests.json', href: props.testsUrl },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noopener" className="flex items-center justify-between gap-2 rounded-md px-3 py-1.5 font-mono text-xs hover:bg-muted">
                    <span className="truncate">{l.label}</span>
                    <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </div>
  );
}

function Fact({ label, value, tone }: { label: string; value: string; tone?: 'warn' }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[0.6875rem] text-muted-foreground uppercase">{label}</dt>
      <dd className={cn('mt-0.5 truncate font-mono text-xs', tone === 'warn' && 'text-[var(--raft-amber)]')} title={value}>
        {value}
      </dd>
    </div>
  );
}

function Status({ s }: { s: string }) {
  const u = s.toUpperCase();
  const cls = u === 'PASS' ? 'text-[var(--raft-ok)]' : u === 'FAIL' ? 'text-[var(--raft-danger)]' : u === 'WARN' ? 'text-[var(--raft-amber)]' : 'text-muted-foreground';
  const Icon = u === 'PASS' ? Check : u === 'FAIL' ? X : Minus;
  return (
    <span className={cn('inline-flex items-center gap-1 font-mono text-xs', cls)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {u.toLowerCase()}
    </span>
  );
}

/** A collapsible log: fetched the first time it is opened, monospace, with copy and download. */
function LogDetails({ title, url, openByDefault = false, emptyText }: { title: string; url: string; openByDefault?: boolean; emptyText?: string }) {
  const [open, setOpen] = React.useState(false);
  // Keyed by URL, so switching architecture loads that architecture's file instead of keeping the last one.
  const [loaded, setLoaded] = React.useState<{ url: string; text: string } | null>(null);
  const text = loaded?.url === url ? loaded.text : null;
  const [state, setState] = React.useState<'idle' | 'loading' | 'missing' | 'error'>('idle');
  const [copied, setCopied] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    setHydrated(true);
    if (openByDefault) setOpen(true);
  }, [openByDefault]);

  // `state` stays out of the dependencies: setting it to 'loading' would re-run the effect, whose cleanup aborts
  // the request it just started, and the panel would wait forever.
  React.useEffect(() => {
    if (!open || loaded?.url === url) return;
    const ctrl = new AbortController();
    setState('loading');
    fetch(url, { signal: ctrl.signal })
      .then(async (r) => {
        if (r.status === 404) return setState('missing');
        if (!r.ok) throw new Error(String(r.status));
        const body = await r.text();
        setLoaded({ url, text: body });
        setState('idle');
      })
      .catch((e) => {
        if ((e as Error).name !== 'AbortError') setState('error');
      });
    return () => ctrl.abort();
  }, [open, url, loaded]);

  const copy = async () => {
    if (text === null) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const lines = text === null ? 0 : text.split('\n').length;
  const big = text !== null && text.length > 200_000;
  const shown = big ? text!.slice(-200_000) : text;

  return (
    <details open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)} className="group">
      <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-muted/50">
        <span className="font-medium">{title}</span>
        <span className="font-mono text-[0.6875rem] text-muted-foreground">
          {text !== null ? `${lines} lines` : state === 'loading' ? 'loading…' : state === 'missing' ? 'not in this report' : hydrated ? 'open to load' : ''}
          <span className="ml-2 inline-block transition-transform group-open:rotate-90" aria-hidden="true">
            ▸
          </span>
        </span>
      </summary>
      <div className="border-t border-[var(--raft-hair)] bg-[var(--raft-code-bg)]">
        {text !== null && (
          <>
            <div className="flex items-center justify-between gap-2 border-b border-[var(--raft-hair)] px-3 py-1.5 font-mono text-[0.6875rem] text-muted-foreground">
              <span className="truncate">
                {url.split('/').pop()}
                {big && ' · last 200 KB shown'}
              </span>
              <span className="flex items-center gap-1">
                <button type="button" onClick={copy} className="inline-flex h-6 items-center gap-1 rounded px-1.5 hover:bg-muted hover:text-foreground" aria-label={`Copy ${title}`}>
                  {copied ? <Check className="size-3" aria-hidden="true" /> : <Copy className="size-3" aria-hidden="true" />} {copied ? 'copied' : 'copy'}
                </button>
                <a href={url} download className="inline-flex h-6 items-center gap-1 rounded px-1.5 hover:bg-muted hover:text-foreground">
                  <Download className="size-3" aria-hidden="true" /> raw
                </a>
              </span>
            </div>
            {shown!.trim() === '' || (emptyText && shown!.trim() === emptyText) ? (
              <p className="px-3 py-3 text-xs text-muted-foreground">{emptyText ?? 'The file is empty.'}</p>
            ) : (
              <pre className="max-h-[28rem] overflow-auto px-3 py-2 font-mono text-[0.6875rem] leading-relaxed whitespace-pre" tabIndex={0}>
                {shown}
              </pre>
            )}
          </>
        )}
        {text === null && state === 'loading' && (
          <p className="px-3 py-3 text-xs text-muted-foreground" role="status">
            Loading…
          </p>
        )}
        {state === 'missing' && <p className="px-3 py-3 text-xs text-muted-foreground">Not available for this build.</p>}
        {state === 'error' && (
          <p className="px-3 py-3 text-xs text-muted-foreground">
            Could not load it.{' '}
            <a href={url} className="underline underline-offset-4" target="_blank" rel="noopener">
              Open the raw file<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        )}
        {!hydrated && text === null && state === 'idle' && (
          <p className="px-3 py-3 text-xs text-muted-foreground">
            <a href={url} className="underline underline-offset-4" target="_blank" rel="noopener">
              Open the raw file<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        )}
      </div>
    </details>
  );
}

/** The harness's screenshot, inline, with a lightbox; hidden entirely when the hub has none. */
function Screenshot({ url, arch, image }: { url: string; arch: string; image: string }) {
  const [state, setState] = React.useState<'loading' | 'ok' | 'missing'>('loading');
  const [open, setOpen] = React.useState(false);
  if (state === 'missing') return null;
  const alt = `Screenshot of ${image} taken by the test harness on ${arch}`;
  return (
    <figure className="border-b border-[var(--raft-hair)] p-3">
      <button type="button" onClick={() => setOpen(true)} className="group block w-full overflow-hidden rounded-md border border-[var(--raft-hair)] bg-[var(--raft-code-bg)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" aria-label="Enlarge the screenshot">
        <img src={url} alt={alt} loading="lazy" onLoad={() => setState('ok')} onError={() => setState('missing')} className={cn('block w-full transition-transform group-hover:scale-[1.02]', state === 'loading' && 'min-h-24')} />
      </button>
      <figcaption className="mt-1.5 font-mono text-[0.6875rem] text-muted-foreground">screenshot.png · {arch} · click to enlarge</figcaption>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92dvh] w-[min(96vw,80rem)] overflow-auto p-2 sm:max-w-none">
          <DialogTitle className="sr-only">Screenshot</DialogTitle>
          <DialogDescription className="sr-only">{alt}</DialogDescription>
          <img src={url} alt={alt} className="block h-auto w-full rounded-md" />
        </DialogContent>
      </Dialog>
    </figure>
  );
}
