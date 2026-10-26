/**
 * "New post" on the blog and "New page" on a docs section, for people who may edit the site, with what is not
 * published there yet: the open edits that add a post (or a page to this section), each with its pull request and
 * a way in. New content has no page of its own until it merges, so this is where everyone finds it.
 */
import { FilePlus } from 'lucide-react';
import { withBase } from '@/lib/base';
import { cn } from '@/lib/utils';
import { PendingRow } from './EntryBar';
import { useEditorStatus, usePending } from './hooks';

export default function NewBar({ kind, section, sectionTitle }: { kind: 'doc' | 'post'; section?: string; sectionTitle?: string }) {
  const status = useEditorStatus();
  const prefix = kind === 'post' ? 'posts/' : `docs/${section}/`;
  const fresh = usePending(!!status?.can_edit).filter((e) => e.change === 'new' && e.key.startsWith(prefix));
  if (!status?.can_edit) return null;
  const href = withBase(kind === 'post' ? '/edit/?new=post' : `/edit/?new=doc&section=${section}`);
  return (
    <section aria-label={kind === 'post' ? 'Editing the blog' : `Editing ${sectionTitle ?? 'this section'}`} className="not-prose my-6 rounded-md border border-dashed border-[var(--raft-hair-strong)] bg-[var(--raft-surface)] p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-auto font-mono text-[0.6875rem] text-muted-foreground">Editor · only people who can edit the site see this</p>
        <a href={href} className={cn('inline-flex h-8 items-center gap-1.5 rounded-md border border-transparent bg-primary px-2.5 text-primary-foreground hover:ring-2 hover:ring-primary/40')}>
          <FilePlus className="size-4" aria-hidden="true" /> {kind === 'post' ? 'New post' : 'New page'}
        </a>
      </div>
      {fresh.length > 0 && (
        <div className="mt-3 border-t border-[var(--raft-hair)] pt-2">
          <h2 className="font-mono text-[0.6875rem] text-muted-foreground">Not published yet</h2>
          <ul className="divide-y divide-[var(--raft-hair)]">
            {fresh.map((e) => (
              <PendingRow key={e.branch} edit={e} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
