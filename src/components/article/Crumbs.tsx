/** Breadcrumbs as React, for the shared article layouts (same markup as Breadcrumbs.astro). */
import { withBase } from '@/lib/base';

export interface Crumb {
  name: string;
  href: string;
}

export default function Crumbs({ crumbs }: { crumbs: Crumb[] }) {
  const all = [{ name: 'Home', href: '/' }, ...crumbs];
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-muted-foreground">
        {all.map((c, i) => (
          <li key={`${c.href}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {i === all.length - 1 ? (
              <span aria-current="page" className="text-foreground">
                {c.name}
              </span>
            ) : (
              <a href={withBase(c.href)} className="hover:text-foreground">
                {c.name}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
