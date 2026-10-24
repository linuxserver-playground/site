import { Popover } from 'radix-ui';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import type { InstallOption } from '@/lib/fleet';
import CopyButton from './CopyButton';

interface Props {
  image: string;
  options: InstallOption[];
}

/**
 * "Install on …" buttons, one per platform the hub generates a store for. Each opens a short how-to with
 * the URL to paste. Server-rendered as plain links to the same URLs, so it works without JavaScript.
 */
export default function InstallMenu({ image, options }: Props) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label={`Install ${image} on`}>
      {options.map((o) => (
        <li key={o.platform}>
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[var(--raft-hair-strong)] bg-background/60 px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-[state=open]:bg-muted"
              >
                {o.label}
                <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                side="bottom"
                align="start"
                sideOffset={6}
                collisionPadding={16}
                className="z-50 w-[min(26rem,calc(100vw-2rem))] rounded-[var(--radius)] border border-[var(--raft-hair-strong)] bg-popover p-4 text-popover-foreground shadow-xl outline-none motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0 motion-safe:data-[state=open]:zoom-in-95"
              >
                <p className="raft-eyebrow">{o.name}</p>
                <p className="mt-2 text-sm leading-relaxed">{o.howTo}</p>
                <div className="mt-3 flex items-center gap-2 rounded-md border border-[var(--raft-hair)] bg-[var(--raft-code-bg)] py-1 pr-1 pl-3 font-mono text-xs">
                  <span className="min-w-0 flex-1 truncate" title={o.url}>
                    {o.url.replace(/^https?:\/\//, '')}
                  </span>
                  <CopyButton text={o.url} label={`Copy ${o.name} URL`} />
                </div>
                <a
                  href={o.url}
                  target="_blank"
                  rel="noopener"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:text-primary hover:underline"
                >
                  Open the file <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
                <Popover.Arrow className="fill-[var(--raft-hair-strong)]" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </li>
      ))}
    </ul>
  );
}
