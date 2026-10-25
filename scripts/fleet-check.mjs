#!/usr/bin/env node
/**
 * Renders the fleet pages and the image and build pages' live panels against the real control plane and
 * hub, from a local preview, and screenshots them.
 *
 *   node scripts/fleet-check.mjs http://localhost:4321/site [outDir]
 *
 * The control plane only allows the deployed site's origin for CORS, so this script answers the
 * browser's cross-origin requests itself: every request to PUBLIC_CONTROL_URL is fetched by Node and
 * replayed with permissive CORS headers (SSE included, replayed as a plain fetch, so the stream shows as
 * "reconnecting"). Nothing is mocked: the data is live. Exits non-zero when a page throws, when a live
 * panel is still loading after 20 s, or when a panel reports the control plane as unreachable.
 */
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const [base, outDir = 'out/fleet-check'] = process.argv.slice(2);
if (!base) {
  console.error('usage: node scripts/fleet-check.mjs <baseUrl> [outDir]');
  process.exit(1);
}
const CONTROL = (process.env.PUBLIC_CONTROL_URL ?? 'https://ci.thelamer.duckdns.org:8443').replace(/\/+$/, '');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.route(`${CONTROL}/**`, async (route) => {
  const req = route.request();
  if (req.url().endsWith('/api/stream')) return route.abort();
  const res = await fetch(req.url(), { method: req.method(), headers: { Accept: 'application/json' } });
  const origin = req.headers()['origin'] ?? new URL(base).origin;
  route.fulfill({
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json', 'access-control-allow-origin': origin, 'access-control-allow-credentials': 'true' },
    body: Buffer.from(await res.arrayBuffer()),
  });
});

const pages = ['/fleet/', '/fleet/?tab=bases', '/fleet/runs/', '/fleet/queue/', '/fleet/builds/', '/fleet/pulls/', '/fleet/issues/', '/fleet/releases/', '/fleet/scheduler/', '/fleet/actions/', ...(process.env.FLEET_EXTRA ?? '').split(',').filter(Boolean)];
let failed = 0;
for (const p of pages) {
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base.replace(/\/$/, '') + p, { waitUntil: 'networkidle' });
  // Every live panel either shows data or an honest state; a skeleton after 20 s is a failure.
  await page.waitForFunction(() => !document.querySelector('[role="status"] .motion-safe\\:animate-pulse'), null, { timeout: 20000 }).catch(() => errors.push('a panel was still loading after 20 s'));
  const offline = await page.locator('[role="alert"]').allInnerTexts();
  if (offline.some((t) => /unavailable/i.test(t))) errors.push(`offline state shown: ${offline.join(' | ').slice(0, 120)}`);
  const file = `${outDir}/${p.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'index'}.png`;
  await page.screenshot({ path: file, fullPage: true });
  console.log(`${errors.length ? '✗' : '✓'} ${p} → ${file}${errors.length ? `\n    ${errors.join('\n    ')}` : ''}`);
  if (errors.length) failed++;
  await page.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
