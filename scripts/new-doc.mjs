#!/usr/bin/env node
/**
 * Scaffolds a new documentation page as a draft.
 *
 *   npm run new-doc                                        (asks for the section and a title)
 *   npm run new-doc -- "Running behind Tailscale" --section general --group "Other platforms"
 *
 * Creates src/content/docs/<section>/<slug>.md with the front matter filled in (`order` after the section's
 * last page) and `draft: true`, and prints what to do next.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const root = new URL('../', import.meta.url).pathname;
const docsDir = `${root}src/content/docs`;

// The sections, read from src/lib/docs-sections.ts so this script and the build agree.
const sectionsSource = readFileSync(`${root}src/lib/docs-sections.ts`, 'utf8');
const sections = [...sectionsSource.matchAll(/\{ id: '([\w-]+)', title: '([^']*)'/g)].map(([, id, title]) => ({ id, title }));

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args.splice(i, 2)[1] : undefined;
};
let section = opt('section');
let group = opt('group');
let title = args.filter((a) => !a.startsWith('--')).join(' ').trim();

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const frontMatter = (file) => readFileSync(file, 'utf8').split('\n---')[0];
const pagesOf = (id) =>
  existsSync(`${docsDir}/${id}`)
    ? readdirSync(`${docsDir}/${id}`)
        .filter((f) => f.endsWith('.md'))
        .map((f) => frontMatter(`${docsDir}/${id}/${f}`))
    : [];

if (!title || !section) {
  const rl = createInterface({ input: stdin, output: stdout });
  if (!section) {
    console.log('Sections:');
    for (const s of sections) console.log(`  ${s.id.padEnd(10)} ${s.title}  (${pagesOf(s.id).length} pages)`);
    section = (await rl.question(`Section [${sections[0].id}]: `)).trim() || sections[0].id;
  }
  title ||= (await rl.question('Title: ')).trim();
  if (group === undefined) {
    const groups = [...new Set(pagesOf(section).map((fm) => fm.match(/^group: (.*)$/m)?.[1].replace(/^["']|["']$/g, '')).filter(Boolean))];
    if (groups.length) console.log(`Groups in ${section}: ${groups.join(', ')}`);
    group = (await rl.question('Group (optional, a sidebar sub-heading): ')).trim();
  }
  rl.close();
}
if (!title) {
  console.error('A title is required.');
  process.exit(1);
}
if (!sections.some((s) => s.id === section)) {
  console.error(`Unknown section "${section}". Sections: ${sections.map((s) => s.id).join(', ')} (declared in src/lib/docs-sections.ts).`);
  process.exit(1);
}

const slug = slugify(title);
if (slug === 'index') {
  console.error('"index" is the section\'s own page; pick another title.');
  process.exit(1);
}
const file = `${docsDir}/${section}/${slug}.md`;
if (existsSync(file)) {
  console.error(`src/content/docs/${section}/${slug}.md already exists. Pick a different title.`);
  process.exit(1);
}

const orders = pagesOf(section).map((fm) => Number(fm.match(/^order: (\d+)$/m)?.[1] ?? 0));
const order = (orders.length ? Math.max(...orders) : 0) + 1;
const q = (s) => (/[:#'"[\]{}&*!|>%@`]|^\s|\s$/.test(s) ? JSON.stringify(s) : s);

writeFileSync(
  file,
  `---
title: ${q(title)}
description: One or two sentences for the section index, search results and the meta description.
section: ${section}
order: ${order}
${group ? `group: ${q(group)}\n` : `# group: Other platforms        # optional sidebar sub-heading; pages with the same group sit together\n`}# updated: ${new Date().toISOString().slice(0, 10)}
# tags: [docker, networking]
draft: true
---

Start with a paragraph that says what this page is for and who it is for.

## First section

Write in plain Markdown. Images go in this folder: ![What it shows](./screenshot.png)

> [!TIP]
> Callouts work too: NOTE, TIP, IMPORTANT, WARNING and CAUTION. Add a title after the type, and \`-\` to
> start it collapsed: \`> [!NOTE]- Only if you use Podman\`.

Link to other pages as \`/docs/${section}/<slug>/\` and to images as \`/images/<name>/\`.
`,
);

console.log(`
Created src/content/docs/${section}/${slug}.md   →  /docs/${section}/${slug}/

Next:
  1. Write the page. Drop images into src/content/docs/${section}/.
  2. npm run dev and open http://localhost:4321/site/docs/${section}/${slug}/ to preview (drafts show in dev).
  3. Remove "draft: true", commit, and open a pull request. The PR gets a preview link.
`);
