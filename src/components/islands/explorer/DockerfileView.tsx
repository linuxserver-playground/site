import * as React from 'react';
import type { Arch, Layer } from '@/lib/hub';
import { fmtBytes, layerLines, parseInstructions } from '@/lib/explorer';
import ArchToggle, { IslandHeader } from './ArchToggle';
import CopyButton from '../CopyButton';

interface Props {
  dockerfile: Partial<Record<Arch, string>>;
  layers: Partial<Record<Arch, Layer[]>>;
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

/**
 * The Dockerfile as built, with the bytes each instruction added read off the layer table. Instructions
 * that produced a layer get a gutter badge with the compressed size and a bar; metadata-only instructions
 * (ENV, LABEL, EXPOSE…) show "0 B".
 */
export default function DockerfileView({ dockerfile, layers, initialArch }: Props) {
  const arches = (Object.keys(dockerfile) as Arch[]).filter((a) => dockerfile[a]);
  const [arch, setArch] = React.useState<Arch>(initialArch ?? arches[0]);
  const text = dockerfile[arch] ?? '';
  const table = layers[arch] ?? [];
  const lines = text.split('\n');
  const instructions = React.useMemo(() => parseInstructions(text), [text]);

  // Map each layer to the instruction whose line range contains the layer's lines.
  const bytesByInstruction = React.useMemo(() => {
    const m = new Map<number, { size: number; layers: number[] }>();
    for (const l of table) {
      const range = layerLines(l, text);
      if (!range) continue;
      const ins = instructions.find((i) => range[0] >= i.start && range[0] <= i.end) ?? instructions.find((i) => i.start <= range[0] && i.end >= range[1]);
      if (!ins) continue;
      const cur = m.get(ins.start) ?? { size: 0, layers: [] };
      cur.size += l.size;
      cur.layers.push(l.index);
      m.set(ins.start, cur);
    }
    return m;
  }, [table, text, instructions]);
  const total = table.reduce((a, l) => a + l.size, 0);
  const max = Math.max(1, ...[...bytesByInstruction.values()].map((v) => v.size));
  const startOf = new Map(instructions.map((i) => [i.start, i]));

  if (!arches.length) return <p className="px-4 py-6 text-sm text-muted-foreground">The bundle carries no Dockerfile text.</p>;

  return (
    <div>
      <IslandHeader title={`Dockerfile${arch === 'arm64' ? '.aarch64' : ''} · ${instructions.length} instructions · ${fmtBytes(total)} in layers`} note="Bytes per instruction come from the layer table; instructions without a layer added nothing.">
        <ArchToggle arches={arches} value={arch} onChange={setArch} />
        <CopyButton text={text} label="Copy Dockerfile" />
      </IslandHeader>
      <div className="overflow-x-auto bg-[var(--raft-code-bg)]">
        <pre className="min-w-max p-4 font-mono text-[0.78rem] leading-6" tabIndex={0} aria-label={`Dockerfile for ${arch}`}>
          <code>
            {lines.map((line, i) => {
              const n = i + 1;
              const ins = startOf.get(n);
              const b = ins ? bytesByInstruction.get(ins.start) : undefined;
              const annotated = ins && !/^(#)/.test(line);
              return (
                <span key={n} className="grid grid-cols-[2.5rem_7.5rem_minmax(0,1fr)] gap-x-3">
                  <span className="select-none text-right text-muted-foreground/70 tabular-nums" aria-hidden="true">
                    {n}
                  </span>
                  <span className="select-none tabular-nums">
                    {annotated && (
                      <span className="flex items-center gap-1.5" title={b ? `layer${b.layers.length > 1 ? 's' : ''} ${b.layers.join(', ')}` : 'no layer'}>
                        <span className={b ? 'text-foreground' : 'text-muted-foreground/70'}>{b ? fmtBytes(b.size, 0) : '0 B'}</span>
                        <span className="h-1.5 w-10 overflow-hidden rounded-sm bg-[var(--raft-bar-track)]" aria-hidden="true">
                          {b && <span className="block h-full rounded-sm bg-[var(--raft-bar)]" style={{ width: `${Math.max(2, (b.size / max) * 100)}%` }} />}
                        </span>
                        <span className="sr-only">{b ? `, added ${fmtBytes(b.size)} in layer ${b.layers.join(', ')}` : ', added no layer'}</span>
                      </span>
                    )}
                  </span>
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
