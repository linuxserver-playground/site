/**
 * The fleet panel on an image page: this image's live branches from `/api/images/{name}.json` (last
 * build, released tag, upstream and drift, next check, skip flags) over the hub snapshot's facts, which
 * are server-rendered first and stay when the control plane is unreachable. Members get the dispatch,
 * package-check and skip controls inline.
 */
import { useControl, type ImagePage } from '@/lib/control';
import { ActionButton, BranchActions, CookieNotice, DriftPill, ExtLink, LiveDot, MemberOnly, Pill, Rel, SkipControls, StatePill, Table, TD, TH } from './shared';

export interface SnapshotBranch {
  branch: string;
  release_tag: string;
  tag: string | null;
  upstream: string | null;
  created: string | null;
  test_success: boolean | null;
}

interface Props {
  image: string;
  /** The hub's view of each live branch, rendered before the control plane answers. */
  snapshot: SnapshotBranch[];
  /** `withBase('/fleet/runs/')` */
  runsBase: string;
  /** `withBase('/images/<name>/builds/')` and the tags the site has pages for. */
  buildsBase: string;
  knownTags: string[];
  fallback: string;
}

export default function ImageFleet({ image, snapshot, runsBase, buildsBase, knownTags, fallback }: Props) {
  const { data, error, loading, at, reload } = useControl<ImagePage>(`images/${image}.json`, ['builds', 'runs', 'manifests', 'skips', 'scheduler_decisions', 'releases']);
  const rows = data?.rows.filter((r) => !r.archived) ?? [];
  const live = !!data;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-[var(--raft-hair)] bg-[var(--raft-surface)] px-3.5 py-2">
        <p className="font-mono text-xs">
          live branches
          <span className="ml-2 text-[0.6875rem] text-muted-foreground">
            {live ? `${rows.length}` : loading ? 'loading…' : 'snapshot'}
            {data && (data.open_pulls > 0 || data.open_issues > 0) && ` · ${data.open_pulls} open PRs · ${data.open_issues} open issues`}
          </span>
        </p>
        <div className="flex items-center gap-2">
          <MemberOnly>{(me) => <ActionButton action="skip" body={{ scope: image }} csrf={me.csrf} label="skip whole image" size="xs" tone="danger" confirm={`Set a skip flag on every branch of ${image}?`} fields={[{ name: 'reason', label: 'reason', required: true, placeholder: 'why' }]} onDone={reload} />}</MemberOnly>
          {live && <LiveDot at={at} />}
        </div>
      </div>
      <div className="px-3.5 pt-2">
        <CookieNotice />
      </div>
      {error && !live && (
        <p role="status" className="border-b border-[var(--raft-hair)] px-3.5 py-2 text-xs text-muted-foreground">
          Live status is unavailable ({error.replace(/\.$/, '')}); showing the last snapshot.{' '}
          <button type="button" onClick={reload} className="underline underline-offset-4 hover:text-foreground">
            Try again
          </button>
          {' · '}
          <ExtLink href={fallback}>status page</ExtLink>
        </p>
      )}
      <Table label={`Live branches of ${image}`}>
        <thead className="border-b border-[var(--raft-hair)]">
          <tr>
            <TH>Branch → tag</TH>
            <TH>Last build</TH>
            <TH>Released</TH>
            <TH>Upstream</TH>
            <TH>Drift</TH>
            <TH>Next check</TH>
            <TH>Flags</TH>
            {live && <MemberOnly>{() => <TH>Actions</TH>}</MemberOnly>}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--raft-hair)]">
          {live
            ? rows.map((r) => {
                const scope = `${image}/${r.branch}`;
                const page = r.released && knownTags.includes(r.released) ? `${buildsBase}${r.released}/` : null;
                return (
                  <tr key={r.branch} className={r.result === 'failure' ? 'bg-destructive/[0.04]' : undefined}>
                    <th scope="row" className="px-3 py-2.5 align-top font-mono text-xs font-normal">
                      {r.branch}
                      {r.version_tag && <span className="block text-[0.6875rem] text-muted-foreground">{r.version_tag}</span>}
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
                    <TD mono>
                      {r.released ? (
                        page ? (
                          <a href={page} className="underline-offset-4 hover:text-primary hover:underline">
                            {r.released}
                          </a>
                        ) : (
                          r.released
                        )
                      ) : (
                        <span className="text-muted-foreground">nothing yet</span>
                      )}
                      {r.released_at && (
                        <span className="block text-[0.6875rem] text-muted-foreground">
                          <Rel iso={r.released_at} />
                        </span>
                      )}
                    </TD>
                    <TD mono>
                      {r.upstream ?? '–'}
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
                            skip {s === image ? 'image' : s.slice(image.length + 1)}
                          </Pill>
                        ))}
                        {!r.package_check && (
                          <Pill tone="muted" dot={false}>
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
                          </span>
                        </TD>
                      )}
                    </MemberOnly>
                  </tr>
                );
              })
            : snapshot.map((s) => {
                const page = s.tag && knownTags.includes(s.tag) ? `${buildsBase}${s.tag}/` : null;
                return (
                  <tr key={s.branch}>
                    <th scope="row" className="px-3 py-2.5 align-top font-mono text-xs font-normal">
                      {s.branch} <span className="text-muted-foreground">→ :{s.release_tag}</span>
                    </th>
                    <TD>
                      <span className="flex flex-wrap items-center gap-1.5">
                        {s.tag ? <StatePill status="completed" conclusion={s.test_success === false ? 'failure' : 'success'} /> : <StatePill status={null} />}
                        <Rel iso={s.created} className="font-mono text-xs text-muted-foreground" />
                      </span>
                    </TD>
                    <TD mono>
                      {s.tag ? (
                        page ? (
                          <a href={page} className="underline-offset-4 hover:text-primary hover:underline">
                            {s.tag}
                          </a>
                        ) : (
                          s.tag
                        )
                      ) : (
                        <span className="text-muted-foreground">nothing yet</span>
                      )}
                    </TD>
                    <TD mono>{s.upstream ?? '–'}</TD>
                    <TD>
                      <DriftPill drift="unknown" />
                    </TD>
                    <TD mono>
                      <span className="text-muted-foreground">–</span>
                    </TD>
                    <TD>
                      <span className="text-muted-foreground">–</span>
                    </TD>
                  </tr>
                );
              })}
          {live && rows.length === 0 && (
            <tr>
              <td colSpan={8} className="px-3 py-6 text-center text-sm text-muted-foreground">
                No live branches yet.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
