/**
 * Release notes: the LinuxServer section (GitHub's generated notes) and the upstream section, which is whatever the
 * project publishes, GitHub-flavoured Markdown with raw HTML mixed in or HTML from a feed. Rendered at build time with
 * satteri (GFM: tables, nested lists, bare-URL autolinks) and then sanitised to an allowlist: no scripts, styles,
 * frames, forms, event handlers or non-http(s) URLs survive. GitHub's own references (`@user`, `#123`) are linked
 * when the notes come from a GitHub repository, and bare GitHub issue and pull URLs are shortened the way GitHub
 * shows them. Headings start at h4: the page owns the outline above them.
 */
import { markdownToHtml } from 'satteri';
import sanitizeHtml from 'sanitize-html';

export interface NotesSource {
  /** `owner/repo` on GitHub the notes belong to, for `#123` references; `@user` links need only GitHub. */
  repo?: string | null;
  /** Whether the notes come from GitHub (mentions are GitHub users). */
  github?: boolean;
}

/** `https://github.com/owner/repo/...` -> `owner/repo`. */
export function githubRepo(url: string | null | undefined): string | null {
  const m = url?.match(/^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:[/#?]|$)/);
  return m ? `${m[1]}/${m[2]}` : null;
}

const MENTION = /(^|[\s(\[])@([A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38})(?![\w@./-])/g;
const ISSUE = /(^|[\s(\[])#(\d{1,7})\b/g;

/** Links references in Markdown text, leaving fenced code, inline code, existing links and HTML tags alone. */
function linkReferences(md: string, source: NotesSource): string {
  if (!source.github) return md;
  // Split off the parts that must not change; odd indexes are kept verbatim.
  const parts = md.split(/(```[\s\S]*?```|`[^`\n]*`|\[[^\]\n]*\]\([^)\n]*\)|<[^>\n]*>|https?:\/\/\S+)/g);
  return parts
    .map((part, i) => {
      if (i % 2 === 1) return part;
      let out = part.replace(MENTION, (_, pre, user) => `${pre}[@${user}](https://github.com/${user})`);
      if (source.repo) out = out.replace(ISSUE, (_, pre, n) => `${pre}[#${n}](https://github.com/${source.repo}/issues/${n})`);
      return out;
    })
    .join('');
}

/** GitHub shows a bare issue, pull or compare URL as `#12` / `owner/repo#12` / `a...b`. */
function shortGithubText(href: string, text: string, repo: string | null | undefined): string {
  if (text !== href) return text;
  const m = href.match(/^https:\/\/github\.com\/([\w.-]+\/[\w.-]+)\/(?:pull|issues)\/(\d+)\/?$/);
  if (m) return m[1] === repo ? `#${m[2]}` : `${m[1]}#${m[2]}`;
  const c = href.match(/^https:\/\/github\.com\/([\w.-]+\/[\w.-]+)\/compare\/(\S+)$/);
  if (c) return c[1] === repo ? c[2] : `${c[1]}@${c[2]}`;
  return text;
}

// transformTags runs before the allowlist, so h1-h3 are renamed first and then need not be allowed.
const heading = (level: number) => () => ({ tagName: `h${level}`, attribs: {} });

export function renderNotes(text: string, source: NotesSource = {}): string {
  const html = markdownToHtml(linkReferences(text.replace(/\r\n/g, '\n'), source)).html;
  return sanitizeHtml(html, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags.filter((t) => !['h1', 'h2', 'h3'].includes(t)),
      'img', 'details', 'summary', 'del', 'ins', 'kbd', 'sup', 'sub',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'decoding', 'referrerpolicy'],
      td: ['align', 'colspan', 'rowspan'],
      th: ['align', 'colspan', 'rowspan'],
      details: ['open'],
      ol: ['start'],
      code: ['class'],
    },
    allowedClasses: { code: [/^language-[\w-]+$/] },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['https', 'http'] },
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
    // A relative image would load from this site; only absolute http(s) images are kept.
    exclusiveFilter: (frame) => frame.tag === 'img' && !/^https?:\/\//i.test(frame.attribs.src ?? ''),
    transformTags: {
      h1: heading(4),
      h2: heading(4),
      h3: heading(5),
      h4: heading(6),
      h5: heading(6),
      a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, rel: 'nofollow ugc noopener' } }),
      img: (tagName, attribs) => ({
        tagName,
        // External images: lazy, no referrer, and an alt so a screen reader skips one that has none.
        attribs: { ...attribs, alt: attribs.alt ?? '', loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer' },
      }),
    },
  }).replace(/<a href="([^"]+)" rel="nofollow ugc noopener">([^<]+)<\/a>/g, (all, href: string, inner: string) => {
    const short = shortGithubText(unescape(href), unescape(inner), source.repo);
    return short === unescape(inner) ? all : `<a href="${href}" rel="nofollow ugc noopener">${escape(short)}</a>`;
  });
}

const unescape = (s: string) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
