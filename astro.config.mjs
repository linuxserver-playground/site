// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import tailwindcss from '@tailwindcss/vite';
import satteriCallouts from 'satteri-callouts';
import satteriBasePath from './src/lib/markdown/satteri-base-path.mjs';
import satteriImageLinks from './src/lib/markdown/satteri-image-links.mjs';

/**
 * Where the site is served from: GitHub Pages of the linuxserver-playground org, under /site/. The
 * deploy workflow sets SITE_URL and BASE_PATH explicitly; a custom domain changes only these two.
 */
const site = process.env.SITE_URL ?? 'https://linuxserver-playground.github.io';
const base = process.env.BASE_PATH ?? '/site/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  image: { responsiveStyles: true },
  integrations: [react(), sitemap({ filter: (page) => !page.includes('/search/') })],
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
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      wrap: false,
    },
  },
});
