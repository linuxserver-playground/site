# AGENTS.md - site

## Purpose

This repository is the public website of the LinuxServer.io v2 playground: the image catalogue, a page per
image, a page per retained build with the transparent image explorer (layers, files, packages, init graph,
diff), the fleet, package, mods and stores views, the blog and the documentation (`/docs/`). It is a static Astro site built from JSON
snapshots of the hub's API and deployed to GitHub Pages. Consumers are visitors; the only data producer we
depend on is the hub (`linuxserver-playground/hub`), plus GitHub (team) and Open Collective (backers).

## Layout

| Path | What |
| --- | --- |
| `src/data/` | Snapshots written by `scripts/refresh-data.mjs`: `catalog.json`, `images/<name>.json`, `builds/<image>/<tag>.json`, `mods.json`, `stores.json`, `fleet.json`, `packages.json`, `categories.json`, `stats.json`, `hub.json`, `team.json`, `backers.json`. |
| `src/lib/` | Data layer. `hub.ts` (API shapes and URL helpers), `images.ts`, `builds.ts`, `fleet.ts`, `stats.ts`, `explorer.ts` (browser-safe helpers), `lab.ts` and `hints.ts` (the config lab: model, renderers, URL token, hints), `proxy.ts` (the SWAG proxy lab), posts, `docs.ts` and `docs-sections.ts` (the documentation), feeds, JSON-LD, formatting. |
| `src/pages/` | Routes. `images/[name].astro`, `images/[name]/builds/[tag].astro`, `fleet.astro`, `packages.astro`, `mods.astro`, `stores.astro`, blog, `docs/` (landing, `[section]/index`, `[section]/[slug]`), about, support, donate, search. |
| `src/components/` | Astro components (`DocsShell`, `DocsNav` for the documentation); `islands/` React islands (`ConfigLab`, `ProxyLab`, catalogue, search…); `islands/explorer/` the explorer views; `ui/` shadcn components (do not edit). |
| `src/content/` | Blog posts, authors, `spotlight.yaml`, and `docs/<section>/<slug>.md` (the documentation; schema in `src/content.config.ts`). |
| `src/styles/globals.css` | Design tokens and utilities (Raft). |
| `scripts/` | `refresh-data.mjs`, `a11y.mjs`, `overflow.mjs`, `shot.mjs`, `test-search.mjs`, `new-post.mjs`, `new-doc.mjs`. |
| `.github/workflows/` | `deploy.yml` (push, daily, `repository_dispatch: hub-updated`, manual), `check.yml` (pull requests). |

## What you may edit

Everything except `src/data/`, `src/assets/logos/` and `src/assets/team/`, which `npm run data` writes and CI
commits as `Refresh data snapshots`. Never hand-edit a snapshot; fix the refresh script or the hub. Do not
edit `src/components/ui/` (regenerate with shadcn). Never add a stat the hub does not provide (there are no
pull counts), never embed the control plane, and never read from a registry or namespace outside
`linuxserver-playground` and the hub. Every internal link goes through `withBase()`.

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
```

CI runs `check`, `build`, `a11y.mjs` and `test-search.mjs` on every pull request (`check.yml`). The build
validates every post's and every docs page's front matter, and `a11y.mjs` covers docs pages in its default list.

## Contracts

Consumes the hub's API as described by its pydantic models (`lsio_hub/models.py`) and `openapi.json`:
`ImageDetail`, `BuildsData`, `Bundle` (which is `bundle.schema.json` from `linuxserver-playground/builder`,
including `$defs/layer` and `$defs/file_entry` for `files.<arch>.json.gz`), `Diff`, `PackagesData`,
`ModsData`, `ProxyData`, `PackageIndexData`, `PackageData`, `BasesData`, `StalenessData`, `StoresData`,
`Stats`, `Status`. Types live in `src/lib/hub.ts`; a hub change that renames or removes a field is a change
here too. Produces no schema. See `CONVENTIONS.md` in the builder repository, in particular §6 (the bundle)
and §10 (who renders what: the site is hub-driven, the control plane is linked for live status only).

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
