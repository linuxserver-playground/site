# AGENTS.md - site

## Purpose

This repository is the public website of the LinuxServer.io v2 playground: the image catalogue, a page per
image (with its live fleet panel), a page per retained build (the canonical CI results page: test report,
screenshot, logs, package diff, vulnerabilities) with the transparent image explorer (layers, files,
packages, init graph, diff), the fleet section rendered live from the control plane's JSON API (board, runs,
queue, builds, pull requests, issues, releases, scheduler, actions, with member sign-in and actions), the
package, mods and stores views, the blog and the documentation (`/docs/`). It is a static Astro site built
from JSON snapshots of the hub's API and deployed to GitHub Pages; the fleet islands fetch the control plane
in the browser. Data producers: the hub (`linuxserver-playground/hub`), the control plane
(`linuxserver-playground/control`), GitHub (team) and Open Collective (backers).

## Layout

| Path | What |
| --- | --- |
| `src/data/` | Snapshots written by `scripts/refresh-data.mjs`: `catalog.json`, `images/<name>.json`, `builds/<image>/<tag>.json` (record, diff, layers, `tests`), `mods.json`, `stores.json`, `fleet.json`, `packages.json`, `categories.json`, `stats.json`, `hub.json`, `control.json` (run ids), `team.json`, `backers.json`. |
| `src/lib/` | Data layer. `hub.ts` (API shapes and URL helpers), `control.ts` (the control plane: shapes, credentialed fetch, actions, SSE and `/api/me` hooks; browser-safe), `images.ts`, `builds.ts`, `fleet.ts`, `stats.ts`, `explorer.ts` (browser-safe helpers), `lab.ts` and `hints.ts` (the config lab: model, renderers, URL token, hints), `proxy.ts` (the SWAG proxy lab), posts, `docs.ts` and `docs-sections.ts` (the documentation), feeds, JSON-LD, formatting. |
| `src/pages/` | Routes. `images/[name].astro`, `images/[name]/builds/[tag].astro`, `fleet/` (`index`, `runs/index`, `runs/[id]`, `queue`, `builds`, `pulls`, `issues`, `releases`, `scheduler`, `actions`), `packages.astro`, `mods.astro`, `stores.astro`, blog, `docs/` (landing, `[section]/index`, `[section]/[slug]`), about, support, donate, search. |
| `src/components/` | Astro components (`FleetShell` for the fleet section, `AnchorHeading` for linkable sections, `DocsShell`, `DocsNav` for the documentation); `islands/` React islands (`ConfigLab`, `ProxyLab`, catalogue, search…); `islands/fleet/` the live fleet panels, sign-in and the shared pills, states and action buttons; `islands/explorer/` the explorer views, `CiReport` and `Vulns`; `ui/` shadcn components (do not edit). |
| `src/content/` | Blog posts, authors, `spotlight.yaml`, and `docs/<section>/<slug>.md` (the documentation; schema in `src/content.config.ts`). |
| `src/styles/globals.css` | Design tokens and utilities (Raft). |
| `scripts/` | `refresh-data.mjs`, `a11y.mjs`, `overflow.mjs`, `shot.mjs`, `test-search.mjs`, `fleet-check.mjs`, `new-post.mjs`, `new-doc.mjs`. |
| `.github/workflows/` | `deploy.yml` (push, daily, `repository_dispatch: hub-updated`, manual), `check.yml` (pull requests). |

## What you may edit

Everything except `src/data/`, `src/assets/logos/` and `src/assets/team/`, which `npm run data` writes and CI
commits as `Refresh data snapshots`. Never hand-edit a snapshot; fix the refresh script or the hub. Do not
edit `src/components/ui/` (regenerate with shadcn). Never add a stat the hub does not provide (there are no
pull counts), and never read from a registry or namespace outside `linuxserver-playground`, the hub and the
control plane. Every internal link goes through `withBase()`.

The control plane is read live, in the browser, through `src/lib/control.ts` only: `credentials: "include"`
on every fetch, one shared `EventSource` on `/api/stream`, `/api/me` for who is signed in (never a token in a
URL or in storage; the CSRF token lives in memory), and `POST /api/actions/{action}` with `X-CSRF-Token` for
member actions, each confirmed in place and never with `confirm()`. Nothing from the control plane is
snapshotted except the run ids in `control.json`; every live island must server-render a useful shell, show
a designed loading state, and an honest offline state with a retry and the control plane's own page linked.
Section ids on image and build pages (README, "Anchors") are a public contract: never rename one.

Documentation pages are hand-written Markdown under `src/content/docs/`; image pages are not documentation
and must never be copied there (the hub renders them from `image.yml`). A new section is an entry in
`src/lib/docs-sections.ts` plus a folder. Keep a page's old URL in its `aliases` and in `public/_redirects`
when you move it. Follow CONTRIBUTING.md, "Writing docs".

## How to validate

```bash
npm ci
npm run data:local                 # or: HUB_URL=… npm run data
npm run check                      # astro check: must report 0 errors
npm run build                      # dist/ and the Pagefind index
npx astro preview --port 4321 &
node scripts/a11y.mjs http://localhost:4321/site          # axe, light and dark, must pass
node scripts/test-search.mjs http://localhost:4321/site
node scripts/overflow.mjs http://localhost:4321/site/<page>/   # 390px, scroll width must be 390
node scripts/fleet-check.mjs http://localhost:4321/site      # fleet islands against the live control plane (replays its answers with CORS)
```

CI runs `check`, `build`, `a11y.mjs` and `test-search.mjs` on every pull request (`check.yml`). The build
validates every post's and every docs page's front matter, and `a11y.mjs` covers docs pages in its default list.

## Contracts

Consumes the hub's API as described by its pydantic models (`lsio_hub/models.py`) and `openapi.json`:
`ImageDetail`, `BuildsData`, `Bundle` (which is `bundle.schema.json` from `linuxserver-playground/builder`,
including `$defs/layer`, and `$defs/file_tree` for `files.<arch>.json.gz` with the legacy `$defs/file_entry`
still read for older releases), `Diff`, `PackagesData`,
`ModsData`, `ProxyData`, `PackageIndexData`, `PackageData`, `BasesData`, `StalenessData`, `StoresData`,
`Stats`, `Status`, `TestsData` (`tests.json`) and `VulnsData` (`vulns.json`). Types live in `src/lib/hub.ts`;
a hub change that renames or removes a field is a change here too. The control plane's JSON (`control/views.py`
and `control/model.py` in `linuxserver-playground/control`: `FleetPage`, `RunsPage`, `RunPage`, `QueuePage`,
`PullsPage`, `IssuesPage`, `ReleasesPage`, `BuildPage`, `ImagePage`, `SchedulerPage`, `SkipsPage`,
`ActionsPage`, `/api/me`, the actions and the stream) is typed in `src/lib/control.ts`. Produces no schema.
See `CONVENTIONS.md` in the builder repository, in particular §6 (the bundle) and §10 (who renders what: the
site renders the hub's data and the control plane's JSON; `{SITE_URL}/images/{image}/builds/{tag}/` is the CI
results page the release notes and Discord embeds link to).

The config lab (`src/lib/lab.ts`) re-renders the compose and run snippets client-side and must stay byte
for byte equal to the hub's snippets in its default and all-optional states (they follow
`builder/snippets.py`); the quadlet, Kubernetes and SWAG outputs are the hub's text with targeted line
edits, never regenerated. A change to the builder's snippet or generator format is a change here too.
Hints (`src/lib/hints.ts`) quote the manifest or the documentation; never add a hint that states something
the hub does not say about the image.

## Pull request rules

Disclose AI use in the description. One change per pull request. Commit subjects are short imperative
sentences without prefixes, emoji or trailers. Do not commit `dist/`, snapshots you refreshed by hand, or
credentials. Blog posts and docs pages follow CONTRIBUTING.md.
