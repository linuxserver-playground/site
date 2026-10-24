import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Arch, Bundle, Layer } from '@/lib/hub';
import Treemap from './Treemap';
import PackageBrowser from './PackageBrowser';

interface Props {
  image: string;
  tag: string;
  arches: Arch[];
  filesUrls: Partial<Record<Arch, string[]>>;
  packagesUrls: Partial<Record<Arch, string>>;
  packagesFallback: Partial<Record<Arch, string>>;
  packagesSummary: Partial<Record<Arch, { count: number; distro: string; by_type?: Record<string, number> | null }>>;
  layers: Partial<Record<Arch, Layer[]>>;
  config: Bundle['config'];
  labels: Record<string, string>;
  packagesBase: string;
}

/**
 * The explorer tabs at the bottom of a build page. The heavy views (file treemap, package table) fetch
 * their data from the hub only when their tab is first opened; the config tab is static. Every tab
 * server-renders a useful summary so the page reads without JavaScript.
 */
export default function Explorer(props: Props) {
  const [opened, setOpened] = React.useState<Set<string>>(() => new Set(['files']));
  const [tab, setTab] = React.useState('files');
  const open = (v: string) => {
    setTab(v);
    setOpened((s) => (s.has(v) ? s : new Set(s).add(v)));
  };
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);

  const fileCount = (a: Arch) => props.layers[a]?.length ?? 0;
  const pkgTotal = Object.values(props.packagesSummary)[0]?.count;

  return (
    <Tabs value={tab} onValueChange={open} className="gap-0">
      <div className="border-b border-[var(--raft-hair)] px-3 pt-3">
        <TabsList variant="line" aria-label="Explorer views" className="h-9">
          <TabsTrigger value="files" className="px-3 font-mono text-xs">
            Files
          </TabsTrigger>
          <TabsTrigger value="packages" className="px-3 font-mono text-xs">
            Packages{pkgTotal ? ` · ${pkgTotal.toLocaleString('en-GB')}` : ''}
          </TabsTrigger>
          <TabsTrigger value="config" className="px-3 font-mono text-xs">
            Config &amp; labels
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="files" forceMount className="data-[state=inactive]:hidden">
        {hydrated ? (
          <Treemap image={props.image} tag={props.tag} arches={props.arches} urls={props.filesUrls} layers={props.layers} />
        ) : (
          <div className="px-4 py-8 text-sm text-muted-foreground">
            <p>
              The file treemap needs JavaScript: it reads <span className="font-mono">files.&lt;arch&gt;.json.gz</span> from the hub and lays out every file by
              size and owning package. Without it, the layer table above and the file tables themselves are still available:
            </p>
            <ul className="mt-2 flex flex-wrap gap-3 font-mono text-xs">
              {props.arches.map((a) => (
                <li key={a}>
                  <a href={props.filesUrls[a]?.[0]} className="underline-offset-4 hover:text-foreground hover:underline">
                    files.{a}.json.gz ({fileCount(a)} layers)
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </TabsContent>

      <TabsContent value="packages" forceMount className="data-[state=inactive]:hidden">
        {hydrated && opened.has('packages') ? (
          <PackageBrowser
            image={props.image}
            tag={props.tag}
            arches={props.arches}
            urls={props.packagesUrls}
            summary={props.packagesSummary}
            fallback={props.packagesFallback}
            packagesBase={props.packagesBase}
          />
        ) : (
          <div className="px-4 py-6 text-sm text-muted-foreground">
            {Object.entries(props.packagesSummary).map(([a, s]) => (
              <p key={a} className="font-mono text-xs">
                {a}: {s.count.toLocaleString('en-GB')} packages · {s.distro}
                {s.by_type &&
                  ' · ' +
                    Object.entries(s.by_type)
                      .sort((x, y) => y[1] - x[1])
                      .map(([t, n]) => `${t} ${n}`)
                      .join(', ')}
              </p>
            ))}
            {!hydrated && <p className="mt-2">Open this tab with JavaScript enabled to search the full table.</p>}
          </div>
        )}
      </TabsContent>

      <TabsContent value="config" forceMount className="data-[state=inactive]:hidden">
        <div className="grid grid-cols-1 divide-y divide-[var(--raft-hair)] lg:grid-cols-2 lg:divide-x lg:divide-y-0">
          <section className="p-4" aria-labelledby="exp-config">
            <h3 id="exp-config" className="raft-eyebrow">
              Image config
            </h3>
            <dl className="mt-3 space-y-3 font-mono text-xs">
              {props.config.entrypoint && <Kv k="entrypoint" v={props.config.entrypoint.join(' ')} />}
              {props.config.cmd && <Kv k="cmd" v={props.config.cmd.join(' ')} />}
              {props.config.user && <Kv k="user" v={props.config.user} />}
              {props.config.working_dir && <Kv k="working_dir" v={props.config.working_dir} />}
              {props.config.exposed_ports?.length ? <Kv k="exposed ports" v={props.config.exposed_ports.join(', ')} /> : null}
              {props.config.volumes?.length ? <Kv k="volumes" v={props.config.volumes.join(', ')} /> : null}
              {props.config.env?.length ? (
                <div>
                  <dt className="text-muted-foreground">environment</dt>
                  <dd className="mt-1">
                    <ul className="space-y-0.5">
                      {props.config.env.map((e) => {
                        const i = e.indexOf('=');
                        return (
                          <li key={e} className="break-all">
                            <span className="text-foreground">{i > 0 ? e.slice(0, i) : e}</span>
                            {i > 0 && <span className="text-muted-foreground">={e.slice(i + 1)}</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>
          <section className="p-4" aria-labelledby="exp-labels">
            <h3 id="exp-labels" className="raft-eyebrow">
              OCI labels
            </h3>
            <dl className="mt-3 space-y-2 font-mono text-xs">
              {Object.entries(props.labels)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([k, v]) => (
                  <div key={k} className="grid grid-cols-1 gap-x-3 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
                    <dt className="truncate text-muted-foreground" title={k}>
                      {k.replace('org.opencontainers.image.', 'oci.')}
                    </dt>
                    <dd className="break-all text-foreground">{v}</dd>
                  </div>
                ))}
            </dl>
          </section>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="mt-0.5 break-all text-foreground">{v}</dd>
    </div>
  );
}
