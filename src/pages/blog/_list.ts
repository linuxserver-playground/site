/** Shared by the blog listing routes. */
import { paginate, type Post } from '@/lib/posts';
import { SITE } from '@/lib/site';
import { toPostViews } from '@/lib/views';

/** The blog index's page 1 leads with one wide post above the cards: one more post there keeps the grid full. */
export const INDEX_LEAD = 1;

export async function listing(posts: Post[], page: number, basePath: string, size = SITE.postsPerPage, lead = 0) {
  const p = paginate(posts, page, size, basePath, lead);
  return { ...p, data: await toPostViews(p.data) };
}

export const pageCount = (n: number, lead = 0) => (n <= SITE.postsPerPage + lead ? 1 : 1 + Math.ceil((n - SITE.postsPerPage - lead) / SITE.postsPerPage));
