import * as React from 'react';
import { formatDate, relative } from '@/lib/format';

/**
 * Ago.astro for islands: the date when server-rendered and on hydration, then how long ago it was by the visitor's
 * clock, kept current while the page stays open.
 */
export default function Ago({ date, className }: { date: string; className?: string }) {
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const d = new Date(date);
  return (
    <time dateTime={d.toISOString()} title={formatDate(d)} className={className}>
      {now ? relative(d, now) : formatDate(d)}
    </time>
  );
}
