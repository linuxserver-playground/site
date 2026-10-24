/**
 * A deliberately small Markdown renderer for short API strings (setup instructions, changelog entries,
 * mod summaries): paragraphs, `code`, **bold**, *italics*, [links](url) and bullet lists. Everything is
 * HTML-escaped first; URLs are limited to http(s), mailto and in-page anchors.
 */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const safeUrl = (u: string) => (/^(https?:\/\/|mailto:|#|\/)/i.test(u) ? u : '#');

export function inlineMarkdown(s: string): string {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, url) => {
      const href = safeUrl(url);
      const ext = /^https?:/i.test(href);
      return `<a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${text}${ext ? '<span class="sr-only"> (opens in a new tab)</span>' : ''}</a>`;
    });
}

/** Paragraphs and simple `- ` / `* ` / `1. ` lists; fenced code blocks are kept verbatim. */
export function blockMarkdown(s: string): string {
  const out: string[] = [];
  const blocks = s.replace(/\r\n/g, '\n').split(/\n{2,}/);
  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;
    const fence = block.match(/^```\w*\n([\s\S]*?)\n```$/);
    if (fence) {
      out.push(`<pre><code>${esc(fence[1])}</code></pre>`);
      continue;
    }
    const lines = block.split('\n');
    if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
      out.push(`<ul>${lines.map((l) => `<li>${inlineMarkdown(l.replace(/^\s*[-*]\s+/, ''))}</li>`).join('')}</ul>`);
      continue;
    }
    if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
      out.push(`<ol>${lines.map((l) => `<li>${inlineMarkdown(l.replace(/^\s*\d+[.)]\s+/, ''))}</li>`).join('')}</ol>`);
      continue;
    }
    const heading = block.match(/^(#{1,6})\s+(.*)$/);
    if (heading && lines.length === 1) {
      // Headings inside API text become bold paragraphs: the page owns the heading outline.
      out.push(`<p><strong>${inlineMarkdown(heading[2])}</strong></p>`);
      continue;
    }
    out.push(`<p>${inlineMarkdown(lines.join(' '))}</p>`);
  }
  return out.join('\n');
}
