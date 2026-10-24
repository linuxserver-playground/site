/** Small index for the ⌘K command palette: every image, every post title, every docs page and the main pages. */
import { docUrl, getDocs, getSections } from '@/lib/docs';
import { getAllImages } from '@/lib/images';
import { getPosts, postUrl } from '@/lib/posts';
import { LINKS, NAV, NAV_SECONDARY } from '@/lib/site';
import { withBase } from '@/lib/base';
import { toCards } from '@/lib/views';

export async function GET() {
  const sectionTitle = new Map((await getSections()).map((s) => [s.id, s.title]));
  const cards = await toCards(getAllImages().filter((i) => !i.deprecated), 40);
  const body = {
    images: cards.map((c) => ({
      n: c.name,
      s: c.summary.length > 110 ? c.summary.slice(0, 107).replace(/\s+\S*$/, '') + '…' : c.summary,
      u: withBase(c.url),
      l: c.logo,
      c: c.categories,
      p: c.stars,
    })),
    posts: (await getPosts()).map((p) => ({ t: p.data.title, u: postUrl(p), y: p.data.date.getUTCFullYear(), g: p.data.tags })),
    docs: (await getDocs()).map((d) => ({ t: d.data.title, u: docUrl(d), s: sectionTitle.get(d.data.section) ?? d.data.section, k: [...d.data.tags, d.data.group ?? ''].filter(Boolean).join(' ') })),
    pages: [
      { t: 'Home', u: withBase('/') },
      ...[...NAV, ...NAV_SECONDARY].map((n) => ({ t: n.label, u: n.external ? n.href : withBase(n.href), k: n.description })),
      { t: 'Donate', u: withBase('/donate/'), k: 'Open Collective sponsor support us' },
      { t: 'Blog tags', u: withBase('/blog/tags/'), k: 'topics authors' },
      { t: 'FAQ', u: withBase('/docs/faq/'), k: 'docs frequently asked questions' },
      { t: 'Full-text search', u: withBase('/search/') },
      { t: 'Hub API', u: LINKS.hub, k: 'json api data openapi' },
    ],
  };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
}
