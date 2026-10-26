/**
 * A small editor link for people who may edit the site, such as "New page here" under a docs section's
 * sub-heading. Renders nothing for anyone else (and before the control plane answers), so the static page stays
 * as it is for readers.
 */
import { FilePlus, PenLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEditorStatus } from './hooks';

export default function EditLink({ href, label, kind = 'edit', className }: { href: string; label: string; kind?: 'edit' | 'new'; className?: string }) {
  const status = useEditorStatus();
  if (!status?.can_edit) return null;
  const Icon = kind === 'new' ? FilePlus : PenLine;
  return (
    <a href={href} className={cn('inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground', className)}>
      <Icon className="size-3.5" aria-hidden="true" /> {label}
    </a>
  );
}
