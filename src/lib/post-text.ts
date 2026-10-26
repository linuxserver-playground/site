/**
 * Text helpers for posts that need no content collection, so the editor's preview (in the browser) and the
 * build compute slugs, initials, excerpts and reading times the same way. posts.ts re-exports them.
 */
import { withBase } from './base';

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
export const tagSlug = slugify;
export const tagUrl = (slug: string) => withBase(`/blog/tags/${slug}/`);

export function initials(name: string): string {
  const parts = name.replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2)).toUpperCase();
}

/** Markdown -> rough plain text, good enough for excerpts and word counts. */
export function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<video[\s\S]*?<\/video>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+.*$/gm, ' ')
    .replace(/^\s*>\s?\[!\w+\]\s*$/gm, ' ')
    .replace(/^\s*>\s?/gm, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function excerptOf(description: string | undefined, body: string, max = 180): string {
  if (description) return description;
  const text = plainText(body);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const at = cut.lastIndexOf(' ');
  return cut.slice(0, at > 100 ? at : max).replace(/[,;:.]$/, '') + '…';
}

export function readingTimeOf(body: string): number {
  const words = plainText(body).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}
