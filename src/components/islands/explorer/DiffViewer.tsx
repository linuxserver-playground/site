import * as React from 'react';
import type { Arch, Diff, EcosystemDiff, PackageChange } from '@/lib/hub';
import { fmtBytes, fmtDelta } from '@/lib/explorer';
import ArchToggle from './ArchToggle';

interface Props {
  diff: Diff;
  /** Link to the previous build's page on this site, when the hub still holds it. */
  previousUrl?: string;
}

const KINDS: { key: keyof EcosystemDiff; label: string; sign: string; tone: string }[] = [
  { key: 'added', label: 'added', sign: '+', tone: 'text-[var(--raft-ok)]' },
  { key: 'removed', label: 'removed', sign: '−', tone: 'text-[var(--raft-danger)]' },
  { key: 'upgraded', label: 'upgraded', sign: '↑', tone: 'text-foreground' },
  { key: 'downgraded', label: 'downgraded', sign: '↓', tone: 'text-[var(--raft-violet)]' },
];

function change(p: PackageChange, kind: keyof EcosystemDiff) {
  if (kind === 'added' || kind === 'removed') return p.version ?? '';
  return `${p.from ?? '?'} → ${p.to ?? '?'}`;
}

function DockerfileDiff({ text }: { text: string }) {
  return (
    <pre className="overflow-x-auto bg-[var(--raft-code-bg)] p-3 font-mono text-xs leading-5" tabIndex={0} aria-label="Dockerfile unified diff">
      <code>
        {text.split('\n').map((l, i) => {
          const cls = l.startsWith('+') && !l.startsWith('+++') ? 'bg-[var(--raft-ok)]/10 text-[var(--raft-ok)]' : l.startsWith('-') && !l.startsWith('---') ? 'bg-[var(--raft-danger)]/10 text-[var(--raft-danger)]' : l.startsWith('@@') ? 'text-[var(--raft-violet)]' : 'text-muted-foreground';
          return (
            <span key={i} className={`block ${cls}`}>
              {l || ' '}
            </span>
          );
        })}
      </code>
    </pre>
  );
}

/**
 * What changed versus the previous build of the branch: packages by ecosystem per architecture, image
 * config (env, ports, volumes), base digest, compressed size and the Dockerfile. Entirely static data from
 * the snapshot; the only interaction is the architecture switch and expanding lists.
 */
export default function DiffViewer({ diff, previousUrl }: Props) {
  const arches = Object.keys(diff.size) as Arch[];
  const pkgArches = Object.keys(diff.packages ?? {}) as Arch[];
  const [arch, setArch] = React.useState<Arch>(pkgArches[0] ?? arches[0] ?? 'amd64');
  const eco = diff.packages?.[arch] ?? {};
  const ecoNames = Object.keys(eco).sort((a, b) => countAll(eco[b]) - countAll(eco[a]) || a.localeCompare(b));
  const cfg = diff.config;
  const cfgEmpty = !cfg.env.added.length && !cfg.env.removed.length && !cfg.env.changed.length && !cfg.exposed_ports.added.length && !cfg.exposed_ports.removed.length && !cfg.volumes.added.length && !cfg.volumes.removed.length;
  const dfChanged = Object.values(diff.dockerfile).some(Boolean);
  const t = diff.totals;

  if (diff.classification === 'initial') {
    return (
      <div className="px-4 py-6 text-sm text-muted-foreground">
        <p>This is the first build of the {diff.branch} branch the hub has seen, so there is nothing to compare it with.</p>
        {diff.reasons.length > 0 && <p className="mt-1 font-mono text-xs">{diff.reasons.join('; ')}</p>}
      </div>
    );
  }

  return (
    <div className="divide-y divide-[var(--raft-hair)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="text-sm">
          <p>
            Compared with{' '}
            {previousUrl ? (
              <a href={previousUrl} className="font-mono text-foreground underline-offset-4 hover:text-primary hover:underline">
                {diff.previous_tag}
              </a>
            ) : (
              <span className="font-mono text-foreground">{diff.previous_tag}</span>
            )}
            , the build before it on <span className="font-mono">{diff.branch}</span>.
          </p>
          {diff.reasons.length > 0 && <p className="mt-1 text-xs text-muted-foreground">{diff.reasons.join('; ')}</p>}
        </div>
        <dl className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
          {KINDS.map((k) => (
            <div key={k.key} className="flex items-baseline gap-1">
              <dd className={`${k.tone} tabular-nums`}>
                {k.sign}
                {t[k.key]}
              </dd>
              <dt className="text-muted-foreground">{k.label}</dt>
            </div>
          ))}
        </dl>
      </div>

      <dl className="grid grid-cols-1 gap-px bg-[var(--raft-hair)] sm:grid-cols-3">
        <div className="bg-card p-4">
          <dt className="raft-eyebrow">Upstream version</dt>
          <dd className="mt-1.5 font-mono text-sm">
            {diff.upstream.changed ? (
              <>
                <span className="text-muted-foreground">{diff.upstream.from ?? '?'}</span> → <span className="text-foreground">{diff.upstream.to}</span>
              </>
            ) : (
              <span className="text-muted-foreground">unchanged · {diff.upstream.to}</span>
            )}
          </dd>
        </div>
        <div className="bg-card p-4">
          <dt className="raft-eyebrow">Base image</dt>
          <dd className="mt-1.5 font-mono text-xs break-all">
            {diff.base.changed ? (
              <>
                <span className="block text-muted-foreground">{diff.base.from?.image} @ {diff.base.from?.digest?.slice(7, 19)}</span>
                <span className="block">
                  → {diff.base.to.image} @ {diff.base.to.digest?.slice(7, 19)}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">unchanged · {diff.base.to.image}</span>
            )}
          </dd>
        </div>
        <div className="bg-card p-4">
          <dt className="raft-eyebrow">Compressed size</dt>
          <dd className="mt-1.5 space-y-0.5 font-mono text-xs">
            {arches.map((a) => {
              const s = diff.size[a];
              return (
                <span key={a} className="block tabular-nums">
                  <span className="inline-block w-12 text-muted-foreground">{a}</span>
                  {fmtBytes(s.to)} <span className={s.delta && s.delta > 0 ? 'text-primary' : s.delta && s.delta < 0 ? 'text-[var(--raft-ok)]' : 'text-muted-foreground'}>({fmtDelta(s.delta)})</span>
                </span>
              );
            })}
          </dd>
        </div>
      </dl>

      <section className="p-4" aria-labelledby="diff-packages">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="diff-packages" className="raft-eyebrow">
            Packages
          </h3>
          <ArchToggle arches={pkgArches.length ? pkgArches : arches} value={arch} onChange={setArch} />
        </div>
        {diff.packages == null ? (
          <p className="mt-2 text-sm text-muted-foreground">The previous build's package table was not available, so packages could not be compared.</p>
        ) : ecoNames.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No package changed on {arch}.</p>
        ) : (
          <div className="mt-3 space-y-4">
            {ecoNames.map((name) => {
              const e = eco[name];
              const n = countAll(e);
              if (!n) return null;
              return (
                <div key={name}>
                  <h4 className="font-mono text-xs text-muted-foreground">
                    {name} · {n} change{n === 1 ? '' : 's'}
                  </h4>
                  <ul className="mt-1.5 grid grid-cols-1 gap-x-6 gap-y-1 md:grid-cols-2">
                    {KINDS.flatMap((k) =>
                      e[k.key].slice(0, 200).map((p) => (
                        <li key={`${k.key}:${p.name}`} className="flex items-baseline gap-2 font-mono text-xs">
                          <span className={`w-3 shrink-0 ${k.tone}`} aria-hidden="true">
                            {k.sign}
                          </span>
                          <span className="sr-only">{k.label}</span>
                          <span className="min-w-0 truncate text-foreground" title={p.purl ?? undefined}>
                            {p.name}
                          </span>
                          <span className="ml-auto shrink-0 text-muted-foreground">{change(p, k.key)}</span>
                        </li>
                      )),
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="p-4" aria-labelledby="diff-config">
        <h3 id="diff-config" className="raft-eyebrow">
          Image config
        </h3>
        {cfgEmpty ? (
          <p className="mt-2 text-sm text-muted-foreground">Environment, exposed ports and volumes are unchanged.</p>
        ) : (
          <ul className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 font-mono text-xs md:grid-cols-2">
            {cfg.env.added.map((x) => <Row key={`e+${x}`} sign="+" tone="text-[var(--raft-ok)]" label="env" value={x} />)}
            {cfg.env.removed.map((x) => <Row key={`e-${x}`} sign="−" tone="text-[var(--raft-danger)]" label="env" value={x} />)}
            {cfg.env.changed.map((x) => <Row key={`e~${x.name}`} sign="~" tone="text-foreground" label="env" value={`${x.name}: ${x.from ?? ''} → ${x.to ?? ''}`} />)}
            {cfg.exposed_ports.added.map((x) => <Row key={`p+${x}`} sign="+" tone="text-[var(--raft-ok)]" label="port" value={x} />)}
            {cfg.exposed_ports.removed.map((x) => <Row key={`p-${x}`} sign="−" tone="text-[var(--raft-danger)]" label="port" value={x} />)}
            {cfg.volumes.added.map((x) => <Row key={`v+${x}`} sign="+" tone="text-[var(--raft-ok)]" label="volume" value={x} />)}
            {cfg.volumes.removed.map((x) => <Row key={`v-${x}`} sign="−" tone="text-[var(--raft-danger)]" label="volume" value={x} />)}
          </ul>
        )}
      </section>

      <section aria-labelledby="diff-dockerfile">
        <h3 id="diff-dockerfile" className="raft-eyebrow px-4 pt-4">
          Dockerfile
        </h3>
        {!dfChanged ? (
          <p className="px-4 pt-2 pb-4 text-sm text-muted-foreground">Unchanged.</p>
        ) : (
          <div className="mt-2 divide-y divide-[var(--raft-hair)]">
            {Object.entries(diff.dockerfile)
              .filter(([, d]) => d)
              .map(([a, d]) => (
                <details key={a} open={a === arch}>
                  <summary className="cursor-pointer px-4 py-2 font-mono text-xs text-muted-foreground hover:text-foreground">
                    Dockerfile{a === 'arm64' ? '.aarch64' : ''} ({a})
                  </summary>
                  <DockerfileDiff text={d} />
                </details>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Row({ sign, tone, label, value }: { sign: string; tone: string; label: string; value: string }) {
  return (
    <li className="flex items-baseline gap-2">
      <span className={`w-3 shrink-0 ${tone}`} aria-hidden="true">
        {sign}
      </span>
      <span className="sr-only">{sign === '+' ? 'added' : sign === '−' ? 'removed' : 'changed'}</span>
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 break-all">{value}</span>
    </li>
  );
}

const countAll = (e: EcosystemDiff | undefined) => (e ? e.added.length + e.removed.length + e.upgraded.length + e.downgraded.length : 0);
