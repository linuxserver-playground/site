import * as React from 'react';
import type { Arch } from '@/lib/hub';
import Treemap from './Treemap';

interface Props {
  image: string;
  tag: string;
  arches: Arch[];
  urls: Partial<Record<Arch, string[]>>;
}

/**
 * The file treemap of the latest build, reduced, for the "Inside the latest image" panel on an image
 * page. The file table is fetched from the hub only once the panel scrolls into view (client:visible);
 * before hydration the panel says what the map needs and links the table.
 */
export default function CompactTreemap(props: Props) {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);
  if (!hydrated) {
    return (
      <p className="px-4 py-6 text-sm text-muted-foreground">
        The file treemap needs JavaScript.{' '}
        {props.arches.map((a) => (
          <a key={a} href={props.urls[a]?.[0]} className="mr-2 font-mono text-xs underline underline-offset-4 decoration-[var(--raft-hair-strong)] hover:text-foreground hover:decoration-current">
            files.{a}.json.gz
          </a>
        ))}
      </p>
    );
  }
  return <Treemap {...props} compact />;
}
