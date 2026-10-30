---
title: Generated files and templates
description: How builder renders README, AGENTS.md and the workflows from image.yml, which template produces which section, how the hub and the site render from the same templates, and how to change or add output.
section: maintain
order: 4
---
Everything in an image repository that is not a Dockerfile, `root/` or `image.yml` is rendered from the manifest by the `builder` tool, and the hub renders the same templates again when it builds the API, so the README on GitHub and the image page on the site come from one source. This page is the map of that pipeline and where to cut in.

## The pipeline

```
image.yml
  │  load_manifest (PyYAML, dates kept as strings, line numbers recorded for findings)
  │  validate against schemas/image.schema.json
  ▼
build_context(data, settings)           builder/manifest.py
  │  normalize_runtime: defaults, required-first ordering, TZ dropped under common_env, secret inference
  │  derived values: title, image ref, live_branches, arch rows, notices, selkies ports, URLs, badges
  ▼
ctx + compose_snippet + run_snippet      builder/snippets.py
  │
  ▼
Jinja2 (StrictUndefined, trim_blocks, lstrip_blocks; filters noter, admonition, yaml_string)
  ├─ README.md.j2            ─▶ README.md                       (gfm flavour)
  ├─ agents/image.md.j2      ─▶ AGENTS.md
  ├─ LICENSE                 ─▶ LICENSE                         (copied verbatim)
  ├─ build.yml.j2            ─▶ .github/workflows/build.yml     (the ~40-line caller of image-build.yml@v1)
  ├─ pr-report.yml.j2        ─▶ .github/workflows/pr-report.yml (the trusted half of PR builds)
  ├─ docs.md.j2              ─▶ .builder-out/docs.md            (mkdocs flavour; hub only)
  └─ README.lite.md.j2       ─▶ .builder-out/README.lite.md     (the truncated README for registries; hub only)
  │
  ▼
_tidy: collapse blank runs outside code fences, one trailing newline
```

`builder render` writes the first five into the repository (`--all` adds the two under `.builder-out/`, which image repos never commit). `builder check` renders everything in memory and reports each committed file that differs (`drift`: `differs` or `missing`). The live build runs `render` after a successful release and commits the result as `Update generated files [skip ci]`, so an image repository's generated files always reflect the builder version that last built it; in a pull request, drift is a warning, and the contributor must not edit the files by hand.

`StrictUndefined` means a template that references a context key that does not exist fails the render rather than printing nothing. Add the key in `build_context` first.

## Settings

Every URL the templates print comes from `Settings` in `builder/manifest.py`, overridable with `BUILDER_*` environment variables: `org`, `registry`, `control_url`, `site_url`, `docs_url`, `hub_url`, `blog_url`, `upstream_org`, `schema_url`. The move to the real organisation is a change of these defaults plus the list in the workspace's `docs/playground-references.md`.

## Which template renders which section

`README.md.j2` and `docs.md.j2` are skeletons: a `flavour` variable (`gfm` or `mkdocs`), the do-not-edit banner, then `parts/body.j2`, which includes one part per section in this order. A part is included only when the condition holds.

| Part | Heading | Rendered when | Fields |
| --- | --- | --- | --- |
| `deprecation.j2` | (banner) | `deprecation.status` | `deprecation.message` |
| `project_badges.j2` | (badges under the title) | always | `name`, `release.tag`, control and site URLs |
| `body.j2` itself | summary, extras, logo | always | `summary`, `extras`, `docs.logo`, `upstream.url` |
| `supported_architectures.j2` | Supported Architectures | always | `build.platforms` |
| `version_tags.j2` | Version Tags | `release.tags` set | `release.tags` |
| `application_setup.j2` | Application Setup | `docs.setup`, any notice, or selkies | `docs.setup`, `docs.notices.*` (sub-sections `strict_proxy`, `seccomp`, `keyboard.j2`, `hwaccel.j2`, `media.j2`, `kasm.j2`, `selkies.j2`) |
| `readonly.j2`, `nonroot.j2` | Read-Only Operation, Non-Root Operation | `runtime.readonly.supported`, `runtime.nonroot.supported` | their `notes` |
| `usage.j2` | Usage | always | `compose_snippet`, `run_snippet` (from `snippets.py`) |
| `parameters_gfm.j2` / `parameters_mkdocs.j2` | Parameters | always | the whole normalised `runtime` (`rt`), via `misc_rows.j2` for hostname, mac, caps, security_opt, custom |
| `env_var_files.j2` | Environment variables from files (Docker secrets) | always | |
| `umask.j2` | Umask for running applications | always | |
| (inline) | Optional Parameters | `docs.optional_parameters` | |
| `user_group_identifiers.j2` | User / Group Identifiers | `runtime.common_env` | |
| `docker_mods.j2` | Docker Mods | always | mods URLs for this image |
| `support_info.j2` | Support Info | always | `runtime.container_name`, image ref |
| `updating_info.j2` | Updating Info | always | same |
| `building_locally.j2` | Building locally | always | repo, image ref, control page |
| `versions.j2` | Versions | always | `changelog` |

`group_info.j2` (the LinuxServer blurb and badges above the title) is in the README only; the mkdocs page has front matter from `docs.categories` and the one-line summary instead. `custom_readme` replaces everything after the banner in both.

The texts of the standard sub-sections (hardware acceleration, keyboard layouts, media folders, the Selkies section) are the parts themselves, ported from the legacy snippets. To change what every image says about, say, hardware acceleration, edit `parts/hwaccel.j2` and nothing else.

## Markdown conventions inside the manifest

- Admonitions are written as `?+note[Title](|text|)` in `summary`, `docs.setup` and `docs.optional_parameters`. The `noter` filter turns them into GitHub alerts (`> [!NOTE]`) for the README and `!!! note` blocks for mkdocs (`builder/admonition.py`; severities note, tip, info, warning, danger, bug, question, success, failure, abstract, quote).
- Everything else is plain Markdown and passes through. The site renders it with its own pipeline and sanitises to an allowlist.

## The snippets

`builder/snippets.py` builds the compose file and the `docker run` command from the normalised runtime: `compose(manifest)`, `docker_run(manifest)`, each with `full=False` for the required-only variant, plus `as_dict`/`as_json` for consumers that want structure. The README, the hub API (`snippets.docker_compose`, `snippets.docker_run`) and the site's copy buttons all call these, so a change here changes all three. `builder snippets <repo_dir> [--required-only]` prints them for a quick look.

## What the hub renders from the same templates

The hub never reads a repository's README. For each release it ingests it keeps the branch's manifest, and at API build time:

- `responses.docs_data` renders `README.md` with `render_all` and splits it on `## ` headings (code fences respected) into `docs.json`: `[{id, title, markdown}]`. The site's `imagedocs` collection is written from this, one file per section, and the image page renders them. The section ids are slugs of the headings (`application-setup`, `parameters`), so renaming a heading in a part renames the ids the site keys on.
- `transform.build_image` calls `build_context` for the same derived values (title, platforms, tags, deprecation, setup) and `snippets` for the compose and run text.
- `generate/docs.py` renders `.builder-out/docs.md` per image, the mkdocs page, into the hub's generated artefacts, and `generate/<store>.py`, `proxy.py`, `kubernetes.py`, `quadlet.py` read the manifest directly for the install artefacts.

The hub installs `lsio-builder` from `builder@main` when its workflow runs, so a template change reaches the API on the next hub Deploy (hourly at the latest) and the site on the `hub-updated` dispatch that follows.

## The other generated files

- **`AGENTS.md`** in every image repository comes from `templates/agents/image.md.j2` (the shared `templates/` directory of the builder repo, not `builder/templates/`). It is the instruction file AI agents and contributors read; it carries the repo-specific facts (image name, platforms, base, version arg) from the context and the fixed rules from the template. The infrastructure repos' AGENTS.md files are hand-written (`templates/agents/infra.md` is the skeleton they started from).
- **`.github/workflows/build.yml`** is the caller: `on: push, pull_request, workflow_dispatch (reason: manual|upstream|packages|rebuild|pages), repository_dispatch`, one `concurrency` group per ref, `uses: linuxserver-playground/workflows/.github/workflows/image-build.yml@v1` with `secrets: inherit`. A test pins its text, because the workflow's behaviour lives in the workflows repository, not here; the only reason to touch the template is a new input.
- **`.github/workflows/pr-report.yml`** is the trusted half of pull request builds (`workflow_run` and `pull_request_target` from the base branch), rendered from `pr-report.yml.j2`. It only reads the Build run's artifacts as data and never checks out pull request code; a test enforces that shape.
- **`LICENSE`** is copied verbatim.

## Mods

A docker-mods branch is rendered the same way from `mod.yml` (`schemas/mod.schema.json`: `name`, `target`, `title`, `summary`, `maintainers`, `platforms`, `bases`, `images`, `env`, `upstream`, `version`, `deprecated`, `docs`). `builder render-mod` writes `README.md` from `mod-readme.md.j2`, `AGENTS.md` from `agents/mod.md.j2` and `build.yml` from `mod-build.yml` (plain text; a branch with `upstream.lines` gets the `line` input). The hub's mods index and every `/mods/<branch>/` page come from the same `mod.yml`. The mod-specific rules are in `repos/docker-mods/AGENTS.md`.

## Changing output

**Wording or layout of a section.** Edit the part under `builder/templates/parts/`, then:

```bash
pip install -e '.[dev]'
UPDATE_GOLDEN=1 pytest tests/test_render.py      # regenerates tests/golden/sonarr/*
git diff tests/golden/                           # review: this diff is what every README in the fleet will get
ruff check . && ruff format --check . && mypy && pytest
```

Push to `main`. Nothing else to do: each image repository re-renders on its next live build, the hub on its next Deploy.

**A new section.** Add a part, include it from `parts/body.j2` at the right place with its condition, and extend `test_readme_has_the_expected_sections_in_order` in `tests/test_render.py`, which pins the heading order. If the hub or the site key on the section, their ids follow from the heading.

**A new manifest field**, end to end, in dependency order:

1. `schemas/image.schema.json`: the field, its type and a `description` that says what it does. Bump `contracts_version` in `pyproject.toml` (MINOR for an optional field, MAJOR for a rename or removal, which also changes the `schema` const).
2. `builder/manifest.py`: if templates need it in a derived or defaulted form, add it to `normalize_runtime` or `build_context`.
3. The template or snippet that shows it, and an example manifest under `examples/` that uses it (the tests render and validate every example).
4. `builder/check.py` if the schema cannot express a rule about it; a test in `tests/test_check.py`.
5. `CONVENTIONS.md` if behaviour changes. Push builder.
6. Consumers, each in its own repository: the site first (the image page is where users read it), then the hub (`transform.py`, `models.py`, generator fixtures), then workflows or control if the build or the scheduler reads it. Control and the hub pick the new schema up at their next build.
7. The playbooks and guides in the harness repository, if the field changes how a contributor works.

**Something the build does** (how an image is built, tested, published) is not a template change: it is the workflows repository, `.github/workflows/image-build.yml` and the composite action under `.github/actions/<step>/`, validated with `./scripts/check.sh`, released by moving `v1`, and proven with a dispatched build of a small image.

## Reading the result

- `builder render examples/sonarr` writes into the example directory (do not commit the output); `tests/golden/sonarr/` is the committed render of the same manifest.
- The hub's rendering of any live image is at `https://linuxserver-playground.github.io/hub/api/v1/catalog/<name>/docs.json`, and the site's at `/images/<name>/`.
- An image repository's own `README.md` is the render by whichever builder version last built it. If it differs from the golden, the repo has not had a live build since the template changed.
