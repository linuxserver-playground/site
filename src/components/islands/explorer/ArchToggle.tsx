import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { Arch } from '@/lib/hub';

/** amd64 / arm64 switch shared by the explorer islands. Hidden when there is only one architecture. */
export default function ArchToggle({ arches, value, onChange, label = 'Architecture' }: { arches: Arch[]; value: Arch; onChange: (a: Arch) => void; label?: string }) {
  if (arches.length < 2) return null;
  return (
    <ToggleGroup type="single" value={value} onValueChange={(v) => v && onChange(v as Arch)} variant="outline" size="sm" aria-label={label}>
      {arches.map((a) => (
        <ToggleGroupItem key={a} value={a} className="px-2.5 font-mono text-xs">
          {a}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

/** A small panel header: eyebrow, optional note, controls on the right. */
export function IslandHeader({ title, note, children }: { title: string; note?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--raft-hair)] bg-[var(--raft-surface)] px-3.5 py-2">
      <div className="min-w-0">
        <p className="font-mono text-xs text-muted-foreground">{title}</p>
        {note && <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

export function Loading({ what }: { what: string }) {
  return (
    <div className="grid place-items-center gap-3 px-6 py-16 text-center" role="status" aria-live="polite">
      <span className="inline-block size-6 rounded-full border-2 border-[var(--raft-hair-strong)] border-t-primary motion-safe:animate-spin" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">Loading {what}…</p>
    </div>
  );
}

export function LoadError({ error, url, retry }: { error: string; url?: string; retry: () => void }) {
  return (
    <div className="grid place-items-center gap-2 px-6 py-12 text-center" role="alert">
      <p className="text-sm font-medium">Could not load this view.</p>
      <p className="font-mono text-xs text-muted-foreground">{error}</p>
      {url && (
        <a href={url} className="text-xs text-muted-foreground underline underline-offset-4 decoration-[var(--raft-hair-strong)] hover:text-foreground hover:decoration-current" target="_blank" rel="noopener">
          Open the data file directly<span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
      <button type="button" onClick={retry} className="mt-2 inline-flex h-8 items-center rounded-md border border-[var(--raft-hair-strong)] px-3 text-sm hover:bg-muted">
        Try again
      </button>
    </div>
  );
}
