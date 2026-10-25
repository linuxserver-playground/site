import * as React from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { Arch, Layer } from '@/lib/hub';
import { attributeLayers, fmtBytes, parseInstructions } from '@/lib/explorer';
import ArchToggle, { IslandHeader } from './ArchToggle';
import CopyButton from '../CopyButton';

interface Props {
  dockerfile: Partial<Record<Arch, string>>;
  layers: Partial<Record<Arch, Layer[]>>;
  /** The base image reference from the bundle (`base.image`). */
  base?: string | null;
  /** Raw `layers.<arch>.json` on the hub, linked for the curious. */
  layersUrls?: Partial<Record<Arch, string>>;
  initialArch?: Arch;
}

const KEYWORDS = /^(FROM|RUN|COPY|ADD|ENV|ARG|LABEL|EXPOSE|VOLUME|WORKDIR|USER|ENTRYPOINT|CMD|HEALTHCHECK|SHELL|STOPSIGNAL|ONBUILD)\b/;

function Line({ text }: { text: string }) {
  if (/^\s*#/.test(text)) return <span className="text-muted-foreground">{text}</span>;
  const m = text.match(KEYWORDS);
  if (!m) return <>{text}</>;
  return (
    <>
      <span className="font-semibold text-[var(--raft-violet)]">{m[1]}</span>
      {text.slice(m[1].length)}
    </>
  );
}

interface Bytes {
  size: number;
  uncompressed: number;
  layers: number[];
}

const ROW = 'grid grid-cols-[2.5rem_5.25rem_3.5rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[2.5rem_5.25rem_5.25rem_3.5rem_minmax(0,1fr)]';

/**
 * The Dockerfile as built, with the layer each instruction produced read off `layers.<arch>.json`: compressed
 * and on-disk bytes in the gutter and a bar proportional to the compressed size. The base image's layers are
 * summed into one line above the text, since a LinuxServer image is essentially one RUN and one COPY on top
 * of its base.
 */
export default function DockerfileView({ dockerfile, layers, base, layersUrls, initialArch }: Props) {
  const arches = (Object.keys(dockerfile) as Arch[]).filter((a) => dockerfile[a]);
  const [arch, setArch] = React.useState<Arch>(initialArch ?? arches[0]);
  const text = dockerfile[arch] ?? '';
  const table = layers[arch] ?? [];
  const lines = text.split('\n');
  const instructions = React.useMemo(() => parseInstructions(text), [text]);

  const { byInstruction, baseBytes } = React.useMemo(() => {
    const byInstruction = new Map<number, Bytes>();
    const baseBytes: Bytes = { size: 0, uncompressed: 0, layers: [] };
    for (const { layer, lines: range } of attributeLayers(table, text)) {
      const ins = range ? instructions.find((i) => range[0] >= i.start && range[0] <= i.end) : undefined;
      const target = ins ? (byInstruction.get(ins.start) ?? { size: 0, uncompressed: 0, layers: [] }) : baseBytes;
      target.size += layer.size;
      target.uncompressed += layer.uncompressed_size ?? 0;
      target.layers.push(layer.index);
      if (ins) byInstruction.set(ins.start, target);
    }
    return { byInstruction, baseBytes };
  }, [table, text, instructions]);
  const total = table.reduce((a, l) => a + l.size, 0);
  const own = total - baseBytes.size;
  const max = Math.max(1, ...[...byInstruction.values()].map((v) => v.size));
  const startOf = new Map(instructions.map((i) => [i.start, i]));
  const layersUrl = layersUrls?.[arch];

  if (!arches.length) return <p className="px-4 py-6 text-sm text-muted-foreground">No Dockerfile for this build.</p>;

  return (
    <div>
      <IslandHeader title={`Dockerfile${arch === 'arm64' ? '.aarch64' : ''} · ${instructions.length} instructions · ${table.length ? `${fmtBytes(own)} added over the base, ${fmtBytes(total)} in all` : 'no layer table'}`}>
        <ArchToggle arches={arches} value={arch} onChange={setArch} />
        {layersUrl && (
          <a href={layersUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            layers<ArrowUpRight className="size-3" aria-hidden="true" />
            <span className="sr-only"> (raw layers.{arch}.json, opens in a new tab)</span>
          </a>
        )}
        <CopyButton text={text} label="Copy Dockerfile" />
      </IslandHeader>
      {table.length > 0 && (
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-[var(--raft-hair)] px-4 py-2 font-mono text-xs text-muted-foreground">
          <span className="text-foreground">Base image:</span>
          <span className="break-all">{base ?? instructions.find((i) => i.keyword === 'FROM')?.text.replace(/^FROM\s+/, '') ?? 'unknown'}</span>
          <span className="whitespace-nowrap">
            {baseBytes.layers.length} layer{baseBytes.layers.length === 1 ? '' : 's'} · {fmtBytes(baseBytes.size)} compressed
            {baseBytes.uncompressed > 0 && `, ${fmtBytes(baseBytes.uncompressed)} on disk`}
          </span>
        </p>
      )}
      <div className="overflow-x-auto bg-[var(--raft-code-bg)]">
        <pre className="min-w-max p-4 font-mono text-[0.78rem] leading-6" tabIndex={0} aria-label={`Dockerfile for ${arch}`}>
          {table.length > 0 && (
            <span className={`${ROW} mb-1 select-none text-[0.6875rem] text-muted-foreground`} aria-hidden="true">
              <span />
              <span className="text-right">compressed</span>
              <span className="hidden text-right sm:block">on disk</span>
              <span />
              <span />
            </span>
          )}
          <code>
            {lines.map((line, i) => {
              const n = i + 1;
              const ins = startOf.get(n);
              const isFrom = ins?.keyword === 'FROM';
              const b = ins ? (isFrom ? (baseBytes.layers.length ? baseBytes : undefined) : byInstruction.get(ins.start)) : undefined;
              const annotated = ins && table.length > 0;
              return (
                <span key={n} className={ROW}>
                  <span className="select-none text-right text-muted-foreground tabular-nums" aria-hidden="true">
                    {n}
                  </span>
                  {annotated ? (
                    <>
                      <span className={`select-none text-right tabular-nums ${b && !isFrom ? 'text-foreground' : 'text-muted-foreground'}`} title={b ? `${isFrom ? 'base image ' : ''}layer${b.layers.length > 1 ? 's' : ''} ${b.layers.join(', ')}` : 'no layer'}>
                        {b ? fmtBytes(b.size, 1) : '–'}
                      </span>
                      <span className="hidden select-none text-right text-muted-foreground tabular-nums sm:block">{b && b.uncompressed > 0 ? fmtBytes(b.uncompressed, 1) : b ? '' : '–'}</span>
                      <span className="flex items-center" aria-hidden="true">
                        {b && (
                          <span className="h-1.5 w-full overflow-hidden rounded-sm bg-[var(--raft-bar-track)]">
                            <span className={`block h-full rounded-sm ${isFrom ? 'bg-[var(--raft-hair-strong)]' : 'bg-[var(--raft-bar)]'}`} style={{ width: `${Math.min(100, Math.max(2, (b.size / max) * 100))}%` }} />
                          </span>
                        )}
                      </span>
                      <span className="sr-only">{b ? `${isFrom ? 'base image brings' : 'added'} ${fmtBytes(b.size)} compressed${b.uncompressed ? `, ${fmtBytes(b.uncompressed)} on disk,` : ''} in layer ${b.layers.join(', ')}` : 'added no layer'}</span>
                    </>
                  ) : (
                    <span className="col-span-2 sm:col-span-3" />
                  )}
                  <span className="whitespace-pre">
                    <Line text={line} />
                  </span>
                </span>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}
