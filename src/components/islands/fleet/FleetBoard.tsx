/**
 * The fleet board: one row per image × live branch from `/api/fleet.json`, refreshed on the control
 * plane's `builds`, `runs`, `manifests`, `skips` and `scheduler_decisions` events. Filters: failures
 * first, drift, one image, free text. Members get dispatch, package check and skip controls per row.
 * Helper repos (docker-* repos that are not images, such as docker-mods) follow in their own list and never
 * link an image page.
 */
import * as React from 'react';
import { repoShort, useControl, type FleetPage, type FleetRow, type HelperRepo } from '@/lib/control';
import { ActionButton, BranchActions, DriftPill, Empty, ExtLink, MemberOnly, Offline, PanelBar, Pill, Rel, Select, Skeleton, SkipControls, StatePill, Table, TD, TH, Toggle } from './shared';

interface Props {
  /** `withBase('/images/')`: image names link to their pages when the site has one. */
  imagesBase: string;
  /** Images the site has a page for. */
  known: string[];
  /** `withBase('/fleet/runs/')` */
  runsBase: string;
  /** `withBase('/mods/')`: the docker-mods helper repo links the mods index. */
  modsBase: string;
  fallback: string;
}

const severity = (r: FleetRow) => (r.result === 'failure' ? 0 : r.result === 'cancelled' ? 1 : r.result === null ? 2 : r.drift === 'ahead' ? 3 : 4);

export default function FleetBoard({ imagesBase, known, runsBase, modsBase, fallback }: Props) {
  const { data, error, loading, at, reload } = useControl<FleetPage>('fleet.json', ['builds', 'runs', 'manifests', 'skips', 'scheduler_decisions', 'repos']);
  const [redFirst, setRedFirst] = React.useState(true);
  const [drift, setDrift] = React.useState('all');
  const [image, setImage] = React.useState('all');
  const [q, setQ] = React.useState('');
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    // ?image= filters the board to one image (image pages link here).
    setImage(new URL(location.href).searchParams.get('image') || 'all');
    setReady(true);
  }, []);

  const rows = React.useMemo(() => {
    if (!data) return [];
    let list = data.rows.filter((r) => !r.archived);
    if (image !== 'all') list = list.filter((r) => r.image === image);
    if (drift !== 'all') list = list.filter((r) => r.drift === drift);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((r) => `${r.image} ${r.branch} ${r.released ?? ''} ${r.upstream ?? ''} ${r.reason ?? ''}`.toLowerCase().includes(needle));
    }
    list = [...list].sort((a, b) => (redFirst ? severity(a) - severity(b) : 0) || a.image.localeCompare(b.image) || (a.default_branch ? -1 : b.default_branch ? 1 : a.branch.localeCompare(b.branch)));
    return list;
  }, [data, image, drift, q, redFirst]);

  const images = React.useMemo(() => [...new Set((data?.rows ?? []).map((r) => r.image))].sort(), [data]);
  const failing = data ? data.rows.filter((r) => r.result === 'failure').length : 0;
  const ahead = data ? data.rows.filter((r) => r.drift === 'ahead').length : 0;

  React.useEffect(() => {
    // Keep ?image= in the URL so the filter can be linked.
    if (!ready) return;
    const url = new URL(location.href);
    if (image === 'all') url.searchParams.delete('image');
    else url.searchParams.set('image', image);
    history.replaceState(null, '', url);
  }, [image, ready]);

  return (
    <div>
      <PanelBar title="fleet board" note={data ? `${data.rows.length} branches · ${data.images} images · ${failing} failing · ${ahead} behind upstream` : undefined} at={at}>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter…"
          aria-label="Filter rows"
          className="h-8 w-32 rounded-md border border-[var(--raft-hair-strong)] bg-background px-2 font-mono text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:w-40"
        />
        <Select label="image" value={image} onChange={setImage} options={[{ value: 'all', label: 'all' }, ...images.map((i) => ({ value: i, label: i }))]} />
        <Select
          label="drift"
          value={drift}
          onChange={setDrift}
          options={[
            { value: 'all', label: 'all' },
            { value: 'ahead', label: 'ahead' },
            { value: 'same', label: 'same' },
            { value: 'unknown', label: 'unknown' },
          ]}
        />
        <Toggle label="red first" checked={redFirst} onChange={setRedFirst} />
      </PanelBar>

      {!data && loading && <Skeleton rows={6} />}
      {!data && !loading && error && <Offline error={error} retry={reload} fallback={{ label: 'Open the board on the control plane', href: fallback }} />}
      {data && (
        <>
          {error && (
            <p role="status" className="border-b border-[var(--raft-hair)] bg-[var(--raft-amber)]/10 px-3.5 py-1.5 font-mono text-[0.6875rem] text-foreground">
              Showing the last good data: {error}
            </p>
          )}
          {rows.length === 0 ? (
            <Empty>No branch matches these filters.</Empty>
          ) : (
            <Table label="Fleet board">
              <thead className="border-b border-[var(--raft-hair)]">
                <tr>
                  <TH>Image · branch</TH>
                  <TH>Last build</TH>
                  <TH>Released</TH>
                  <TH>Upstream</TH>
                  <TH>Drift</TH>
                  <TH>Next check</TH>
                  <TH>Flags</TH>
                  <MemberOnly>{() => <TH>Actions</TH>}</MemberOnly>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--raft-hair)]">
                {rows.map((r) => (
                  <Row key={`${r.repo}/${r.branch}`} r={r} imagesBase={imagesBase} known={known} runsBase={runsBase} reload={reload} />
                ))}
              </tbody>
            </Table>
          )}
          {(data.helpers ?? []).filter((h) => !h.archived).length > 0 && <Helpers helpers={(data.helpers ?? []).filter((h) => !h.archived)} modsBase={modsBase} />}
        </>
      )}
    </div>
  );
}

/** Repos named docker-* that are not images: how their branch builds stand, linking GitHub (and the mods index). */
function Helpers({ helpers, modsBase }: { helpers: HelperRepo[]; modsBase: string }) {
  return (
    <section aria-label="Helper repositories" className="border-t border-[var(--raft-hair)]">
      <h3 className="raft-eyebrow px-3.5 pt-3">helper repositories · not images</h3>
      <ul className="divide-y divide-[var(--raft-hair)]">
        {helpers.map((h) => (
          <li key={h.repo} className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-3.5 py-2.5 text-sm">
            <ExtLink href={`https://github.com/${h.repo}`} className="font-mono font-medium">
              {h.name}
            </ExtLink>
            <span className="font-mono text-xs text-muted-foreground">
              {h.branches} branch{h.branches === 1 ? '' : 'es'} built
            </span>
            <Pill tone="ok">{h.success} passing</Pill>
            {h.running > 0 && <Pill tone="live">{h.running} running</Pill>}
            {h.failing.length > 0 ? (
              <span className="flex flex-wrap items-center gap-1.5 text-xs">
                <Pill tone="bad">{h.failing.length} failing</Pill>
                {h.failing.map((b) => (
                  <ExtLink key={b} href={`https://github.com/${h.repo}/actions?query=${encodeURIComponent(`branch:${b}`)}`} className="font-mono text-muted-foreground">
                    {b}
                  </ExtLink>
                ))}
              </span>
            ) : null}
            {h.last_run_at && (
              <span className="font-mono text-xs text-muted-foreground">
                last build <Rel iso={h.last_run_at} />
              </span>
            )}
            {h.name === 'docker-mods' && (
              <a href={modsBase} className="ml-auto text-xs font-medium underline-offset-4 hover:text-primary hover:underline">
                Browse the mods
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Row({ r, imagesBase, known, runsBase, reload }: { r: FleetRow; imagesBase: string; known: string[]; runsBase: string; reload: () => void }) {
  const scope = `${r.image}/${r.branch}`;
  return (
    <tr className={r.result === 'failure' ? 'bg-destructive/[0.04]' : undefined}>
      <th scope="row" className="px-3 py-2.5 align-top font-normal">
        <span className="flex flex-wrap items-baseline gap-x-2">
          {known.includes(r.image) ? (
            <a href={`${imagesBase}${r.image}/#fleet`} className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline">
              {r.image}
            </a>
          ) : (
            <span className="font-medium">{r.image}</span>
          )}
          <span className="font-mono text-xs text-muted-foreground">
            {r.branch}
            {r.default_branch && <span className="sr-only"> (default branch)</span>}
          </span>
        </span>
        <span className="mt-0.5 block font-mono text-[0.6875rem] text-muted-foreground">
          <ExtLink href={`https://github.com/${r.repo}/tree/${r.branch}`} className="hover:text-foreground">
            {repoShort(r.repo)}
          </ExtLink>
        </span>
      </th>
      <TD>
        <span className="flex flex-wrap items-center gap-1.5">
          <StatePill status={r.result === null ? null : 'completed'} conclusion={r.result} />
          <Rel iso={r.built_at} className="font-mono text-xs text-muted-foreground" />
        </span>
        <span className="mt-0.5 block font-mono text-[0.6875rem] text-muted-foreground">
          {r.reason && <>{r.reason} · </>}
          {r.run_id && (
            <a href={`${runsBase}${r.run_id}/`} className="underline-offset-4 hover:text-foreground hover:underline">
              run #{r.run_id}
            </a>
          )}
        </span>
      </TD>
      <TD mono title={r.released_at ? `Released ${r.released_at}` : undefined}>
        {r.released ?? <span className="text-muted-foreground">nothing yet</span>}
        {r.released_at && (
          <span className="block text-[0.6875rem] text-muted-foreground">
            <Rel iso={r.released_at} />
          </span>
        )}
      </TD>
      <TD mono>
        {r.upstream ?? <span className="text-muted-foreground">–</span>}
        {r.source && <span className="block text-[0.6875rem] text-muted-foreground">{r.source}</span>}
      </TD>
      <TD>
        <DriftPill drift={r.drift} />
      </TD>
      <TD mono>
        <Rel iso={r.next_check} mode="until" />
        {r.last_outcome && (
          <span className="block text-[0.6875rem] text-muted-foreground">
            last: {r.last_outcome} <Rel iso={r.last_check} />
          </span>
        )}
      </TD>
      <TD>
        <span className="flex flex-wrap gap-1">
          {r.skip.map((s) => (
            <Pill key={s} tone="warn" dot={false} title={`Skip flag ${s}`}>
              skip {s === r.image ? 'image' : s.slice(r.image.length + 1)}
            </Pill>
          ))}
          {!r.package_check && (
            <Pill tone="muted" dot={false} title="build.package_check: false in image.yml">
              no pkg check
            </Pill>
          )}
          {r.skip.length === 0 && r.package_check && <span className="text-muted-foreground">–</span>}
        </span>
      </TD>
      <MemberOnly>
        {(me) => (
          <TD>
            <span className="flex flex-wrap gap-1">
              <BranchActions repo={r.repo} branch={r.branch} csrf={me.csrf} onDone={reload} packageCheck={r.package_check} />
              <SkipControls scope={scope} flags={r.skip} csrf={me.csrf} onDone={reload} />
              {r.run_id && r.result === null && <ActionButton action="cancel" body={{ run_id: r.run_id }} csrf={me.csrf} label="cancel" size="xs" tone="danger" confirm={`Cancel run #${r.run_id}?`} onDone={reload} />}
              {r.run_id && r.result === 'failure' && <ActionButton action="rerun" body={{ run_id: r.run_id }} csrf={me.csrf} label="re-run" size="xs" confirm={`Re-run the failed jobs of run #${r.run_id}?`} onDone={reload} />}
            </span>
          </TD>
        )}
      </MemberOnly>
    </tr>
  );
}
