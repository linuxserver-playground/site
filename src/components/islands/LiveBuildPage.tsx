/**
 * A build page for a build newer than the site, rendered in the browser from the hub's API. GitHub Pages
 * answers an unknown /images/<name>/builds/<tag>/ with the site's 404 page, which mounts this: when the path is a
 * build of an image the site knows, it reads the build's documents from the hub and renders the same parts the
 * static build page renders (components/build/BuildParts.tsx), so a release is on the website as soon as the
 * hub has it, without waiting for the site to rebuild. The next site build makes it a static page, with its release
 * notes rendered (here they are plain text: the renderer and its sanitiser run at build time only).
 */
import * as React from 'react';
import { withBase, BASE } from '@/lib/base';
import { buildUrl } from '@/lib/build-helpers';
import { buildPage, type BuildPageImage } from '@/lib/build-page';
import type { BuildRecord } from '@/lib/builds';
import { hubApi, hubTestsUrl, hubVulnsUrl, type Bundle, type BuildsData, type Diff, type HistoryEntry, type Layer, type TestsData } from '@/lib/hub';
import { AnchorHeading, BuildHeader, BuildRecordSection, CiHeading, NotesAndData } from '@/components/build/BuildParts';
import CopyButton from '@/components/islands/CopyButton';
import CiReport from '@/components/islands/explorer/CiReport';
import DiffViewer from '@/components/islands/explorer/DiffViewer';
import DockerfileView from '@/components/islands/explorer/DockerfileView';
import Explorer from '@/components/islands/explorer/Explorer';
import InitGraph from '@/components/islands/explorer/InitGraph';
import Vulns from '@/components/islands/explorer/Vulns';

export interface LiveImage extends BuildPageImage {
  /** The logo as the site serves it, or null for the monogram. */
  logo: string | null;
}

type State =
  | { kind: 'idle' }
  | { kind: 'loading'; name: string; tag: string }
  | { kind: 'missing'; name: string; tag: string }
  /** A release the hub no longer holds (older than the newest five of its branch): it has no page, only its Release. */
  | { kind: 'rotated'; name: string; tag: string; entry: HistoryEntry }
  | { kind: 'error'; name: string; tag: string }
  | { kind: 'ready'; image: LiveImage; record: BuildRecord; builds: BuildsData };

/** `/images/<name>/builds/<tag>/` (after the base path) to its parts, or null for any other path. */
export function buildPath(pathname: string): { name: string; tag: string } | null {
  const path = BASE && pathname.startsWith(`${BASE}/`) ? pathname.slice(BASE.length) : pathname;
  const m = path.match(/^\/images\/([^/]+)\/builds\/([^/]+)\/?$/);
  return m ? { name: decodeURIComponent(m[1]), tag: decodeURIComponent(m[2]) } : null;
}

async function hubJSON<T>(path: string, signal: AbortSignal): Promise<T | null> {
  const res = await fetch(hubApi(path), { signal, mode: 'cors' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${res.status} for ${path}`);
  return ((await res.json()) as { data: T }).data;
}

function Logo({ image }: { image: LiveImage }) {
  if (image.logo) return <img src={image.logo} alt="" width={44} height={44} className="size-11 object-contain" />;
  let hue = 0;
  for (const c of image.name) hue = (hue * 31 + c.charCodeAt(0)) % 360;
  return (
    <span
      aria-hidden="true"
      className="grid size-11 place-items-center rounded-[22%] font-semibold text-white uppercase"
      style={{ fontSize: 18, background: `linear-gradient(135deg,oklch(0.62 0.17 ${hue}),oklch(0.45 0.17 ${(hue + 40) % 360}))` }}
    >
      {image.name.slice(0, 1)}
    </span>
  );
}

export default function LiveBuildPage({ images, notFoundId }: { images: Record<string, LiveImage>; notFoundId: string }) {
  const [state, setState] = React.useState<State>({ kind: 'idle' });
  const [attempt, setAttempt] = React.useState(0);

  React.useEffect(() => {
    const where = buildPath(location.pathname);
    const image = where ? images[where.name] : undefined;
    if (!where || !image) return;
    document.getElementById(notFoundId)?.setAttribute('hidden', '');
    setState({ kind: 'loading', ...where });
    const ctrl = new AbortController();
    const base = `catalog/${where.name}/builds/${where.tag}`;
    (async () => {
      const [build, builds, diff, tests] = await Promise.all([
        hubJSON<{ build: Bundle }>(`${base}.json`, ctrl.signal),
        hubJSON<BuildsData>(`catalog/${where.name}/builds.json`, ctrl.signal),
        hubJSON<{ diff: Diff }>(`${base}/diff.json`, ctrl.signal).catch(() => null),
        hubJSON<TestsData>(`${base}/tests.json`, ctrl.signal).catch(() => null),
      ]);
      if (!build) {
        const entry = Object.values(builds?.history ?? {})
          .flat()
          .find((h) => h.tag === where.tag);
        return setState(entry ? { kind: 'rotated', ...where, entry } : { kind: 'missing', ...where });
      }
      const b = build.build;
      const arches = b.platforms.filter((p) => p.result === 'success').map((p) => p.arch);
      const layers = await Promise.all(arches.map((a) => hubJSON<{ layers: Layer[] }>(`${base}/layers.${a}.json`, ctrl.signal).catch(() => null)));
      const record: BuildRecord = {
        build: b,
        diff: diff?.diff ?? null,
        layers: Object.fromEntries(arches.flatMap((a, i) => (layers[i] ? [[a, layers[i]!.layers]] : []))),
        tests,
      };
      document.title = document.title.replace(/^[^|·—-]+/, `${image.name} ${b.version.tag} `);
      setState({ kind: 'ready', image, record, builds: builds ?? { image: where.name, builds: [], history: {} } });
    })().catch((e) => {
      if ((e as Error).name !== 'AbortError') setState({ kind: 'error', ...where });
    });
    return () => ctrl.abort();
  }, [images, notFoundId, attempt]);

  if (state.kind === 'idle') return null;
  if (state.kind !== 'ready') {
    const image = images[state.name];
    return (
      <section className="raft-container py-16" aria-live="polite">
        <p className="font-mono text-sm text-muted-foreground">
          <a href={withBase(image.url)} className="hover:text-foreground">
            {image.name}
          </a>{' '}
          · build
        </p>
        <h1 className="mt-2 font-mono text-3xl font-semibold tracking-tight">{state.tag}</h1>
        {state.kind === 'loading' && <p className="mt-6 text-sm text-muted-foreground">Loading this build from the hub…</p>}
        {state.kind === 'missing' && (
          <p className="mt-6 max-w-xl text-sm text-muted-foreground">
            The hub does not have this build. A release reaches the hub a minute or two after its run finishes, so if it was just released, check again shortly; otherwise see{' '}
            <a href={withBase(`${image.url}#builds`)} className="underline underline-offset-4 hover:text-foreground">
              the image&apos;s builds
            </a>
            .
          </p>
        )}
        {state.kind === 'rotated' && (
          <div className="mt-6 max-w-xl space-y-3 text-sm text-muted-foreground">
            <p>
              This release is older than the newest five builds of its branch, which are the ones with a page here. Its record stays on GitHub:
            </p>
            <ul className="space-y-1 font-mono text-xs">
              {state.entry.release_url && (
                <li>
                  <a href={state.entry.release_url} className="underline underline-offset-4 hover:text-foreground">
                    The release on GitHub
                  </a>
                </li>
              )}
              {state.entry.run_json && (
                <li>
                  <a href={state.entry.run_json} className="underline underline-offset-4 hover:text-foreground">
                    run.json
                  </a>{' '}
                  (the run's record, for releases since it was attached)
                </li>
              )}
              {state.entry.run_url && (
                <li>
                  <a href={state.entry.run_url} className="underline underline-offset-4 hover:text-foreground">
                    The run on GitHub
                  </a>
                </li>
              )}
            </ul>
            <p>
              <a href={withBase(`${images[state.name].url}#builds`)} className="underline underline-offset-4 hover:text-foreground">
                The image&apos;s builds
              </a>{' '}
              lists the newer ones.
            </p>
          </div>
        )}
        {state.kind === 'error' && (
          <p className="mt-6 text-sm text-muted-foreground">
            The hub could not be reached.{' '}
            <button type="button" onClick={() => setAttempt((n) => n + 1)} className="underline underline-offset-4 hover:text-foreground">
              Try again
            </button>
          </p>
        )}
        {state.kind !== 'loading' && state.kind !== 'rotated' && (
          <p className="mt-4 text-sm">
            <button type="button" onClick={() => setAttempt((n) => n + 1)} className="font-medium underline underline-offset-4 hover:text-primary">
              Check again
            </button>
          </p>
        )}
      </section>
    );
  }

  const { image, record, builds } = state;
  const page = buildPage(image, record, builds.builds);
  const { b, tag, prev, arches } = page;
  const units = b.init_graph?.units ?? [];
  return (
    <>
      <BuildHeader page={page} now={new Date()} logo={<Logo image={image} />} copy={<CopyButton text={page.pull} label="Copy docker pull command" variant="secondary" />} />
      <div className="raft-container mt-10 space-y-12">
        <BuildRecordSection page={page} />
        <section aria-labelledby="ci" id="ci-section">
          <CiHeading page={page} />
          <div className="raft-panel mt-4 overflow-hidden">
            <CiReport image={image.name} tag={tag} tests={record.tests ?? null} testEnabled={b.test.enabled} reportDir={page.reportDir} runJson={page.runJson} logsZip={page.logsZip} testsUrl={hubTestsUrl(image.name, tag)} runUrl={b.workflow.run_url} controlUrl={page.controlBuild} />
          </div>
        </section>
        <Vulns url={hubVulnsUrl(image.name, tag)} image={image.name} tag={tag} />
        <section aria-labelledby="explorer">
          <AnchorHeading id="explorer">Explore the image</AnchorHeading>
          <p className="mt-2 text-sm text-muted-foreground">Every file and package in the image.</p>
          <div className="raft-panel mt-4 overflow-hidden">
            <Explorer
              image={image.name}
              tag={tag}
              arches={arches}
              filesUrls={page.filesUrls}
              packagesUrls={page.packagesUrls}
              sbomUrls={page.sbomUrls}
              packagesSummary={page.packagesSummary}
              layers={record.layers}
              config={b.config}
              labels={b.labels}
              packagesBase={withBase('/packages/')}
            />
          </div>
        </section>
        <section aria-labelledby="diff">
          <AnchorHeading id="diff">Changes since the previous build</AnchorHeading>
          <div className="raft-panel mt-4 overflow-hidden">
            {record.diff ? <DiffViewer diff={record.diff} previousUrl={prev ? withBase(buildUrl(image.name, prev.tag)) : undefined} /> : <p className="px-4 py-6 text-sm text-muted-foreground">No diff for this build.</p>}
          </div>
        </section>
        <section aria-labelledby="dockerfile">
          <AnchorHeading id="dockerfile">Dockerfile, annotated</AnchorHeading>
          <p className="mt-2 text-sm text-muted-foreground">Each instruction shows the compressed and on-disk size of the layer it produced.</p>
          <div className="raft-panel mt-4 overflow-hidden">
            <DockerfileView dockerfile={b.dockerfile} layers={record.layers} base={b.base.image} layersUrls={page.layersUrls} initialArch={arches[0]} />
          </div>
        </section>
        {units.length > 0 && (
          <section aria-labelledby="init">
            <AnchorHeading id="init">Init graph</AnchorHeading>
            <p className="mt-2 text-sm text-muted-foreground">The s6-rc units that run when the container starts. Select a unit for its dependencies and run script.</p>
            <div className="raft-panel mt-4 overflow-hidden">
              <InitGraph units={units} image={image.name} />
            </div>
          </section>
        )}
        {/* The notes renderer runs at build time only; until the site rebuilds, the notes show as plain text. */}
        <NotesAndData page={page} dataAsOf={{ label: 'Live from the hub', date: new Date() }} />
      </div>
    </>
  );
}
