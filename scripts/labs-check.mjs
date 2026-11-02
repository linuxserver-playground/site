#!/usr/bin/env node
/**
 * Checks the Labs site's live part, the open proposals on /proposals/ (src/components/islands/Proposals.tsx), against
 * a fake control plane, from a local preview of a Labs-mode build (PUBLIC_SITE_MODE=labs):
 *
 *   node scripts/labs-check.mjs http://localhost:4321/site [outDir]
 *
 * `/api/me` and `/api/issues.json` are answered here, on whatever host the build's PUBLIC_CONTROL_URL names, so the
 * signed-in states can be reached before Labs control has a sign-in: signed out and signed in as a non-member (the
 * section must not exist), a member (the proposals repository's open issues only, axe in light and dark, 390px
 * overflow), a member with no open proposal, and a member whose control plane is down (the offline state). The
 * public "in review" list is on the page in every state, and the home page carries no proposals for anyone. A
 * screenshot of each state goes to outDir. Exits non-zero on any failure.
 */
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const [base, outDir = 'out/labs-check'] = process.argv.slice(2);
if (!base) {
  console.error('usage: node scripts/labs-check.mjs <baseUrl> [outDir]');
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const ORG = 'linuxserverlabs-playground';
const hoursAgo = (h) => new Date(Date.now() - h * 3600_000).toISOString();
const ANON = { authenticated: false, login: null, avatar_url: null, member: false, checked_at: null, csrf: null };
const AVATAR = 'https://avatars.githubusercontent.com/u/1';
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
const signedIn = (member) => ({ authenticated: true, login: 'octocat', avatar_url: AVATAR, member, checked_at: hoursAgo(0), csrf: 'csrf-1' });
const issue = (repo, number, title, labels, h) => ({
  repo,
  number,
  title,
  author: 'someone',
  state: 'open',
  labels,
  html_url: `https://github.com/${repo}/issues/${number}`,
  created_at: hoursAgo(h),
  updated_at: hoursAgo(h),
});
const ISSUES = {
  issues: [
    issue(`${ORG}/proposals`, 3, 'Proposal: photocraft', ['proposal', 'meets-bar'], 5),
    issue(`${ORG}/proposals`, 4, 'Proposal: a much longer application name that has to wrap on a phone screen', ['proposal', 'needs-info'], 30),
    issue(`${ORG}/docker-photocraft`, 9, 'Not a proposal: an image issue', [], 2),
  ],
};

let failures = 0;
const fail = (m) => {
  failures++;
  console.log(`FAIL ${m}`);
};

const browser = await chromium.launch();

/** A page whose control plane answers `me` and `issues` (a status and body each). */
async function open(scheme, me, issues, path = '/proposals/') {
  const ctx = await browser.newContext({ colorScheme: scheme, viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript((t) => localStorage.setItem('theme', t), scheme);
  await ctx.route(/\/api\/(me|issues\.json|stream)(\?.*)?$/, (route) => {
    const req = route.request();
    const origin = req.headers()['origin'] ?? new URL(base).origin;
    const cors = { 'access-control-allow-origin': origin, 'access-control-allow-credentials': 'true' };
    if (req.url().includes('/api/stream')) return route.abort();
    const [status, body] = req.url().includes('/api/me') ? [200, me] : issues;
    return route.fulfill({ status, headers: { ...cors, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  });
  await ctx.route('https://avatars.githubusercontent.com/**', (route) => route.fulfill({ status: 200, contentType: 'image/png', body: PNG }));
  const page = await ctx.newPage();
  page.on('pageerror', (e) => fail(`page error: ${e.message}`));
  await page.goto(`${base.replace(/\/$/, '')}${path}`, { waitUntil: 'networkidle' });
  return { ctx, page };
}

async function audit(page, name, scheme) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
  for (const v of r.violations) fail(`${name} (${scheme}): ${v.id}: ${v.help} — ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
  await page.setViewportSize({ width: 390, height: 844 });
  const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
  if (scroll > 390) fail(`${name}: scroll width ${scroll} at 390px`);
  await page.setViewportSize({ width: 1280, height: 900 });
}

const section = (page) => page.locator('section[aria-labelledby="proposals"]');
const shot = async (page, name) => {
  const s = section(page);
  if (await s.count()) await s.screenshot({ path: `${outDir}/${name}.png` });
};

// Nothing at all for anyone who is not a signed-in member; the images in review are public.
for (const [name, me] of [['signed-out', ANON], ['non-member', signedIn(false)]]) {
  const { ctx, page } = await open('light', me, [200, ISSUES]);
  await page.waitForTimeout(500);
  if (!(await page.locator('section[aria-labelledby="pending"]').count())) fail(`${name}: the in-review section is missing`);
  if (await section(page).count()) fail(`${name}: the proposals section is shown`);
  if (await page.getByText('Open proposals').count()) fail(`${name}: proposal text is shown`);
  else console.log(`ok ${name}: nothing shown`);
  await ctx.close();
}

// The home page links to the proposals page and carries neither list, signed in or not.
{
  const { ctx, page } = await open('light', signedIn(true), [200, ISSUES], '/');
  await page.waitForTimeout(500);
  if (await section(page).count()) fail('home, member: the proposals section is on the home page');
  if (await page.locator('section[aria-labelledby="pending"]').count()) fail('home: the in-review section is on the home page');
  if (!(await page.locator('main a[href$="/proposals/"]').count())) fail('home: no link to /proposals/');
  if (!(await page.locator('main a[href$="/propose/"]').count())) fail('home: no link to /propose/');
  else console.log('ok home: links to /proposals/ and /propose/, no lists');
  await ctx.close();
}

// A member sees the proposals repository's open issues, and nothing from other repositories.
for (const scheme of ['light', 'dark']) {
  const { ctx, page } = await open(scheme, signedIn(true), [200, ISSUES]);
  try {
    await section(page).locator('li').first().waitFor({ timeout: 5000 });
  } catch {
    fail(`member (${scheme}): no proposal listed`);
  }
  const items = await section(page).locator('li').count();
  if (items !== 2) fail(`member (${scheme}): ${items} items listed, expected 2`);
  if (await section(page).getByText('Not a proposal').count()) fail(`member (${scheme}): an issue from another repository is listed`);
  if (!(await section(page).getByText('meets the bar').count())) fail(`member (${scheme}): the meets-bar label is missing`);
  await audit(page, 'member', scheme);
  await shot(page, `member-${scheme}`);
  console.log(`ok member (${scheme}): ${items} proposals`);
  await ctx.close();
}

{
  const { ctx, page } = await open('light', signedIn(true), [200, { issues: [] }]);
  if (!(await section(page).getByText('No proposal is open right now.').count())) fail('member, none open: no empty state');
  else console.log('ok member, none open: empty state');
  await shot(page, 'member-empty');
  await ctx.close();
}

{
  const { ctx, page } = await open('light', signedIn(true), [503, { detail: 'down' }]);
  if (!(await section(page).getByRole('alert').count())) fail('member, control down: no offline state');
  else console.log('ok member, control down: offline state');
  await audit(page, 'offline', 'light');
  await shot(page, 'member-offline');
  await ctx.close();
}

await browser.close();
console.log(failures ? `${failures} failure(s)` : 'all passed');
process.exit(failures ? 1 : 0);
