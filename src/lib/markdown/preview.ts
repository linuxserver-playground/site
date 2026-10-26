/**
 * The editor's live preview: the Markdown body rendered in the browser close to how the site's build renders
 * it, with the same article styles (`.post-body`). The build uses satteri, whose browser build needs shared
 * WebAssembly memory and so cross-origin isolation headers GitHub Pages cannot send; this uses marked (GFM)
 * instead and reproduces what the site's plugins add: GitHub callouts with satteri-callouts' markup,
 * `?link` images, base-path links, and images resolved beside the entry (new ones from the editor, the rest
 * from the commit being edited). The output is sanitised with DOMPurify. The pull request's build is the
 * exact render; this is for writing.
 */
import DOMPurify from 'dompurify';
import { Marked, type Tokens } from 'marked';
import { withBase } from '../base';

export interface PreviewImages {
  /** Files added in the editor and not committed yet, by how the Markdown names them (`a.png`, `/media/x/b.mp4`). */
  pending: Map<string, string>;
  /** Where the entry's committed images load from: `<rawBase><name>`. */
  rawBase: string;
  /** The repo at the commit being edited: root-relative files are `<rawRoot>public<path>`. */
  rawRoot: string;
}

export interface Rendered {
  html: string;
  /** h2 and h3, with the ids the preview gave them, for the contents rail. */
  toc: { depth: number; slug: string; text: string }[];
}

/** github-slugger's rule, which Astro's heading ids follow: lower case, punctuation dropped, spaces to dashes. */
function slugger() {
  const seen = new Map<string, number>();
  return (text: string) => {
    const base = text
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '')
      .replace(/ /g, '-');
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return n ? `${base}-${n}` : base;
  };
}

/** Only YouTube may be embedded (privacy-enhanced or not); any other frame is dropped from the preview. */
export const YOUTUBE_EMBED = /^https:\/\/(www\.)?(youtube-nocookie\.com|youtube\.com)\/embed\/[\w-]{6,}/;

const CALLOUT = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*([^\n]*)\n?/i;
const TITLES: Record<string, string> = { note: 'Note', tip: 'Tip', important: 'Important', warning: 'Warning', caution: 'Caution' };
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** A file the Markdown points at, resolved for the preview: new files from the editor, the rest from the commit. */
function resolve(url: string, images: PreviewImages): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//') || url.startsWith('#')) return url;
  const name = url.replace(/^\.\//, '');
  const added = images.pending.get(name) ?? images.pending.get(url);
  if (added) return added;
  if (url.startsWith('/')) {
    const base = withBase('/');
    const path = base !== '/' && url.startsWith(base) ? url.slice(base.length - 1) : url;
    return `${images.rawRoot}public${path}`;
  }
  return images.rawBase + name;
}

/** `./shot.png?link` → `./shot.png` (satteri-image-links.mjs). */
const stripLink = (url: string) => url.replace(/\?(?:link|lightbox)(?:[=&][^#]*)?(?=#|$)/, '');

function make(): Marked {
  const marked = new Marked({ gfm: true, breaks: false });
  marked.use({
    renderer: {
      blockquote(token: Tokens.Blockquote) {
        const m = token.text.match(CALLOUT);
        if (!m) return `<blockquote>\n${this.parser.parse(token.tokens)}</blockquote>\n`;
        const type = m[1].toLowerCase();
        const title = m[2].trim() || TITLES[type];
        const inner = this.parser.parse(marked.lexer(token.text.slice(m[0].length)));
        return (
          `<div class="callout" data-callout="${type}" data-collapsible="false"><div class="callout-title">` +
          `<div class="callout-title-text">${escapeHtml(title)}</div></div><div class="callout-content">${inner}</div></div>\n`
        );
      },
      image({ href, title, text }: Tokens.Image) {
        const link = /\?(link|lightbox)\b/.test(href) ? ' data-link="true"' : '';
        const t = title ? ` title="${escapeHtml(title)}"` : '';
        return `<img src="${escapeHtml(stripLink(href))}" alt="${escapeHtml(text)}"${t}${link} loading="lazy">`;
      },
      link({ href, title, tokens }: Tokens.Link) {
        const t = title ? ` title="${escapeHtml(title)}"` : '';
        const target = href.startsWith('/') && !href.startsWith('//') ? withBase(href) : href;
        return `<a href="${escapeHtml(target)}"${t}>${this.parser.parseInline(tokens)}</a>`;
      },
    },
  });
  return marked;
}

let md: Marked | undefined;
let hooked = false;

/** Body Markdown → sanitised HTML for the preview, and its contents. Raw HTML in the Markdown is kept within the allowlist. */
export function renderPreview(body: string, images: PreviewImages): Rendered {
  const html = (md ??= make()).parse(body, { async: false }) as string;
  if (!hooked) {
    DOMPurify.addHook('uponSanitizeElement', (node, data) => {
      if (data.tagName === 'iframe' && !YOUTUBE_EMBED.test((node as Element).getAttribute('src') ?? '')) node.parentNode?.removeChild(node);
    });
    // Links open in a new tab, so a click in the preview never leaves the editor.
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
      const el = node as Element;
      if (el.tagName === 'A' && el.getAttribute('href')) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
      }
    });
    hooked = true;
  }
  const fragment = DOMPurify.sanitize(html, {
    ADD_TAGS: ['video', 'source', 'iframe'],
    ADD_ATTR: ['controls', 'autoplay', 'muted', 'loop', 'playsinline', 'preload', 'poster', 'target', 'allow', 'allowfullscreen', 'referrerpolicy', 'loading', 'frameborder', 'data-callout', 'data-collapsible', 'data-link'],
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'object', 'embed'],
    RETURN_DOM_FRAGMENT: true,
  });
  // Files resolve after sanitising (DOMPurify drops the blob: URLs new files use until they are saved), on the
  // elements themselves so code samples that mention src="…" stay as written.
  for (const el of fragment.querySelectorAll<HTMLElement>('img[src], video[src], video[poster], source[src]')) {
    for (const attr of ['src', 'poster']) {
      const value = el.getAttribute(attr);
      if (value) el.setAttribute(attr, resolve(value, images));
    }
  }
  // `?link` images open full size in a new tab, as PostBody.astro wraps them on the built page.
  for (const img of fragment.querySelectorAll<HTMLImageElement>('img[data-link]')) {
    if (img.closest('a')) continue;
    const a = document.createElement('a');
    a.href = img.getAttribute('src') ?? '';
    a.target = '_blank';
    a.rel = 'noopener';
    a.title = img.title || 'Open full size (new tab)';
    img.replaceWith(a);
    a.append(img);
  }
  const slug = slugger();
  const toc: Rendered['toc'] = [];
  for (const h of fragment.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6')) {
    const text = h.textContent ?? '';
    h.id = slug(text);
    const depth = Number(h.tagName[1]);
    if (depth === 2 || depth === 3) toc.push({ depth, slug: h.id, text });
  }
  const box = document.createElement('div');
  box.append(fragment);
  return { html: box.innerHTML, toc };
}
