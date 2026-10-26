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
  /** Images added in the editor and not saved yet: name → object URL. */
  pending: Map<string, string>;
  /** Where the entry's committed images load from: `<rawBase><name>`. */
  rawBase: string;
}

const CALLOUT = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*([^\n]*)\n?/i;
const TITLES: Record<string, string> = { note: 'Note', tip: 'Tip', important: 'Important', warning: 'Warning', caution: 'Caution' };
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** A relative image target in the entry's folder (`./a.png`, `a.png`), resolved for the preview. */
function resolve(url: string, images: PreviewImages): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//') || url.startsWith('#')) return url;
  if (url.startsWith('/')) return url.startsWith(withBase('/')) ? url : withBase(url);
  const name = url.replace(/^\.\//, '');
  return images.pending.get(name) ?? images.rawBase + name;
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

/** Body Markdown → sanitised HTML for the preview pane. Raw HTML in the Markdown is kept within the allowlist. */
export function renderPreview(body: string, images: PreviewImages): string {
  const html = (md ??= make()).parse(body, { async: false }) as string;
  if (!hooked) {
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
    ADD_TAGS: ['video', 'source'],
    ADD_ATTR: ['controls', 'autoplay', 'muted', 'loop', 'playsinline', 'poster', 'target', 'data-callout', 'data-collapsible', 'data-link'],
    FORBID_TAGS: ['style', 'iframe', 'form', 'input', 'button'],
    RETURN_DOM_FRAGMENT: true,
  });
  // Images resolve after sanitising (DOMPurify drops the blob: URLs new images use until they are saved), on the
  // elements themselves so code samples that mention src="…" stay as written.
  for (const el of fragment.querySelectorAll<HTMLElement>('img[src], video[src], video[poster], source[src]')) {
    for (const attr of ['src', 'poster']) {
      const value = el.getAttribute(attr);
      if (value) el.setAttribute(attr, resolve(value, images));
    }
  }
  const box = document.createElement('div');
  box.append(fragment);
  return box.innerHTML;
}
