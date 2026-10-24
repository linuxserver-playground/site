# LinuxServer.io v2 playground: the website

The public website of the [LinuxServer.io v2 playground](https://github.com/linuxserver-playground): home,
the image catalogue with a page for every image, a page for every retained build with the transparent
image explorer (layers, files, packages, init graph, diff), the fleet, package, mods and stores views, the
blog, and the about, support and donate pages. Built with [Astro](https://astro.build), Tailwind CSS and
[shadcn/ui](https://ui.shadcn.com), with no server or database.

Deployed to https://linuxserver-playground.github.io/site/ from `main` by `.github/workflows/deploy.yml`.
It is the evolution of [linuxserver/site](https://github.com/linuxserver/site): same design system, same
blog, but every number now comes from [the hub](https://linuxserver-playground.github.io/hub/) instead of
api.linuxserver.io, Docker Hub and Scarf.

## Quick start

```bash
npm install
npm run data              # refresh src/data/ from the hub (HUB_URL), GitHub and Open Collective
npm run data:local        # the same from a hub checkout at ../hub (its dist/ and out/)
npm run dev               # http://localhost:4321/site/
npm run build             # dist/ plus the Pagefind search index. This is what CI deploys
npm run preview           # serve dist/
npm run check             # TypeScript / Astro diagnostics
```

Writing a blog post? See [CONTRIBUTING.md](CONTRIBUTING.md), or just run `npm run new-post`.

## How it fits together

```
src/
  data/            snapshots of the hub API, GitHub and Open Collective (npm run data). Never hand-edited
    catalog.json     every image in full (ImageDetail)
    images/<name>.json   builds and history, proxy conf, kubernetes manifest, quadlet
    builds/<image>/<tag>.json   the bundle record, its diff and its layer tables
  assets/logos/    image logos, copied locally and optimised to WebP at build time
  assets/team/     team avatars, likewise
  content/
    posts/         one folder per blog post (index.md + images)
    authors/       one YAML file per author
    spotlight.yaml   images that take turns in the weekly spotlight
  lib/             data layer: hub types and URLs, images, builds, fleet, stats, posts, feeds, JSON-LD
    explorer.ts      browser-safe helpers for the explorer islands (gzip fetch, file tree, colours)
  pages/           routes: each gathers its data in the frontmatter and renders the page
  layouts/         Layout.astro: <html>, <head> (via BaseHead), header, footer
  styles/          globals.css: Tailwind, fonts, colour tokens (:root and .dark), utilities, article typography
  components/      Astro components: page header, panels, post cards, image rows, build rows, logos, otters
    islands/       React islands: ⌘K search, catalogue, quick start, install menu, package search, mods browser
    islands/explorer/   treemap, Dockerfile annotator, layer table, init graph, package browser, diff viewer
    ui/            shadcn/ui components (Radix). Do not edit; restyle with `className`
scripts/           data refresh, new-post, brand assets, screenshots, accessibility and overflow checks
```

### Data

The build only reads the JSON snapshots in `src/data/`, so it is fast, deterministic, and keeps working
when the hub is down. `npm run data` refreshes them; the deploy workflow runs it on every build and commits
the result. `HUB_URL` (default `https://linuxserver-playground.github.io/hub`) is both the data source and
the base of every hub link; `--local <hub checkout>` reads `dist/` and `out/` from disk instead, for
development against an unpublished hub. Set `GITHUB_TOKEN` to avoid rate limits and `GITHUB_ORG` to change
whose public members are the team (default `linuxserver-playground`).

| Snapshot | Source | Used for |
| --- | --- | --- |
| `catalog.json` | hub `/api/v1/catalog.json` | catalogue, image pages, quick start snippets, version tags, release channels |
| `images/<name>.json` | hub `/api/v1/catalog/<name>/builds.json`, `proxy.json`, `kubernetes.yaml`, `quadlet.container` | builds table and history, SWAG sample, Kubernetes and quadlet tabs, "Install on…" |
| `builds/<image>/<tag>.json` | hub `/api/v1/catalog/<name>/builds/<tag>.json`, `/diff.json`, `/layers.<arch>.json` | build pages: record, diff, annotated Dockerfile, layer table, init graph |
| `categories.json` | hub `/api/v1/categories.json` | catalogue filters |
| `mods.json` | hub `/api/v1/mods.json` | mods page, mods on image pages |
| `stores.json` | hub `/api/v1/stores/index.json` | stores page, "Install on…" buttons |
| `fleet.json` | hub `/api/v1/fleet/bases.json`, `staleness.json` | fleet page |
| `packages.json` | hub `/api/v1/packages.json` | package search index |
| `hub.json` | hub `/api/v1/status.json` plus `HUB_URL` | hub links, source health on the fleet page |
| `team.json` | GitHub org public members | About page |
| `backers.json` | Open Collective | backer count |
| `stats.json` | hub `/api/v1/stats.json` plus the above | headline numbers |

There are no pull counts anywhere: the playground publishes to GHCR only and the hub has no download
statistics, so the tiles that used to show Docker Hub and Scarf numbers are gone rather than faked.

### How the explorer loads data

Everything on a build page is static from the snapshot except two heavy tables, which the islands fetch
from the hub in the browser, only when their tab is opened, with a loading state and a retry:

- **Files** (the treemap): `files.<arch>.json.gz`, from `{HUB_URL}/builds/<image>/<tag>/` for the newest
  build of each branch (the hub copies it there) and from the GitHub Release asset otherwise. GitHub Pages
  serves it as `application/gzip` without `Content-Encoding`, so the island inflates it with
  `DecompressionStream`. Hardlinks are already deduplicated upstream; the treemap sums regular files only
  and colours them by owning package purl.
- **Packages**: `/api/v1/catalog/<image>/builds/<tag>/packages.<arch>.json`, which the hub serves for the
  newest build of each branch; older builds link to the syft document on their Release.
- The fleet-wide **package search** keeps only the index in the snapshot and fetches
  `/api/v1/packages/<slug>.json` when a package is selected.

The hub sends `Access-Control-Allow-Origin: *`, so these cross-origin fetches need nothing on our side.
Live build status is never embedded: build pages link to the control plane and to the hub's rendered test
report (`{HUB_URL}/builds/<image>/<tag>/`), as CONVENTIONS.md §10 prescribes.

### Pages

| URL | |
| --- | --- |
| `/` | home: stats, latest builds, weekly spotlight, rankings, blog |
| `/images/` | searchable, filterable catalogue (state in the query string, e.g. `?category=Games&sort=stars`) |
| `/images/<name>/` | every image, deprecated ones included: quick start (compose, docker run, Kubernetes, quadlet), "Install on…", setup, parameters, version tags with their latest build, builds, mods, SWAG sample, changelog |
| `/images/<name>/builds/<tag>/` | one retained build: record, platforms, tests, diff to the previous build, annotated Dockerfile, layer table, init graph, file treemap, packages, config and labels, release notes |
| `/fleet/` | base images and their digests, builds behind their base, every retained build, hub health |
| `/packages/` | fleet-wide package search (`?q=musl&type=apk`) |
| `/mods/` | the mods index with text and per-image filters (`?image=sonarr`) |
| `/stores/` | every store and generated artefact with its import URL and how-to |
| `/blog/`, `/blog/page/<n>/`, `/blog/<slug>/`, `/blog/tags/`, `/blog/authors/<id>/` | blog |
| `/search/?q=` | full-text search (Pagefind) |
| `/about/`, `/support/`, `/donate/` | |
| `/blog/rss.xml`, `/blog/atom.xml` | feeds |
| `/search-index.json` | index for the ⌘K palette |

### Design

Raft: dark-first, technical, product-grade. Geist for UI, Geist Mono for every number, version and date,
hairline panels (`raft-panel`) and the logo gradient used as light, never as text. The colour tokens and
their contrast ratios are at the top of `src/styles/globals.css`.

- **Content is real.** Use the data layer and `lib/site.ts`. Never invent stats, quotes, testimonials or features.
  Where the hub lacks a number, omit the tile.
- **Stats are honest.** Use `stat.<x>.value`, `.label`, `.long` and `.source`.
- **Every internal href goes through `withBase()`** (`lib/base.ts`); the site is served under `/site/`.
- **Accessibility (WCAG 2.2 AA everywhere, AAA contrast for text):** one `<h1>` per page and no skipped heading levels;
  landmarks (`header`, `nav[aria-label]`, `main#main`, `footer`); visible focus; `aria-current="page"` in nav;
  text contrast ≥ 7:1 (≥ 4.5:1 for large/UI text); no information by colour alone (the treemap and the init
  graph carry their data in text lists too); respect `prefers-reduced-motion`; images have `alt`; external
  links that open new tabs say so to screen readers; everything works by keyboard, SVG nodes included.
- **SEO:** pass `title`, `description`, `breadcrumbs` and `jsonLd` (`lib/jsonld.ts`) to the Layout. Use real `<a href>`
  links for everything navigational; islands must server-render a useful initial state.
- **Performance:** no client JS unless it earns it (`client:idle` for header widgets, `client:visible` below the fold,
  `client:load` only for above-the-fold interactivity); heavy data fetched on demand; images through `astro:assets`.
- **Responsive and themed:** check 390px, 768px, 1280px and 1440px wide with no horizontal scroll, in light and dark.
  Wide tables, code and the init graph scroll inside their panel; the treemap scales to its container.

### Quality checks

```bash
npm run check                                                      # TypeScript / Astro diagnostics
node scripts/a11y.mjs http://localhost:4321/site                   # axe-core, WCAG 2.2 A/AA/AAA, light + dark
node scripts/test-search.mjs http://localhost:4321/site            # the ⌘K palette end to end
node scripts/shot.mjs http://localhost:4321/site/ out.png --full   # screenshot (--light, --mobile)
node scripts/overflow.mjs http://localhost:4321/site/fleet/        # finds horizontal overflow at 390px
```

`npx playwright install chromium` once for the browser-based checks.
