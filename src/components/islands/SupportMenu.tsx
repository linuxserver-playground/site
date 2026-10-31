import { Popover } from 'radix-ui';
import { ArrowUpRight, ChevronDown, Heart } from 'lucide-react';

export interface Sponsor {
  name: string;
  url: string;
}

interface Props {
  title: string;
  sponsors: Sponsor[];
}

const host = (url: string) => new URL(url).hostname.replace(/^www\./, '');

const BUTTON = 'inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';

/**
 * The one Donate button of the "Support the project" box. A single donation page is a plain link; several open
 * a small menu to pick from, each with its name and the site it is on. Server-rendered, so the single link
 * works without JavaScript; the menu's trigger needs the island.
 */
export default function SupportMenu({ title, sponsors }: Props) {
  if (sponsors.length === 1) {
    const s = sponsors[0];
    return (
      <a href={s.url} target="_blank" rel="noopener" className={BUTTON} title={`${s.name} on ${host(s.url)}`}>
        <Heart className="size-4" aria-hidden="true" />
        Donate
        <ArrowUpRight className="size-3.5" aria-hidden="true" />
        <span className="sr-only">
          {' '}
          to {title} on {host(s.url)} (opens in a new tab)
        </span>
      </a>
    );
  }
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button type="button" className={`${BUTTON} data-[state=open]:brightness-110`} aria-label={`Donate to ${title}: ${sponsors.length} ways`}>
          <Heart className="size-4" aria-hidden="true" />
          Donate
          <ChevronDown className="size-3.5" aria-hidden="true" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={6}
          collisionPadding={16}
          className="z-50 w-[min(20rem,calc(100vw-2rem))] rounded-[var(--radius)] border border-[var(--raft-hair-strong)] bg-popover p-2 text-popover-foreground shadow-xl outline-none motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0 motion-safe:data-[state=open]:zoom-in-95"
        >
          <p className="raft-eyebrow px-2 pt-1 pb-2">Support {title}</p>
          <ul aria-label={`Ways to support ${title}`}>
            {sponsors.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{s.name}</span>
                    <span className="block truncate font-mono text-xs text-muted-foreground">{host(s.url)}</span>
                  </span>
                  <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
          <Popover.Arrow className="fill-[var(--raft-hair-strong)]" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
