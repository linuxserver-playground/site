// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import tailwindcss from '@tailwindcss/vite';
import satteriCallouts from 'satteri-callouts';
import githubDark from '@shikijs/themes/github-dark-high-contrast';
import githubLight from '@shikijs/themes/github-light-high-contrast';
import satteriBasePath from './src/lib/markdown/satteri-base-path.mjs';
import satteriImageLinks from './src/lib/markdown/satteri-image-links.mjs';
import { rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Where the site is served from: GitHub Pages of the linuxserver-playground org, under /site/. The
 * deploy workflow sets SITE_URL and BASE_PATH explicitly; a custom domain changes only these two.
 */
const site = process.env.SITE_URL ?? 'https://linuxserver-playground.github.io';
const base = process.env.BASE_PATH ?? '/site/';

/**
 * Code colours: GitHub's high-contrast themes, so every token keeps the 7:1 (AAA) contrast the rest of the
 * site has. The light theme's comment grey (#66707b, 5:1 on white) is darkened to #4b535d (7.8:1) to pass too.
 */
const codeLight = {
  ...githubLight,
  name: 'lsio-light',
  tokenColors: (githubLight.tokenColors ?? []).map((t) => (t.settings?.foreground?.toLowerCase() === '#66707b' ? { ...t, settings: { ...t.settings, foreground: '#4b535d' } } : t)),
};
const codeDark = { ...githubDark, name: 'lsio-dark' };

/**
 * LinuxServer Labs (PUBLIC_SITE_MODE=labs, src/lib/site.ts) is this site built for the Labs organisation. Labs has no
 * docs, blog, mods, PRoot Apps or stores of its own, so those sections are removed from the build before Pagefind
 * indexes it, and each section's top level redirects to the main site's.
 */
const LABS = process.env.PUBLIC_SITE_MODE === 'labs';
const MAIN_SITE_URL = 'https://linuxserver-playground.github.io/site/';
const MAIN_ONLY = ['about', 'blog', 'contribute', 'docs', 'donate', 'edit', 'mods', 'packages', 'proot-apps', 'stores', 'support'];
/** @param {string} page */
const mainOnly = (page) => MAIN_ONLY.some((s) => page.includes(`${base}${s}/`));
/** @type {import('astro').AstroIntegration} */
const labsTrim = {
  name: 'labs-trim',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const out = fileURLToPath(dir);
      for (const section of MAIN_ONLY) {
        rmSync(join(out, section), { recursive: true, force: true });
        const target = `${MAIN_SITE_URL}${section}/`;
        mkdirSync(join(out, section), { recursive: true });
        writeFileSync(
          join(out, section, 'index.html'),
          `<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>LinuxServer.io</title><meta http-equiv="refresh" content="0; url=${target}"><link rel="canonical" href="${target}"><p>This is on the main LinuxServer.io site: <a href="${target}">${target}</a></p>\n`,
        );
      }
      for (const feed of ['blog.atom', 'blog.rss']) rmSync(join(out, feed), { force: true });
    },
  },
};

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  image: { responsiveStyles: true },
  integrations: [
    react(),
    sitemap({ filter: (page) => !page.includes('/search/') && !page.includes('/edit/') && !(LABS && mainOnly(page)) }),
    ...(LABS ? [labsTrim] : []),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
  markdown: {
    processor: satteri({
      mdastPlugins: [satteriImageLinks()],
      hastPlugins: [satteriCallouts({ theme: 'github' }), satteriBasePath(base)],
    }),
    shikiConfig: {
      themes: { light: codeLight, dark: codeDark },
      defaultColor: false,
      wrap: false,
    },
  },
});
