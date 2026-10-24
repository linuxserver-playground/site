import * as React from 'react';
import type { Arch, Layer } from '@/lib/hub';
import { fmtBytes, layerLines, pct } from '@/lib/explorer';
import ArchToggle, { IslandHeader } from './ArchToggle';

interface Props {
  layers: Partial<Record<Arch, Layer[]>>;
  dockerfile: Partial<Record<Arch, string>>;
  /** Initially selected architecture (the first one with a table). */
  initialArch?: Arch;
}

/** "RUN |3 BUILD_DATE=… /bin/sh -c echo …" -> "RUN echo …" */
export function tidyInstruction(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(/^RUN \|\d+\s+(?:\S+=\S*\s+)*\/bin\/sh -c\s*/, 'RUN ')
    .replace(/^\/bin\/sh -c #\(nop\)\s*/, '')
    .replace(/^\/bin\/sh -c\s*/, 'RUN ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Layer table: index, Dockerfile instruction (with its line range), compressed and uncompressed size, share
 * of the image. Server-rendered for the first architecture; the toggle switches tables client-side.
 */
export default function LayerTable({ layers, dockerfile, initialArch }: Props) {
  const arches = (Object.keys(layers) as Arch[]).filter((a) => layers[a]?.length);
  const [arch, setArch] = React.useState<Arch>(initialArch ?? arches[0]);
  const [open, setOpen] = React.useState<number | null>(null);
  const rows = layers[arch] ?? [];
  const total = rows.reduce((a, l) => a + l.size, 0);
  const totalUncompressed = rows.reduce((a, l) => a + (l.uncompressed_size ?? 0), 0);
  const df = dockerfile[arch] ?? dockerfile.amd64 ?? '';

  if (!arches.length) return <p className="px-4 py-6 text-sm text-muted-foreground">No layer table was attached to this build.</p>;

  return (
    <div>
      <IslandHeader title={`layers.${arch}.json · ${rows.length} layers · ${fmtBytes(total)} compressed`} note="Sizes are compressed bytes as pushed; the bar is each layer's share of the image.">
        <ArchToggle arches={arches} value={arch} onChange={setArch} />
      </IslandHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--raft-hair)] font-mono text-[0.6875rem] text-muted-foreground uppercase">
            <tr>
              <th scope="col" className="px-3 py-2 font-normal">
                #
              </th>
              <th scope="col" className="px-3 py-2 font-normal">
                Instruction
              </th>
              <th scope="col" className="px-3 py-2 text-right font-normal">
                Compressed
              </th>
              <th scope="col" className="hidden px-3 py-2 text-right font-normal md:table-cell">
                Uncompressed
              </th>
              <th scope="col" className="px-3 py-2 font-normal">
                Share
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--raft-hair)]">
            {rows.map((l) => {
              const text = tidyInstruction(l.created_by);
              const lines = df ? layerLines(l, df) : null;
              const share = total ? l.size / total : 0;
              const isOpen = open === l.index;
              return (
                <tr key={l.index} className="align-top">
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground tabular-nums">{l.index}</td>
                  <td className="min-w-[14rem] px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : l.index)}
                      aria-expanded={isOpen}
                      className="block w-full text-left font-mono text-xs text-foreground hover:text-primary"
                      title={isOpen ? 'Collapse' : 'Show the full instruction'}
                    >
                      <span className={isOpen ? 'break-words whitespace-pre-wrap' : 'line-clamp-2 break-all'}>{text || '(empty layer)'}</span>
                    </button>
                    <span className="mt-1 flex flex-wrap gap-x-3 font-mono text-[0.6875rem] text-muted-foreground">
                      {lines && (
                        <span>
                          Dockerfile {lines[0] === lines[1] ? `line ${lines[0]}` : `lines ${lines[0]}–${lines[1]}`}
                        </span>
                      )}
                      {l.from_base && <span>from base image</span>}
                      {l.empty && <span>empty</span>}
                      <span className="hidden sm:inline" title={l.digest}>
                        {l.digest.slice(0, 19)}…
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs whitespace-nowrap tabular-nums">{fmtBytes(l.size)}</td>
                  <td className="hidden px-3 py-2 text-right font-mono text-xs whitespace-nowrap text-muted-foreground tabular-nums md:table-cell">{fmtBytes(l.uncompressed_size)}</td>
                  <td className="w-32 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 flex-1 overflow-hidden rounded-sm bg-[var(--raft-bar-track)]" aria-hidden="true">
                        <span className="block h-full rounded-sm bg-[var(--raft-bar)]" style={{ width: `${Math.max(share * 100, share > 0 ? 1 : 0)}%` }} />
                      </span>
                      <span className="w-10 text-right font-mono text-[0.6875rem] text-muted-foreground tabular-nums">{pct(l.size, total)}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t border-[var(--raft-hair)] font-mono text-xs">
            <tr>
              <td className="px-3 py-2" />
              <td className="px-3 py-2 text-muted-foreground">Total</td>
              <td className="px-3 py-2 text-right whitespace-nowrap tabular-nums">{fmtBytes(total)}</td>
              <td className="hidden px-3 py-2 text-right whitespace-nowrap text-muted-foreground tabular-nums md:table-cell">{totalUncompressed ? fmtBytes(totalUncompressed) : '–'}</td>
              <td className="px-3 py-2" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
