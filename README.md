# LinuxServer.io v2 playground: the website

The public website of the [LinuxServer.io v2 playground](https://github.com/linuxserver-playground): home,
the image catalogue with a page for every image, a page for every retained build with its CI report and the
transparent image explorer (files, packages, annotated Dockerfile, init graph, diff), the fleet section
(board, runs, queue, builds, pull requests, issues, releases, scheduler and member actions, live from the
control plane), the package, mods and stores views, the blog, the documentation, and the about, support and
donate pages. Built with [Astro](https://astro.build), Tailwind CSS and [shadcn/ui](https://ui.shadcn.com),
with no server or database of its own: the single pane of glass over the hub's static API and the control
plane's JSON API.

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

Writing a blog post or a docs page? See [CONTRIBUTING.md](CONTRIBUTING.md), or just run `npm run new-post` or `npm run new-doc`.

## How it fits together

```
src/
  data/            snapshots of the hub API, GitHub and Open Collective (npm run data). Never hand-edited
    catalog.json     every image in full (ImageDetail)
    images/<name>.json   builds and history, proxy conf, kubernetes manifest, quadlet
    builds/<image>/<tag>.json   the bundle record, its diff, its layer tables and its tests.json
    control.json     the control plane's URL and the run ids it knew, for the pre-rendered /fleet/runs/<id>/ pages
  assets/logos/    image logos, copied locally and optimised to WebP at build time
  assets/team/     team avatars, likewise
  content/
    posts/         one folder per blog post (index.md + images)
    docs/          documentation: one Markdown file per page under its section folder (general, selkies, misc, faq), images alongside
    authors/       one YAML file per author
    spotlight.yaml   images that take turns in the weekly spotlight
  lib/             data layer: hub types and URLs, images, builds, fleet, stats, posts, docs, feeds, JSON-LD
    control.ts       the control plane: API shapes, credentialed fetch, actions, the shared SSE hook, /api/me
    docs-sections.ts the documentation's sections, shared by the content schema and the docs pages
    explorer.ts      browser-safe helpers for the explorer islands (gzip fetch, file tree, colours)
    lab.ts           the config lab: model from the hub data, visitor state, compose/run/quadlet/k8s renderers, URL token
    hints.ts         the lab's guided hints (manifest descriptions plus documented facts, linked)
    proxy.ts         the reverse proxy lab: targeted line edits on the hub's SWAG samples
  pages/           routes: each gathers its data in the frontmatter and renders the page
  layouts/         Layout.astro: <html>, <head> (via BaseHead), header, footer
  styles/          globals.css: Tailwind, fonts, colour tokens (:root and .dark), utilities, article typography
  components/      Astro components: page header, panels, post cards, image rows, build rows, logos, otters, the docs shell and sidebar
    islands/       React islands: ⌘K search, catalogue, config lab, proxy lab, install menu, package search, mods browser
    islands/explorer/   treemap, Dockerfile annotator (with per-layer sizes), init graph, package browser, diff viewer, CI report, vulnerabilities
    islands/fleet/      the live fleet panels (board, runs, queue, lists, scheduler, image panel), sign-in, shared pills and actions
    ui/            shadcn/ui components (Radix). Do not edit; restyle with `className`
scripts/           data refresh, new-post, new-doc, brand assets, screenshots, accessibility, overflow and live fleet checks
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
| `../content/imagedocs/<name>/*.md` | hub `/api/v1/catalog/<name>/docs.json` (the README builder renders, split at `##`) | the image page's documentation: application setup, read-only and non-root operation, environment variables from files, umask, user and group identifiers, support, updating, building locally |
| `builds/<image>/<tag>.json` | hub `/api/v1/catalog/<name>/builds/<tag>.json`, `/diff.json`, `/layers.<arch>.json`, `/tests.json` | build pages: record, diff, annotated Dockerfile with its layer sizes, init graph, the CI report's summary and test table |
| `categories.json` | hub `/api/v1/categories.json` | catalogue filters |
| `mods.json` | hub `/api/v1/mods.json` | mods page, mods on image pages |
| `stores.json` | hub `/api/v1/stores/index.json` | stores page, "Install on…" buttons |
| `fleet.json` | hub `/api/v1/fleet/bases.json`, `staleness.json` | fleet page |
| `packages.json` | hub `/api/v1/packages.json` | package search index |
| `hub.json` | hub `/api/v1/status.json` plus `HUB_URL` | hub links, source health on the fleet page |
| `team.json` | GitHub org public members | About page |
| `backers.json` | Open Collective | backer count |
| `stats.json` | hub `/api/v1/stats.json` plus the above | headline numbers |
| `control.json` | control `/api/runs.json` (ids only) | which `/fleet/runs/<id>/` pages to pre-render; kept from the previous run when the control plane is down |

There are no pull counts anywhere: the playground publishes to GHCR only and the hub has no download
statistics, so the tiles that used to show Docker Hub and Scarf numbers are gone rather than faked.

### How the explorer loads data

Everything on a build page is static from the snapshot except two heavy tables, which the islands fetch
from the hub in the browser, only when their tab is opened, with a loading state and a retry:

- **Files** (the treemap): `files.<arch>.json.gz`, from `{HUB_URL}/builds/<image>/<tag>/` for the newest
  build of each branch (the hub copies it there) and from the GitHub Release asset otherwise. GitHub Pages
  serves it as `application/gzip` without `Content-Encoding`, so the island inflates it with
  `DecompressionStream`. Current builds hold dumper's nested tree (`lsio-files/1`); older releases hold the
  flat syft-derived table, which `lib/explorer.ts` `legacyTree` turns into the same tree. The treemap sums
  regular files only (a hardlink counts at its first path) and colours them by kind of file: extension, then
  the executable bit. The hierarchy (`lib/explorer.ts` `buildTree`) is built once per tree;
  `lib/treemap.ts` lays the focused directory out qdirstat-style with d3-hierarchy's
  `treemapSquarify`, nesting directory → file until tiles would fall under 6 × 6 px, folding the
  siblings too small to draw into one dashed "N more files" tile so areas always add up. It re-lays out on
  zoom and on container resize; only the tiles it returns are rendered (about a thousand for a 30k-file
  table). Whole tiles are the click target, directories are focusable buttons (Enter zooms in, Backspace or
  Escape zooms out), hover or focus shows a tooltip, and the "Largest here" list beside the map is the
  text alternative. Depth is a per-level lightness shift plus a cushion gradient; the hue stays the package.
- **Packages**: `/api/v1/catalog/<image>/builds/<tag>/packages.<arch>.json`, which the hub serves for the
  newest build of each branch; older builds link to the syft document on their Release.
- The fleet-wide **package search** keeps only the index in the snapshot and fetches
  `/api/v1/packages/<slug>.json` when a package is selected.

The hub sends `Access-Control-Allow-Origin: *`, so these cross-origin fetches need nothing on our side.

Two more views are static from the snapshot:

- **Dockerfile, annotated**: there is no separate layer table, because a LinuxServer image is its base plus
  one `RUN` and one `COPY`. `layers.<arch>.json` is folded into the Dockerfile gutter instead: every
  instruction shows the compressed and on-disk bytes of the layer it produced with a bar proportional to
  the compressed size, the base image's layers are summed into one line above the text, and the raw table
  stays one click away. Layers are attributed by the hub's `dockerfile_lines` provenance when present;
  without it the final stage's `RUN`/`COPY`/`ADD` instructions are matched to the tail of the table in order
  (`lib/explorer.ts` `attributeLayers`), with the text match as a last resort.
- **Init graph**: `init_graph.units` drawn as a left-to-right stage view (`lib/explorer.ts` `initStages`:
  a unit's stage is the longest dependency path below it). This image's units and mods are full nodes with
  their type; the base image's `init-*` steps fold into one "base init · N units" node per run of base-only
  stages, expandable to a compact list, so the drawing stays a few rows tall instead of a thirty-row tower.
  Edges are drawn between visible nodes only (dashed when one end is a collapsed group). Selecting one of
  the image's units shows its run script with a copy button; a text list ordered by stage carries the same
  information for screen readers, `prefers-reduced-motion` and screens under 640 px.

### The CI report

The build page is the canonical CI results page: release notes and the Discord embeds link to
`${SITE_URL}/images/<name>/builds/<tag>/` (CONVENTIONS.md §10). Its "CI report" section (`#ci`) is the
`CiReport` island, server-rendered from the snapshot's `tests.json` (`/api/v1/catalog/<name>/builds/<tag>/tests.json`:
the harness's `test.<arch>.json` per arch plus a summary) so the per-arch result pills, the test table
(name, status, message, seconds), startup seconds, listening ports, warnings, memory and PIDs are in the HTML
without JavaScript. A build the snapshot has no report for fetches `tests.json` in the browser. The files
the hub unpacks from `test.<arch>.tar.gz` under `${HUB_URL}/builds/<name>/<tag>/<arch>/` are loaded on demand:
`screenshot.png` inline with a lightbox, `container.log`, `browser.log`, `sysinfo.txt` and `package_diff.txt`
(the diff against the previous release, open by default) as collapsibles that fetch when opened, monospace,
with copy and raw links; `index.html` (the harness's own report) and the run on the control plane and on
GitHub are linked. A "Vulnerabilities" collapsible (`#vulns`) renders `vulns.json` from the same directory
when the hub serves it (`{summary: {critical, high, medium, low, negligible, fixed, unfixed}, matches:
[{package, version, id, severity, fix_state, fixed_in, urls}], db_date}`): fixable findings grouped by
package, then the ones without a fix behind a caveat; nothing is rendered when the endpoint answers 404.

### The fleet section

`/fleet/` and its pages are shells: the HTML is the page header, the sub-navigation and the explanatory
copy, and a `client:load` island fetches the control plane's JSON (`PUBLIC_CONTROL_URL`, default
`https://ci.thelamer.duckdns.org:8443`; its routes are in the control repository's README, "Driving control
from the website") and subscribes to `GET /api/stream` (one `EventSource` per page, shared by every island,
`withCredentials: true`) to refetch, debounced, when a relevant table changes. Every fetch sends
`credentials: "include"`. The islands render a skeleton while loading, keep the last good data through a
failed refresh (with a one-line notice), and show an honest offline state with a retry and a link to the
control plane's own page when it cannot be reached. Relative times are the visitor's clock, refreshed every
30 s, with the full UTC timestamp in `title`.

| Page | Document | Events |
| --- | --- | --- |
| `/fleet/` board, with the hub's bases and staleness under a "Bases and staleness" tab (`?tab=bases`, `#bases`, `#staleness`, `#hub`) | `/api/fleet.json` (`?image=` filters to one image) | builds, runs, manifests, skips, scheduler_decisions |
| `/fleet/runs/` live runs with job progress and the last 50 finished; `/fleet/runs/<id>/` jobs, steps timeline, logs and build links | `/api/runs.json`, `/api/runs/{id}.json` | runs, jobs, builds |
| `/fleet/queue/` | `/api/queue.json` | jobs, runs |
| `/fleet/builds/` recent build summaries, then the hub's retained builds | `/api/releases.json` | builds, releases |
| `/fleet/pulls/`, `/fleet/issues/`, `/fleet/releases/` | `/api/pulls.json`, `/api/issues.json`, `/api/releases.json` | pull_requests, issues, releases |
| `/fleet/scheduler/` decision log (`?image=&kind=&outcome=`), next 24 hours, skip flags | `/api/scheduler.json`, `/api/skips.json` | scheduler_decisions, manifests, skips |
| `/fleet/actions/` | `/api/actions.json` | actions |
| image page, "In the fleet" (`#fleet`) | `/api/images/{name}.json` | as the board |

`/fleet/runs/<id>/` is pre-rendered for every id in `control.json` and every `workflow.run_id` in the hub's
build records; any other id lands on the 404 page, which sends it to `/fleet/runs/?run=<id>`, where the same
island renders it. Build summaries link to the site's build page when the snapshot has one, else to the
release. Image rows link to the image page's fleet panel, which server-renders the hub's view of each live
branch (released tag, upstream version, last result) and replaces it with the control plane's rows (drift,
next check, skip flags) when they arrive.

**Sign-in and member actions.** The header's "Sign in" (`islands/fleet/SignIn`) sends the browser to
`{CONTROL}/login?next=<current page URL>`; the control plane sets its session cookie and redirects back.
`GET /api/me` (`{authenticated, login, avatar_url, member, csrf}`, never a 401) is read once per page and
shared; the CSRF token stays in memory. Signed in, the header shows the avatar with a sign-out menu
(`POST /api/logout` with `X-CSRF-Token`). When `member` is true the islands render the management controls
inline: re-run and cancel on runs, dispatch (reason picker) and package check on board and image rows, skip
and unskip per branch or whole image, re-read manifests (reconcile) on the scheduler page. Every control
confirms in place (no `confirm()`), posts JSON to `POST /api/actions/{action}` with the CSRF header, shows
`detail` from the answer, and the `actions` stream event refreshes the log. The cookie is cross-site in the
playground (`SameSite=None; Secure`), which Chromium sends; Safari does not, so after a sign-in round trip
that still answers unauthenticated the page shows a one-line notice. Nothing is read from a registry or
namespace outside the organisation; the site never stores a token.

### Anchors

Every section of an image page and a build page has a stable, human id, and the docs' and posts' headings
keep theirs. Other systems (release notes, Discord embeds, the control plane, support answers) can link to
them; `scroll-margin-top` keeps the sticky header off the target, and the "#" that appears beside a heading
on hover or focus copies the full URL (`AnchorHeading.astro`; `Layout.astro` adds the same affordance to
article headings).

| Image page `/images/<name>/` | Build page `/images/<name>/builds/<tag>/` |
| --- | --- |
| `#quick-start` the config lab and "Install on …" | `#record` the build record |
| `#inside` inside the latest image | `#ci` the CI report (`#tests` the test table) |
| `#fleet` live branches, drift, next check, member controls | `#vulns` vulnerabilities, when served |
| `#setup` application setup | `#explorer` files, packages, config and labels |
| `#parameters`, `#ports`, `#env`, `#volumes`, `#devices`, `#misc` | `#diff` changes since the previous build |
| `#tags` version tags, `#arch` architectures | `#dockerfile` annotated Dockerfile |
| `#builds` retained builds | `#init` init graph |
| `#mods`, `#proxy` reverse proxy with SWAG | `#notes` release notes |
| `#changelog`, `#support` | |

The config lab's `#lab:` token (below) is a hash too; it takes precedence over a section id when both are
present, so link one or the other.

### The config lab

The quick start on an image page is a builder, not a static snippet. At build time `lib/lab.ts`
`buildLabModel` turns the hub's `ImageDetail` (`config`, `snippets`, `releases`, `tags`), the image's
generated Kubernetes manifest and quadlet unit, and the mods that apply to it (`modsForImage`) into a
`LabModel`; the `ConfigLab` island (`client:visible`) holds the visitor's choices in React state and
renders the four outputs from them on every change. Nothing is fetched or stored.

- **Fidelity.** With the default state the compose and run output is the hub's required-only snippet,
  character for character; with every optional item on it is the full snippet minus the `#optional`
  markers. The renderers follow `builder/snippets.py` key for key (quoting included), so keep them in step
  when the builder changes. The quadlet and Kubernetes tabs are the hub's own text with the choices
  substituted line by line (environment, image tag, volumes, ports, devices, capabilities; non-root drops
  `PUID`/`PGID` from the ConfigMap), so their structure never drifts from what the hub ships.
- **What `config` does not carry** (`:ro` volumes, whether host networking or privileged mode are
  optional, the external application block) is read from the compose snippet. `options` and `secret` per
  variable exist in the manifest schema but not in the hub's v1 `Config` yet; the lab reads them
  defensively and falls back to the builder's rule for secrets (names containing `TOKEN`, `PASS` or
  `KEY`). Read-only and non-root caveats are the documented general ones, since the hub does not pass
  the manifest's per-image notes.
- **Mods** come from the same index as the mods page (`mods.json`, image-specific then universal). Ticked
  mods join one `DOCKER_MODS` value with `|` in the order they were ticked; a mod with a `mod.yml` shows
  its settings as inputs, a legacy entry links to its README.
- **Hints** (`lib/hints.ts`) are the manifest's own descriptions of what was chosen plus a small table of
  facts from the documentation, each linked. Nothing about an image is inferred beyond what the hub says.
- **The link token.** "Copy link to this config" writes the state to the URL hash and copies the URL;
  loading a page with the hash restores it. The format is `#lab:` followed by query pairs holding only
  what differs from the defaults: `t` tag, `n` container name, `r` restart policy, `u` uid:gid, `on`
  (repeated) the ids of optional items turned on (`e:TZ`, `v:/tv`, `p:80`, `d:/dev/dri`, `c:NET_ADMIN`,
  `s:<security_opt>`, `x:<flag>`, `hostname`, `mac`, `net`, `priv`, `ro`, `nonroot`), `v.<id>` an edited
  value, `m` (repeated) mod ids in order, `me.<mod>/<NAME>` a mod setting. Unknown ids are ignored and
  values flagged as secrets are never serialised. Example:
  `#lab:on=v:/tv&v.v:/tv=/mnt/tv&v.e:TZ=Europe/London&m=universal-cloudflared`.

### The reverse proxy lab

Images with a `proxy` block get a "Reverse proxy with SWAG" section: the hub's generated samples
(`images/<name>.json` `proxy`, from `/api/v1/catalog/<name>/proxy.json`) with the mode (subdomain, or
subfolder when supported), container name, upstream port, scheme and authentication chosen by the visitor.
`lib/proxy.ts` applies those as targeted line edits (`set $upstream_*`, and uncommenting the
`#include /config/nginx/<auth>-server.conf;` / `-location.conf;` pair or the `auth_basic` lines), so the
output is always the hub's sample plus the chosen lines; API locations keep auth off as the sample has them.

### Inside the latest image

Right after the quick start, an image page features its latest live build (the newest build of the branch
that publishes `latest`, else the newest of all): base image, upstream version, compressed size and layer
count per architecture, package count per architecture from the build record, test result, when and why
it was built, an "Explore this build" button to the build page, and a compact treemap of its files
(`CompactTreemap`, the explorer's `Treemap` with `compact`), which fetches `files.<arch>.json.gz` the same
way the build page does, hub copy first, only once the panel scrolls into view. Without a file table or a
build record the panel shows the facts and the button only.

### Pages

| URL | |
| --- | --- |
| `/` | home: stats, latest builds, weekly spotlight, rankings, blog |
| `/images/` | searchable, filterable catalogue (state in the query string, e.g. `?category=Games&sort=stars`) |
| `/images/<name>/` | every image, deprecated ones included: the config lab (compose, docker run, Kubernetes, quadlet built from your choices), "Install on…", inside the latest image (facts and a compact treemap), in the fleet (live), setup, parameters, version tags with their latest build, builds, mods, the SWAG proxy lab, changelog, support |
| `/images/<name>/builds/<tag>/` | one retained build, the canonical CI results page: record, platforms, the CI report (tests, screenshot, logs, package diff), vulnerabilities, file treemap, packages, config and labels, diff to the previous build, annotated Dockerfile with per-instruction layer sizes, init graph by stage, release notes |
| `/fleet/` | the live fleet board; the hub's base images, staleness and health under the "Bases" tab |
| `/fleet/runs/`, `/fleet/runs/<id>/`, `/fleet/queue/`, `/fleet/builds/`, `/fleet/pulls/`, `/fleet/issues/`, `/fleet/releases/`, `/fleet/scheduler/`, `/fleet/actions/` | the fleet section, live from the control plane (above) |
| `/packages/` | fleet-wide package search (`?q=musl&type=apk`) |
| `/mods/` | the mods index with text and per-image filters (`?image=sonarr`) |
| `/stores/` | every store and generated artefact with its import URL and how-to |
| `/blog/`, `/blog/page/<n>/`, `/blog/<slug>/`, `/blog/tags/`, `/blog/authors/<id>/` | blog |
| `/docs/` | documentation landing: every section with its pages, search |
| `/docs/<section>/` | a section: its own page (`index.md`) if it has one, then its pages in order |
| `/docs/<section>/<slug>/` | one documentation page: sidebar of the section, table of contents, previous/next, edit link |
| `/search/?q=` | full-text search (Pagefind) over docs, posts and image pages |
| `/about/`, `/support/`, `/donate/` | |
| `/blog/rss.xml`, `/blog/atom.xml` | feeds |
| `/search-index.json` | index for the ⌘K palette |

### Documentation

`src/content/docs/<section>/<slug>.md` is one page at `/docs/<section>/<slug>/`; a section's `index.md` is
its own page at `/docs/<section>/`. The sections (`general`, `selkies`, `misc`, `faq`) are declared in
`src/lib/docs-sections.ts`, which the content schema uses to validate every page's `section`, and the
sidebar orders pages by `order` under their optional `group`. Image pages are not documentation: the hub
renders them from `image.yml`. Old docs-site URLs are listed in each page's `aliases`, which the 404 page
turns into client-side redirects and `public/_redirects` lists for hosts that support it. Mkdocs syntax
was converted on import: admonitions became callouts, tabs and FAQ details became headings, Mermaid
diagrams became text. Authoring is described in [CONTRIBUTING.md](CONTRIBUTING.md#writing-docs).

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
  graph carry their data in text lists too); SVG buttons' accessible names start with their visible text; respect `prefers-reduced-motion`; images have `alt`; external
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
node scripts/fleet-check.mjs http://localhost:4321/site            # the fleet islands against the live control plane, with screenshots
```

The control plane only allows the deployed origin for CORS, so from `localhost` the fleet islands show
their offline state; `fleet-check.mjs` replays the control plane's answers with permissive headers so the
live rendering can be checked locally (`FLEET_EXTRA=/images/sonarr/,…` adds pages). Set
`PUBLIC_CONTROL_URL` to point both the build and the scripts at another control plane.

`npx playwright install chromium` once for the browser-based checks.
