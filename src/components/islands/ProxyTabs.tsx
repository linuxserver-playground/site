import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ProxySample } from '@/lib/proxy';
import CopyButton from './CopyButton';
import ProxyLab from './ProxyLab';

interface Props {
  sample: ProxySample;
  /** The hub's reference Caddyfile site block and Traefik labels, when it generated them. */
  caddy: string | null;
  traefik: string | null;
  /** The hub's proxy.json for this image, for the source links. */
  source?: string;
}

/**
 * The reverse proxy section: SWAG (the proxy lab, the default) and the hub's reference configs for Caddy and
 * Traefik. All three come from the same proxy block of the manifest.
 */
export default function ProxyTabs({ sample, caddy, traefik, source }: Props) {
  const refs = [
    { key: 'caddy', label: 'Caddy', text: caddy, aria: `Caddyfile for ${sample.image}`, how: 'Add the site block to your Caddyfile and reload Caddy.' },
    { key: 'traefik', label: 'Traefik', text: traefik, aria: `Traefik labels for ${sample.image}`, how: `Merge the labels into the ${sample.image} service of your compose file and recreate it.` },
  ].filter((r): r is typeof r & { text: string } => !!r.text);
  return (
    <Tabs defaultValue="swag" className="gap-0">
      <div className="border-b border-border px-3 py-2">
        <TabsList aria-label={`Reverse proxies for ${sample.image}`}>
          <TabsTrigger value="swag">SWAG</TabsTrigger>
          {refs.map((r) => (
            <TabsTrigger key={r.key} value={r.key}>
              {r.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <TabsContent value="swag">
        <ProxyLab sample={sample} source={source} />
      </TabsContent>
      {refs.map((r) => (
        <TabsContent key={r.key} value={r.key} className="relative">
          <pre className="max-h-[32rem] overflow-auto bg-[var(--raft-code-bg)] p-4 pr-14 font-mono text-[0.8125rem] leading-relaxed" tabIndex={0} aria-label={r.aria}>
            <code>{r.text.trimEnd()}</code>
          </pre>
          <CopyButton text={r.text} label={`Copy the ${r.aria}`} className="absolute top-2 right-2" variant="secondary" />
          <div className="space-y-1 border-t border-border px-4 py-2 text-[0.6875rem] text-muted-foreground">
            <p>{r.how}</p>
            {source && (
              <p className="font-mono">
                Source:{' '}
                <a href={source} className="break-all underline underline-offset-4 decoration-[var(--raft-hair-strong)] hover:text-foreground hover:decoration-current">
                  {source.replace(/^https?:\/\//, '')}
                </a>
              </p>
            )}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
