#!/usr/bin/env node
/**
 * Drives the website editor in Chromium against a fake control plane, from a local preview:
 *
 *   node scripts/editor-check.mjs http://localhost:4321/site [outDir]
 *
 * The control plane's editor routes (control/editor.py) are answered here from an in-memory site repo, so every
 * state can be reached without a GitHub token: the pages as a reader and as an editor (Edit, Delete, open edits,
 * New post, New page), deleting a post, a new post written with the details form, an image, a video and a
 * YouTube embed, the exact Preview, a save (and the request it sends), a conflict, the pull request, joining
 * someone else's edit, a docs page, and discarding. Each state gets axe (WCAG A to AAA, light and dark) at 1280px
 * and a 390px overflow check, and a screenshot in outDir. Exits non-zero on any failure.
 */
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const [base, outDir = 'out/editor-check'] = process.argv.slice(2);
if (!base) {
  console.error('usage: node scripts/editor-check.mjs <baseUrl> [outDir]');
  process.exit(1);
}
const CONTROL = (process.env.PUBLIC_CONTROL_URL ?? 'https://ci.thelamer.duckdns.org:8443').replace(/\/+$/, '');
const DOC = 'src/content/docs/general/swag.md';
const POST = 'src/content/posts/securing-swag/index.md';
const AVATAR = 'https://avatars.githubusercontent.com/u/1';
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
mkdirSync(outDir, { recursive: true });

/** The fake: who is signed in, whether they may edit and have authorised, and the repo's branches. */
function fakeControl() {
  const state = {
    me: { authenticated: true, login: 'octocat', avatar_url: AVATAR, member: true, checked_at: new Date().toISOString(), csrf: 'csrf-1' },
    canEdit: true,
    authorized: true,
    files: {
      main: {
        [DOC]: '---\ntitle: SWAG setup\ndescription: Reverse proxy with SWAG.\nsection: general\n---\n\nOld body.\n',
        [POST]: '---\ntitle: Securing SWAG\ndate: 2025-01-02\ntags: [swag]\n---\n\nOld post.\n',
        'src/content/posts/securing-swag/hero.png': 'png',
      },
    },
    heads: { main: 'c0' },
    saves: [],
    uploads: [],
    deletes: [],
    pulls: [],
    conflictNext: false,
  };
  const keyOf = (path) => (path.startsWith('src/content/docs/') ? `docs/${path.slice(17, -3)}` : `posts/${path.split('/')[3]}`);
  const branchesOf = (key) => Object.keys(state.heads).filter((b) => b.startsWith('edit/') && b.endsWith(`/${key}`));
  const pending = () =>
    Object.keys(state.heads)
      .filter((b) => b.startsWith('edit/'))
      .map((b) => {
        const [, owner, ...rest] = b.split('/');
        const key = rest.join('/');
        const path = key.startsWith('docs/') ? `src/content/${key}.md` : `src/content/${key}/index.md`;
        const text = state.files[b]?.[path];
        const live = state.files.main[path] !== undefined;
        const pull = state.pulls.find((p) => p.branch === b && p.open) ?? null;
        return { path, kind: key.startsWith('docs/') ? 'doc' : 'post', key, branch: b, owner, change: text === undefined ? 'delete' : live ? 'edit' : 'new', title: text?.match(/title: "?([^"\n]+)/)?.[1] ?? null, head: state.heads[b], updated_at: new Date().toISOString(), pull };
      });
  const entry = (path, asked) => {
    const key = keyOf(path);
    const work = asked ?? `edit/octocat/${key}`;
    const onBranch = work in state.heads;
    const ref = onBranch ? work : 'main';
    const content = state.files[ref]?.[path];
    const folder = path.replace(/\/[^/]+$/, '');
    return {
      path,
      kind: path.includes('/docs/') ? 'doc' : 'post',
      key,
      exists: content !== undefined,
      published: state.files.main[path] !== undefined,
      content: content ?? '',
      branch: work,
      owner: work.split('/')[1],
      on_branch: onBranch,
      base: 'main',
      head: state.heads[ref],
      images: Object.keys(state.files[ref] ?? {}).filter((f) => f.startsWith(`${folder}/`) && /\.(png|jpe?g|gif|webp)$/.test(f)).map((f) => f.split('/').pop()),
      media: [],
      media_url: key.startsWith('posts/') ? `/media/${key.slice(6)}/` : `/media/${key}/`,
      raw_base: `https://raw.githubusercontent.com/linuxserver-playground/site/${state.heads[ref]}/${folder}/`,
      raw_root: `https://raw.githubusercontent.com/linuxserver-playground/site/${state.heads[ref]}/`,
      others: branchesOf(key).filter((b) => b !== work),
      pull: state.pulls.find((p) => p.branch === work && p.open) ?? null,
    };
  };
  const answer = (req) => {
    const url = new URL(req.url());
    const p = url.pathname;
    if (p === '/api/me') return [200, state.me];
    if (p === '/api/editor/status') return [200, { authenticated: state.me.authenticated, member: state.me.member, login: state.me.login, can_edit: state.me.member && state.canEdit, authorized: state.authorized, repo: 'linuxserver-playground/site', base: 'main' }];
    if (p === '/api/editor/pending') return [200, { edits: pending() }];
    if (!state.authorized) return [428, { detail: 'authorise the editor first' }];
    const get = (k) => url.searchParams.get(k);
    if (p === '/api/editor/entry') return [200, entry(get('path'), get('branch'))];
    if (p === '/api/editor/removal') return [200, { path: get('path'), branch: get('branch') ?? `edit/octocat/${keyOf(get('path'))}`, title: 'Securing SWAG', files: [get('path'), 'src/content/posts/securing-swag/hero.png'] }];
    const body = req.postDataJSON?.() ?? {};
    if (req.headers()['x-csrf-token'] !== state.me.csrf) return [403, { detail: 'bad CSRF token' }];
    if (p === '/api/editor/upload') {
      state.uploads.push(body.name);
      const video = /\.(mp4|webm)$/.test(body.name);
      const sha = `${state.uploads.length}`.padStart(40, 'a');
      return [200, { name: body.name, kind: video ? 'video' : 'image', sha, target: '', url: video ? `/media/x/${body.name}` : `./${body.name}` }];
    }
    const e = entry(body.path, body.branch);
    if (p === '/api/editor/save') {
      if (state.conflictNext) {
        state.conflictNext = false;
        return [409, { detail: `${e.branch} moved since you loaded it (saved elsewhere?); reload to see it` }];
      }
      state.saves.push(body);
      const head = `c${state.saves.length}`;
      const folder = body.path.replace(/\/[^/]+$/, '');
      const added = Object.fromEntries((body.files ?? []).filter((f) => !/\.(mp4|webm)$/.test(f.name)).map((f) => [`${folder}/${f.name}`, 'file']));
      state.files[e.branch] = { ...(state.files[e.on_branch ? e.branch : 'main'] ?? {}), ...added, [body.path]: body.content };
      state.heads[e.branch] = head;
      return [200, { ok: true, action_id: state.saves.length, detail: `saved ${e.key}`, branch: e.branch, head, commit_url: `https://github.com/x/commit/${head}` }];
    }
    if (p === '/api/editor/publish') {
      const pull = { number: state.pulls.length + 1, title: `Add the post "${body.title}"`, url: 'https://github.com/x/pull/1', branch: e.branch, draft: false, checks: 'pending', updated_at: new Date().toISOString(), open: true };
      state.pulls.push(pull);
      return [200, { ok: true, action_id: 9, detail: 'opened', pull }];
    }
    if (p === '/api/editor/delete') {
      state.deletes.push(body);
      const pull = { number: state.pulls.length + 1, title: `Delete the post "${body.title}"`, url: 'https://github.com/x/pull/2', branch: e.branch, draft: false, checks: 'pending', updated_at: new Date().toISOString(), open: true };
      state.pulls.push(pull);
      return [200, { ok: true, action_id: 11, detail: 'proposed', pull }];
    }
    if (p === '/api/editor/discard') {
      for (const x of state.pulls) if (x.branch === e.branch) x.open = false;
      delete state.heads[e.branch];
      return [200, { ok: true, action_id: 10, detail: 'discarded' }];
    }
    return [404, { detail: `no fake for ${p}` }];
  };
  return { state, answer };
}

const browser = await chromium.launch();
let failures = 0;
const fail = (msg) => {
  failures++;
  console.error(`FAIL ${msg}`);
};

async function context(fake, width = 1280) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  await ctx.route(`${CONTROL}/**`, async (route) => {
    const req = route.request();
    const origin = req.headers()['origin'] ?? new URL(base).origin;
    const cors = { 'access-control-allow-origin': origin, 'access-control-allow-credentials': 'true', 'access-control-allow-headers': 'Content-Type, X-CSRF-Token', 'access-control-allow-methods': 'GET, POST, OPTIONS' };
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    if (req.url().endsWith('/api/stream')) return route.abort();
    const [status, body] = fake.answer(req);
    route.fulfill({ status, headers: { ...cors, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  });
  for (const host of ['https://raw.githubusercontent.com/**', 'https://avatars.githubusercontent.com/**']) {
    await ctx.route(host, (route) => route.fulfill({ status: 200, contentType: 'image/png', body: PNG }));
  }
  await ctx.route('https://www.youtube-nocookie.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>video</title>' }));
  const page = await ctx.newPage();
  page.on('pageerror', (e) => fail(`page error: ${e.message}`));
  return { ctx, page };
}

async function audit(page, name) {
  for (const scheme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: scheme });
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag22aa']).exclude('iframe').analyze();
    for (const v of r.violations) fail(`${name} (${scheme}): ${v.id}: ${v.help} — ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  }
  await page.emulateMedia({ colorScheme: 'light' });
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: false });
  const width = page.viewportSize().width;
  await page.setViewportSize({ width: 390, height: 844 });
  const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
  if (scroll > 390) fail(`${name}: scroll width ${scroll} at 390px`);
  await page.screenshot({ path: `${outDir}/${name}-390.png`, fullPage: false });
  await page.setViewportSize({ width, height: 900 });
  console.log(`ok ${name}`);
}

const go = (page, path) => page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
const must = async (locator, what, timeout = 5000) => {
  try {
    await locator.first().waitFor({ timeout });
    return true;
  } catch {
    fail(what);
    return false;
  }
};
const pick = async (page, button, files) => {
  const chooser = page.waitForEvent('filechooser');
  await button();
  await (await chooser).setFiles(files);
};

// Readers see the pages as they are.
{
  const fake = fakeControl();
  fake.state.me = { authenticated: false, login: null, avatar_url: null, member: false, checked_at: null, csrf: null };
  const { ctx, page } = await context(fake);
  await go(page, '/blog/securing-swag/');
  if (await page.getByRole('region', { name: /Editing this post/ }).count()) fail('reader: the editing bar shows');
  await go(page, '/edit/?post=securing-swag');
  await must(page.getByRole('heading', { name: 'Sign in to edit' }), 'signed out: no sign-in prompt');
  await go(page, '/edit/');
  await must(page.getByRole('heading', { name: 'Open the editor from a page' }), 'bare /edit/: no pointer back to the pages');
  await ctx.close();
}

// Editors: the bars on the pages, open edits, and deleting a post.
{
  const fake = fakeControl();
  fake.state.files['edit/alice/posts/securing-swag'] = { ...fake.state.files.main, [POST]: '---\ntitle: Securing SWAG, again\n---\nAlice.\n' };
  fake.state.heads['edit/alice/posts/securing-swag'] = 'c9';
  fake.state.files['edit/bob/posts/webtop-9'] = { 'src/content/posts/webtop-9/index.md': '---\ntitle: Webtop 9\n---\nSoon.\n' };
  fake.state.heads['edit/bob/posts/webtop-9'] = 'c8';
  fake.state.files['edit/bob/docs/general/new-thing'] = { 'src/content/docs/general/new-thing.md': '---\ntitle: New thing\n---\n' };
  fake.state.heads['edit/bob/docs/general/new-thing'] = 'c7';
  const { ctx, page } = await context(fake);

  await go(page, '/blog/securing-swag/');
  const bar = page.getByRole('region', { name: 'Editing this post' });
  if (await must(bar, 'post: no editing bar for an editor', 8000)) {
    const edit = bar.getByRole('link', { name: /^Edit/ });
    if (!(await edit.getAttribute('href'))?.includes('branch=edit%2Falice%2Fposts%2Fsecuring-swag')) fail('post: Edit does not join the open edit');
    await must(bar.getByText(/edit by @alice/), 'post: the open edit is not listed');
    await audit(page, 'post-editor');
    await bar.getByRole('button', { name: 'Delete' }).click();
    await must(bar.getByText('src/content/posts/securing-swag/hero.png'), 'delete: the files are not listed');
    await audit(page, 'post-delete-confirm');
    await bar.getByRole('button', { name: 'Delete in a pull request' }).click();
    await must(bar.getByText(/deletion is proposed in pull request #1/), 'delete: no pull request shown');
    if (fake.state.deletes[0]?.branch !== 'edit/alice/posts/securing-swag') fail(`delete: went to ${fake.state.deletes[0]?.branch}`);
  }

  await go(page, '/blog/');
  const blog = page.getByRole('region', { name: 'Editing the blog' });
  if (await must(blog, 'blog: no editing bar', 8000)) {
    await must(blog.getByRole('link', { name: 'New post' }), 'blog: no New post');
    await must(blog.getByText('Webtop 9'), 'blog: the unpublished post is not listed');
    await audit(page, 'blog-editor');
  }

  await go(page, '/docs/selkies/');
  await must(page.getByRole('link', { name: /New page in / }), 'section: no New page under its sub-headings', 8000);
  await go(page, '/docs/general/');
  const section = page.getByRole('region', { name: /Editing How to/ });
  if (await must(section, 'section: no editing bar', 8000)) {
    if (!(await section.getByRole('link', { name: 'New page' }).getAttribute('href'))?.includes('new=doc&section=general')) fail('section: New page does not name the section');
    await must(section.getByText('New thing'), 'section: the unpublished page is not listed');
    await audit(page, 'section-editor');
  }
  await ctx.close();
}

// A new post: details, an image, a video, YouTube, Preview, save, conflict, pull request, discard.
{
  const fake = fakeControl();
  const { ctx, page } = await context(fake);
  await go(page, '/edit/?new=post');
  await page.getByLabel('Title').fill('Webtop 7 is here');
  if ((await page.getByLabel('Address').inputValue()) !== 'webtop-7-is-here') fail('new post: address not derived from the title');
  await audit(page, 'new-post');
  await page.getByRole('button', { name: 'Start writing' }).click();
  await page.waitForURL(/\?post=webtop-7-is-here&title=/);
  await page.locator('.cm-content').waitFor();
  const quick = page.getByRole('region', { name: 'Quick preview' });

  await page.getByLabel('Description').first().fill('Everything new in Webtop 7.');
  await page.getByLabel('Tags').fill('webtop');
  await page.keyboard.press('Enter');
  await page.locator('.cm-content').click();
  await page.keyboard.press('Control+End');
  await page.keyboard.type('\n> [!TIP]\n> Use **compose**.\n');
  await must(quick.locator('.callout[data-callout="tip"]'), 'preview: callout not rendered');

  await page.getByRole('button', { name: 'Insert' }).click();
  await pick(page, () => page.getByRole('button', { name: 'Image', exact: true }).click(), { name: 'Hero Shot.PNG', mimeType: 'image/png', buffer: PNG });
  await must(quick.locator('img[src^="blob:"]'), 'preview: the new image does not show');
  await page.getByRole('button', { name: 'Insert' }).click();
  await pick(page, () => page.getByRole('button', { name: /^Video/ }).click(), { name: 'demo.mp4', mimeType: 'video/mp4', buffer: Buffer.from('fake video') });
  await must(quick.locator('video[src^="blob:"]'), 'preview: the new video does not show');
  await page.getByRole('button', { name: 'Insert' }).click();
  await page.getByRole('button', { name: 'YouTube video' }).click();
  await page.getByLabel('YouTube link').fill('https://youtu.be/aZD8n5R6-W4');
  await page.getByRole('button', { name: 'Insert the video' }).click();
  await must(quick.locator('iframe[src="https://www.youtube-nocookie.com/embed/aZD8n5R6-W4"]'), 'preview: the YouTube embed does not show');
  await page.getByLabel('Hero image').selectOption('hero-shot.png');
  await page.waitForFunction(() => !document.body.innerText.includes('(uploading…)'), null, { timeout: 5000 }).catch(() => fail('upload: still uploading'));
  await audit(page, 'writing');

  await page.getByRole('button', { name: 'Preview' }).click();
  const article = page.locator('article').first();
  await must(article.getByRole('heading', { level: 1, name: 'Webtop 7 is here' }), 'preview: no post title');
  await must(article.getByRole('link', { name: '#webtop' }), 'preview: the tag is not shown as on the site');
  await must(article.locator('header img[src^="blob:"]'), 'preview: the hero is not shown');
  await must(article.getByText('dated when it is published'), 'preview: no date line');
  await audit(page, 'preview');
  await page.getByRole('button', { name: 'Write' }).click();

  await page.getByRole('button', { name: 'Save' }).click();
  await must(page.getByText(/Saved to edit\/octocat\/posts\/webtop-7-is-here/), 'save: no confirmation');
  const saved = fake.state.saves[0];
  if (!saved) fail('save: nothing was posted');
  else {
    if (saved.head !== 'c0') fail(`save: sent head ${saved.head}`);
    if (!saved.content.includes('Use **compose**.') || !/description: "?Everything new in Webtop 7\./.test(saved.content)) fail(`save: the text or details are missing: ${saved.content.slice(0, 300)}`);
    if (!saved.content.includes('hero: ./hero-shot.png') || !saved.content.includes('- webtop')) fail('save: the hero or tags are missing');
    if (!saved.content.includes('\n\n![hero shot](./hero-shot.png?link)')) fail('save: the image is not its own paragraph');
    if (!saved.content.includes('src="/media/webtop-7-is-here/demo.mp4"')) fail('save: the video is not referenced from its media folder');
    if (!saved.content.includes('youtube-nocookie.com/embed/aZD8n5R6-W4')) fail('save: no YouTube embed');
    if (JSON.stringify(saved.files?.map((f) => f.name)) !== '["hero-shot.png","demo.mp4"]') fail(`save: files ${JSON.stringify(saved.files)}`);
  }

  await page.locator('.cm-content').click();
  await page.keyboard.type('More.');
  fake.state.conflictNext = true;
  await page.keyboard.press('Control+s');
  if (await must(page.getByRole('button', { name: 'Reload the entry' }), 'conflict: no reload offer')) {
    await audit(page, 'conflict');
    await page.getByRole('button', { name: 'Reload the entry' }).click();
    if (await must(page.getByRole('button', { name: 'Restore it' }), 'conflict: the kept text is not offered back')) {
      await page.getByRole('button', { name: 'Restore it' }).click();
      await page.getByRole('button', { name: 'Save' }).click();
      await must(page.getByText(/^Saved to/), 'save after restore: no confirmation');
    }
  }
  if (fake.state.saves.length !== 2 || fake.state.saves[1].head !== 'c1') fail(`save after restore: ${JSON.stringify(fake.state.saves.map((s) => s.head))}`);

  await page.getByRole('button', { name: 'Open pull request' }).click();
  await must(page.getByText(/Pull request #1 is open/), 'publish: no pull request shown');
  await audit(page, 'published');
  await page.getByRole('button', { name: 'Discard' }).click();
  await page.getByRole('button', { name: 'Discard the edit' }).click();
  await page.waitForLoadState('networkidle');
  if (fake.state.pulls[0]?.open) fail('discard: the pull request is still open');
  await ctx.close();
}

// Joining someone else's edit, and a docs page.
{
  const fake = fakeControl();
  fake.state.files['edit/alice/docs/general/swag'] = { ...fake.state.files.main, [DOC]: '---\ntitle: SWAG by Alice\ndescription: x\nsection: general\n---\nAlice.\n' };
  fake.state.heads['edit/alice/docs/general/swag'] = 'c5';
  const { ctx, page } = await context(fake);
  await go(page, '/edit/?doc=general/swag');
  await must(page.getByRole('link', { name: 'Join it' }), 'doc: the open edit is not offered');
  await page.getByRole('link', { name: 'Join it' }).click();
  await must(page.getByText(/You are working in @alice's edit/), 'join: not working in the open edit');
  await page.locator('summary', { hasText: 'Details' }).click();
  await page.getByLabel('Title').fill('SWAG, by both of us');
  await page.getByRole('button', { name: 'Save' }).click();
  await must(page.getByText(/^Saved to edit\/alice\/docs\/general\/swag/), 'join: the save did not go onto the open edit');
  if (fake.state.saves[0]?.branch !== 'edit/alice/docs/general/swag') fail(`join: saved to ${fake.state.saves[0]?.branch}`);
  await page.getByRole('button', { name: 'Preview' }).click();
  await must(page.getByRole('navigation', { name: 'Documentation sections' }), 'doc preview: no docs sidebar');
  await audit(page, 'doc-preview');
  await page.getByRole('button', { name: 'Write' }).click();
  await page.getByRole('button', { name: 'Advanced editor' }).click();
  await page.locator('.cm-content').click();
  await page.keyboard.press('Control+Home');
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowDown'); // to the section: line
  await page.keyboard.press('End');
  await page.keyboard.type('x');
  await must(page.getByText(/section must be general/), 'front matter: a wrong section is not reported');
  await audit(page, 'doc-problem');
  await ctx.close();
}

await browser.close();
if (failures) {
  console.error(`${failures} failure(s)`);
  process.exit(1);
}
console.log('editor check passed');
