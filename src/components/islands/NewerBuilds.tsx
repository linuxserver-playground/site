/**
 * Builds the hub has that this page was built without: the site rebuilds a few minutes after each hub deploy,
 * and until then this lists the newer builds above the snapshot's table, linking their pages (which the site
 * renders from the hub until they are static). Renders nothing when the snapshot is current or the hub is out
 * of reach.
 */
import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import { buildResult, reasonLabel } from '@/lib/build-helpers';
import { formatDate } from '@/lib/format';
import { hubApi, type BuildSummary, type BuildsData } from '@/lib/hub';

export default function NewerBuilds({ image, known, buildsBase }: { image: string; known: string[]; buildsBase: string }) {
  const [newer, setNewer] = React.useState<BuildSummary[]>([]);

  React.useEffect(() => {
    const ctrl = new AbortController();
    fetch(hubApi(`catalog/${image}/builds.json`), { signal: ctrl.signal, mode: 'cors' })
      .then((r) => (r.ok ? (r.json() as Promise<{ data: BuildsData }>) : null))
      .then((j) => {
        const seen = new Set(known);
        setNewer((j?.data.builds ?? []).filter((b) => !seen.has(b.tag)));
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [image, known]);

  if (!newer.length) return null;
  return (
    <div className="raft-panel mt-4 border-primary/40 p-4" role="status">
      <p className="text-sm font-medium">
        {newer.length === 1 ? 'A newer build is out' : `${newer.length} newer builds are out`} since this page was built:
      </p>
      <ul className="mt-2 space-y-1.5">
        {newer.map((b) => (
          <li key={b.tag} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <a href={`${buildsBase}${b.tag}/`} className="inline-flex items-center gap-1 font-mono text-[0.8125rem] underline-offset-4 hover:text-primary hover:underline">
              {b.tag} <ArrowRight className="size-3.5" aria-hidden="true" />
            </a>
            <span className="font-mono text-xs text-muted-foreground">
              {b.branch} · {formatDate(b.created)} · {reasonLabel(b.reason)} · {buildResult(b)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
