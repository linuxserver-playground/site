---
title: The image.yml manifest
description: Every field of image.yml with its options, defaults and what it drives, the normalisation applied before rendering, and what builder check enforces beyond the schema.
section: maintain
order: 2
---
`image.yml` is the one hand-edited metadata file of an image repository, one per live branch, validated against [`image.schema.json`](https://github.com/linuxserver-playground/builder/blob/main/schemas/image.schema.json) (JSON Schema 2020-12, `additionalProperties: false` everywhere, so an unknown key fails `builder check`). This page walks the schema top to bottom and says what each field drives. The schema's `description` strings are authoritative for meaning; this page adds the consumers and the defaults that are applied in code rather than in the schema. The worked examples are the three manifests under [`examples/`](https://github.com/linuxserver-playground/builder/tree/main/examples) and any converted repository.

Required top-level keys: `schema`, `name`, `summary`, `upstream`, `release`, `build`, `runtime`, `docs`.

## Identity

| Field | Type | Drives |
| --- | --- | --- |
| `schema` | const `1` | The contract major version. A MAJOR schema change bumps it; consumers refuse what they do not understand. |
| `name` | `^[a-z0-9][a-z0-9-]{0,62}$` | The image `ghcr.io/linuxserver-playground/<name>`, the repo `docker-<name>`, the site URL `/images/<name>/`, the default `container_name`, the default `host_path` prefix. A `.` or `_` is rejected. |
| `title` | string, max 80 | Display name. Default: `name` capitalised. Used by the hub API and the site; the README heading uses `org/name`. |
| `summary` | Markdown, min 10 chars | The paragraph under the README heading, the mkdocs page description (first paragraph, one line), the hub's `description`, store descriptions. Admonition shorthand allowed. |
| `kind` | `app` (default), `base`, `tool` | `app` is a long-running application: stores, install artefacts, the v1 image list. `base` only for `baseimage-*` repos (`builder check` ties the two together). `tool` is run-once images, project helpers and binaries other images copy in: built and released like any image, listed on their own tabs, left out of stores, k8s and quadlets. |
| `extras` | list of strings | Bullet points under the summary in the README and the mkdocs page. |
| `deprecation` | `{status, message}` | `status: true` puts the deprecation block at the top of the README and the docs page, flags the image in the hub and stores, and the container prints `message` at start. |
| `changelog` | list of `{date: YYYY-MM-DD, text}`, newest first | The Versions section; the hub's `changelog` and `initial_date` (the oldest entry). `builder check` fails on a date out of order or not ISO. Every Dockerfile or `root/` change adds an entry; documentation-only manifest edits do not. |

## `upstream`

| Field | Type | Drives |
| --- | --- | --- |
| `url` | URI | The project link in the README badges and the site header. Defaults to the repo URL. |
| `version` | version source | What the build and the control plane resolve to find the upstream version. The whole of [Version sources](/docs/maintain/version-sources/). |
| `notes` | notes source | Where upstream release notes come from; stored verbatim with the Release and shown on the build page. Same page. |
| `sponsor` | list of `{name, url}` | Written to `/donate.txt` in the image and shown on the image page. |

## `release`

| Field | Type | Drives |
| --- | --- | --- |
| `branch` | string | The git branch this manifest lives on. This is what makes a branch *live*: the workflow releases only when the branch it runs on equals `release.branch`, control schedules only branches whose own manifest names them, and the hub lists them. Builds of any other branch go to `dev/`. `builder check` fails when it does not match the checked-out branch. |
| `tag` | `^[a-z0-9][a-z0-9._-]{0,127}$` | The tag this branch publishes: `latest` on the default branch, otherwise usually the branch name. Every released tag of a non-default branch is prefixed with it (`develop-4.0.1-ls3`, `develop-version-4.0.1`). |
| `channel` | `stable`, `prerelease` | Marks the GitHub Release as a prerelease. |
| `tags` | list of `{tag, description, deprecated, unraid_extra}` | The Version Tags table in the README and the branch pickers in the stores. Only advertising: a branch releases because of its own `release.branch`, whether or not the default branch lists it yet. `deprecated` greys the row. `unraid_extra` is raw XML put inside the Unraid `<Branch>` element. The other tags are also taken as the names of the other live branches when the hub and the README need the list (`live_branches` in the render context), except `latest` and this branch's own tag. |

## `build`

| Field | Type | Default | Drives |
| --- | --- | --- | --- |
| `base` | `alpine`, `alpine-nginx`, `ubuntu`, `debian`, `fedora`, `arch`, `el`, `selkies`, `kasmvnc`, `rdesktop`, `scratch`, `other` | required | Package-manager aware steps in the build (`is_alpine` in templates), the base family shown on the site, which docs snippets apply. The `FROM` line itself lives in the Dockerfile. |
| `version_arg` | `^[A-Z][A-Z0-9_]*$` | `VERSION` | The Dockerfile `ARG` the build passes the resolved upstream version into (`--build-arg <version_arg>=<upstream>`). The Dockerfile should still fall back to resolving it itself when unset, so a local `docker build` works. |
| `platforms` | `amd64`, `arm64` (one or both) | required | The arch matrix, the Supported Architectures table, the multi-arch index, the hub's `architectures`. |
| `dockerfiles` | `{amd64, arm64}` | `Dockerfile`, `Dockerfile.aarch64` | Which file builds each platform. |
| `package_check` | boolean | `true` | Whether control includes the branch in the weekly package refresh. |
| `build_args` | map of string | | Extra `--build-arg` values on every build. |
| `first_party` | boolean | `true` | Inject `ENV LSIO_FIRST_PARTY=true` after `FROM`. `false` for base images. |

## `test`

What the `ci` container does after the image is built. Defaults apply when the key is absent.

| Field | Default | Meaning |
| --- | --- | --- |
| `enabled` | `true` | Run the harness at all. |
| `startup_timeout` | `120` (10 to 1800) | Seconds to wait for `[ls.io-init] done`. |
| `env` | | Extra environment for the test container. |
| `web.port` | | The port the browser probe hits; required when `web` is set. Without `web`, the required `runtime.ports` are what the harness checks. |
| `web.path`, `web.scheme`, `web.auth` | `/`, `http`, none | Path, scheme and `user:password` for the probe and the screenshot. |
| `web.screenshot_delay`, `web.screenshot_timeout` | `10`, `120` | Seconds; selkies, kasmvnc and rdesktop bases wait longer by decision. |
| `sbom_timeout` | `900` | Seconds for the syft scan. |

## `runtime`

The parameter table, the compose and `docker run` snippets, every store template, the Kubernetes manifest and the quadlet all come from this block. Every list item carries a `description` (shown in the table and the store UIs) and may be `optional: true`, which renders it with the `#optional` marker and leaves it out of the required-only snippets. `name` and `title` are short labels for store UIs.

| Field | Shape | Notes |
| --- | --- | --- |
| `container_name` | string | Default: `name`. |
| `common_env` | `true` (default), `false`, `"optional"` | Include PUID, PGID and TZ. When on, a `TZ` entry under `env` is dropped so it is not listed twice. |
| `network` | `{mode, description, optional}` | `--net=<mode>`. |
| `hostname`, `mac_address` | `{value, description, optional}` | Scalar flags. |
| `privileged` | `true`, `false` (default), `"optional"` | |
| `ports` | `{internal: "8080" or "1900/udp", external, description, name, optional}` | `external` defaults to the internal number. Required ports are also what the test harness checks are listening. |
| `volumes` | `{path, host_path, mode: rw|ro, description, name, optional, default_host_path}` | `host_path` defaults to `/path/to/<name>/<last path segment>`. `default_host_path: true` tells store UIs to prefill it (for `/lib/modules` and the like). |
| `env` | `{name, value, description, title, options, optional, secret}` | `value` is the example shown. `options` renders a dropdown in stores. `secret` masks the value in UIs and defaults to true when the name contains `TOKEN`, `PASS` or `KEY`. Mixed-case names are allowed because some applications need them. |
| `devices` | `{path: /dev/..., host_path, description, name, optional}` | `host_path` defaults to `path`. |
| `cap_add` | `{cap: UPPER_CASE, description, optional}` | |
| `security_opt` | `{run, compose, description, optional}` | Both spellings are given because they differ (`seccomp=unconfined` vs `seccomp:unconfined`). |
| `custom` | `{flag, compose, value: string or list, description, optional}` | Any other `docker run` flag with its compose key (`shm-size` / `shm_size`, `sysctl` / `sysctls`). |
| `readonly`, `nonroot` | `{supported, notes}` | `supported: true` adds the Read-Only Operation or Non-Root Operation section with `notes` under it, and the hub exposes the flags. Record what has been tested, not what might work. |

**Ordering.** Within each list the renderer puts required items first, then optional ones, both in manifest order. Write them in the order you want users to read them.

## `docs`

| Field | Drives |
| --- | --- |
| `categories` (required, one or more) | The category filters on the site and the stores. Keep the names LinuxServer curated in readme-vars. |
| `logo` | URL of the project logo, shown under the summary and in the site header. |
| `setup` | The Application Setup section, Markdown. The one place for how to use the app. Admonitions as `?+note[Title](|text|)` (severities: note, tip, info, warning, danger, bug, question, success, failure, abstract, quote). |
| `optional_parameters` | A Markdown section after the parameters table, for parameters that need prose. |
| `notices` | Flags that pull in a standard sub-section under Application Setup: `hwaccel` (Hardware Acceleration), `keyboard` (Keyboard Layouts), `media` (Media folders), `seccomp`, `strict_proxy` (the image serves https itself), `kasm` (the legacy Security section), and `selkies: {enabled, nvidia, https_port, http_port}` (the Selkies section, with its ports; defaults 3001 and 3000). The texts are in `builder/templates/parts/`. |
| `external_application` | `{cli, compose, unraid, kubernetes}`: snippets for a second container the app needs, such as a database, one per surface. |
| `custom_readme` | Replaces the whole generated README body. Internal tools only. |
| `init_diagram` | Default `true`: emit the s6 dependency graph into the bundle and docs. |

## `proxy`

Present only when the app is proxied. The hub generates the SWAG sample confs from it and pushes them to the proxy confs repository.

| Field | Default | Meaning |
| --- | --- | --- |
| `port` | required | The upstream port SWAG proxies to. |
| `scheme` | `http` | |
| `subdomain` | `true` | Generate the subdomain sample. |
| `subfolder` | | `{supported, base_url_note}`: generate the subfolder sample; the note says where in the app the base URL is set. |
| `api_locations` | | Paths that bypass the auth includes (`/api`). |
| `websocket` | `false` | Add the websocket headers. |
| `extra_locations` | | `{path, port, scheme, auth, raw}`: more `location` blocks, with raw nginx directives if needed. |
| `notes` | | Comment lines at the top of the sample. |

## `publish`

Per-surface switches for `app` images. Base images and tools are left out of all of them regardless.

| Field | Default | Meaning |
| --- | --- | --- |
| `stores.unraid`, `portainer`, `casaos`, `umbrel`, `runtipi`, `cosmos` | all `true` | Generate that store's template. Arcane follows Portainer. |
| `unraid.requirement`, `unraid.webui` | | Text for `<Requires>`; an override for the WebUI URL template. |
| `kubernetes.enabled`, `workload`, `persistence` | `true`, `Deployment`, required volumes | Generate the manifest; `StatefulSet` for apps that need stable identity; which volume paths get a PersistentVolumeClaim. |
| `quadlet` | `true` | Generate the Podman quadlet unit. |

## What `builder check` enforces beyond the schema

`builder check` runs in every pull request and live build (from `ghcr.io/linuxserver-playground/builder:latest`), and these are the rules it adds on top of schema validation. Each finding names the file, the field as a JSON path and the line.

- Generated files (`README.md`, `AGENTS.md`, `LICENSE`, `.github/workflows/build.yml`, `pr-report.yml`) must match a fresh render: an error on the live branch's own check, a warning in PR and branch builds, where the live build re-renders after merge.
- `Dockerfile` and `Dockerfile.aarch64` differ only in `FROM` lines (a warning otherwise).
- Every s6 `run`, `finish` and `check` script is executable, starts with `#!/usr/bin/with-contenv bash` and carries `# shellcheck shell=bash`.
- `kind: base` and a `baseimage-*` name go together.
- The changelog is newest first with ISO dates.
- `release.branch` is the branch checked out.
- `require_assets` patterns need a release source and must compile as a regex.
- Nothing under the repo looks like a credential (GitHub tokens, AWS keys, private keys).

The checks live in [`builder/check.py`](https://github.com/linuxserver-playground/builder/blob/main/builder/check.py); add a test in `tests/test_check.py` with any new one.
