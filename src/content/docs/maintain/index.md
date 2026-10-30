---
title: Maintainer reference
description: Where behaviour lives across the playground's repositories, what is generated from what, and which file to edit to change it.
section: maintain
order: 1
---
These pages are for the team. They assume you know Docker, GitHub Actions and the LinuxServer image layout, and they answer three questions: what options `image.yml` has, how the generated files and pages are produced from it, and which file you edit to change a behaviour. The contract behind all of it is [`CONVENTIONS.md`](https://github.com/linuxserver-playground/builder/blob/main/CONVENTIONS.md) in the builder repository; when a page here and CONVENTIONS disagree, CONVENTIONS wins.

| Page | What it covers |
| --- | --- |
| [The image.yml manifest](/docs/maintain/image-manifest/) | Every field, its options and defaults, what it drives, and the normalisation applied before rendering. |
| [Version sources and release assets](/docs/maintain/version-sources/) | Every `upstream.version` type, `transform`, `require_assets`, release notes sources, and how the control plane uses them. |
| [Generated files and templates](/docs/maintain/generated-files/) | The render pipeline, the templates and the parts, what the hub and the site render from the same templates, and how to change or add output. |

## One manifest, many outputs

An image repository is hand-edited in three places: the two Dockerfiles, `root/`, and `image.yml`. Everything else derives from the manifest:

```
image.yml ─┬─ builder render ──▶ README.md, AGENTS.md, LICENSE, .github/workflows/build.yml, pr-report.yml   (committed by the live build)
           ├─ workflows        ──▶ platforms, Dockerfiles, version arg, test settings, release tags           (image-build.yml@v1)
           ├─ control          ──▶ live branch, hourly version check, weekly package check                    (fleet.py, scheduler.py)
           └─ hub              ──▶ API (catalog, docs.json, snippets), stores, SWAG confs, k8s, quadlets      (transform.py, generate/)
                                   └─▶ site: image pages, imagedocs, install artefacts
```

The hub does not read the README. It loads the manifest from each release and renders the same Jinja templates the builder does, so the README on GitHub and the image page on the site cannot disagree.

## Where to edit what

- **Text or facts about one image (summary, parameters, setup, ports, changelog)**: `image.yml` on the live branch (`docker-<name>`). Then `builder check`; the live build re-renders README and friends as `Update generated files [skip ci]`
- **The wording or layout of a README section, for every image**: `builder/templates/parts/<section>.j2` (builder). Then `UPDATE_GOLDEN=1 pytest tests/test_render.py`, review `tests/golden/`, push; every image picks it up on its next live build.
- **The skeleton of the README or the mkdocs page**: `builder/templates/README.md.j2`, `docs.md.j2`, `parts/body.j2` (builder). Then the same.
- **The image repos' `AGENTS.md`**: `templates/agents/image.md.j2` (builder). Then the same.
- **The 40-line `build.yml` caller or `pr-report.yml` in every image repo**: `builder/templates/build.yml.j2`, `pr-report.yml.j2` (builder). Then same; the workflow logic itself is in workflows.
- **The compose and `docker run` snippets (README, hub API, site)**: `builder/snippets.py` (builder). Then pytest.
- **Admonition rendering (`?+note[Title](|text|)`)**: `builder/admonition.py` (builder). Then pytest.
- **Values derived from the manifest before any template sees them**: `builder/manifest.py` (`normalize_runtime`, `build_context`) (builder). Then pytest.
- **What `builder check` enforces beyond the schema**: `builder/check.py` (builder). Then pytest; it runs in every PR and live build.
- **A new or changed `image.yml` field**: `schemas/image.schema.json`, then the consumers (below) (builder, then hub, site, workflows or control). Then `contracts_version` bump; an example under `examples/`; a test.
- **How a version is resolved, any source type**: `scripts/resolve_version.py` (workflows, then copy into `control/vendor/`). Then workflows `./scripts/check.sh`; control's `tests/test_vendor.py` fails until the copy matches.
- **How images build, test, publish, release**: `.github/workflows/image-build.yml`, `.github/actions/*` (workflows). Then `./scripts/check.sh`, push, move `v1`, dispatch a small image.
- **The container test harness and screenshots**: the `ci` repository (ci). Then its AGENTS.md.
- **Store templates (Unraid, Portainer, CasaOS, Umbrel, Runtipi, Cosmos, Arcane)**: `lsio_hub/generate/<store>.py` (hub). Then fixture tests for sonarr, swag and multidb.
- **SWAG proxy confs, Kubernetes manifests, quadlets**: `lsio_hub/generate/proxy.py`, `kubernetes.py`, `quadlet.py` (hub). Then the same.
- **The hub API shape (`catalog/<name>.json`, `docs.json`)**: `lsio_hub/transform.py`, `models.py`, `responses.py` (hub). Then same; then the site's `src/lib/hub.ts`
- **An image page on the site**: `src/pages/images/[name].astro` and `src/components/` (site). Then `npm run check`, `npm run build`, a11y, 390 px.
- **When builds are scheduled, cooldowns, alerts**: `control/scheduler.py` (settings are code defaults in `control/config.py`) (control). Then ruff, mypy, pytest; a push to main deploys.
- **Legacy conversion (`readme-vars`, `jenkins-vars` to `image.yml`)**: `builder/migrate.py`, `legacy_vars.py` (builder). Then pytest; `tests/fixtures/live/` are real pairs.
- **A mod's README, AGENTS.md and workflow**: `mod.yml` on the mod branch; templates `mod-readme.md.j2`, `mod-build.yml`, `agents/mod.md.j2` (docker-mods; builder). Then `builder render-mod`, `tools/check-branch.sh`

## How a change reaches the fleet

- **builder** on push to `main` publishes `ghcr.io/linuxserver-playground/builder:latest`. The build of every image runs `builder check` and `builder render` from that image, and the hub and control install the `lsio-builder` package from `builder@main` when they build. So a template change shows up in an image repo on its next live build, in the hub API on its next Deploy (hourly at most), and the site follows the hub.
- **workflows** is called as `image-build.yml@v1`; the floating `v1` tag has to be moved by hand after a push. A change that breaks the inputs, outputs or the ci interface is a new major tag.
- **control** deploys itself: Publish runs the checks, pushes `:latest`, and the server pulls it within five minutes. A red `main` ships nothing.
- **hub** redeploys Pages on every push and ingests on every Deploy; `gh workflow run deploy.yml -R linuxserver-playground/hub` forces one.
- **site** rebuilds on push and on the `hub-updated` dispatch control sends after every hub Deploy.

Generated data never lands on `main`: the hub's `data/` and the site's snapshots are each the single commit of their repository's `data` branch.

## Validating locally

Every repository's `AGENTS.md` has a "How to validate" section with the exact commands; the short list:

```bash
# an image repository
docker run --rm -v "$PWD":/repo ghcr.io/linuxserver-playground/builder:latest check
docker run --rm -v "$PWD":/repo --user "$(id -u):$(id -g)" ghcr.io/linuxserver-playground/builder:latest render

# builder, from a checkout
pip install -e '.[dev]' && ruff check . && ruff format --check . && mypy && pytest
python -m contracts image examples/*/image.yml

# workflows (the resolver is exercised here)
./scripts/check.sh
python3 scripts/resolve_version.py path/to/image.yml      # resolves for real; GITHUB_TOKEN raises the API limit

# control
ruff check . && ruff format --check . && mypy control tests && pytest
```

Nothing local needs a secret: every test runs against fixtures and mocks.
