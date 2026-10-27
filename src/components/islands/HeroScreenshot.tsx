import * as React from 'react';
import { Maximize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/**
 * The CI screenshot of an image's latest build, in the image page's header, so a reader sees what the app looks
 * like before reading about it. Opens full size in a lightbox; removes itself if the hub no longer serves it.
 */
export default function HeroScreenshot({ url, alt, caption, buildUrl, className }: { url: string; alt: string; caption: string; buildUrl: string; className?: string }) {
  const [missing, setMissing] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  if (missing) return null;
  return (
    <figure className={cn('min-w-0', className)}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full overflow-hidden rounded-lg border border-[var(--raft-hair-strong)] bg-[var(--raft-code-bg)] shadow-[var(--raft-shadow)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label="Enlarge the screenshot"
      >
        <img
          src={url}
          alt={alt}
          decoding="async"
          onError={() => setMissing(true)}
          className="block aspect-[16/10] w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <span className="absolute right-2 bottom-2 grid size-8 place-items-center rounded-md border border-[var(--raft-hair)] bg-background/80 text-muted-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true">
          <Maximize2 className="size-4" />
        </span>
      </button>
      <figcaption className="mt-2 font-mono text-[0.6875rem] text-muted-foreground">
        {caption} ·{' '}
        <a href={buildUrl} className="underline decoration-[var(--raft-hair-strong)] underline-offset-4 hover:text-foreground hover:decoration-current">
          test report
        </a>
      </figcaption>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92dvh] w-[min(96vw,80rem)] overflow-auto p-2 sm:max-w-none">
          <DialogTitle className="sr-only">Screenshot</DialogTitle>
          <DialogDescription className="sr-only">{alt}</DialogDescription>
          <img src={url} alt={alt} className="block h-auto w-full rounded-md" />
        </DialogContent>
      </Dialog>
    </figure>
  );
}
