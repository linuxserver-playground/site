/**
 * "Edit on the site" for members, beside the GitHub edit link on docs pages and posts, and "New post" /
 * "New docs page" on the blog and docs indexes. Renders nothing for anyone else (and before /api/me answers),
 * so the static page stays as it is for readers.
 */
import { FilePlus, PenLine } from 'lucide-react';
import { useMe } from '@/lib/control';
import { cn } from '@/lib/utils';

export default function EditLink({ href, label, kind = 'edit', className }: { href: string; label: string; kind?: 'edit' | 'new'; className?: string }) {
  const me = useMe();
  if (!me?.member) return null;
  const Icon = kind === 'new' ? FilePlus : PenLine;
  return (
    <a href={href} className={cn('inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground', className)}>
      <Icon className="size-3.5" aria-hidden="true" /> {label}
    </a>
  );
}
