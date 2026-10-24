---
title: How a build happens
description: "One release of sonarr, from a push to its page on this site: the image.yml manifest, the shared workflow, the test harness, the Release bundle, the hub and its generators."
section: general
order: 16
group: Project
updated: 2026-10-24
aliases:
  - /general/how-a-build-happens/
---
Every LinuxServer.io image used to carry an 1,800-line Jenkinsfile, a `jenkins-vars.yml`, a `readme-vars.yml` and a handful of trigger workflows, and the documentation page was pushed to this site by the image build. In the v2 playground an image repository carries **one** hand-edited metadata file, `image.yml`, and one twenty-line workflow that calls a shared one. Everything downstream, the README, this page, the store templates, the Kubernetes manifest, the quadlet, the SWAG proxy conf, is generated from that manifest, and everything a build produces is attached to its GitHub Release for the hub to ingest.

This page follows one release of `sonarr` from a push to the moment its page appears here. The contract behind it is [`CONVENTIONS.md`](https://github.com/linuxserver-playground/builder/blob/main/CONVENTIONS.md) in the builder repository, which wins whenever this page and it disagree.

## The pieces

| Repository | Role |
| --- | --- |
| [`docker-<name>`](https://github.com/linuxserver-playground?q=docker-) | One image: `Dockerfile`, `Dockerfile.aarch64`, `root/`, `image.yml`. See [Contributing an image](/docs/general/contributing-an-image/). |
| [`builder`](https://github.com/linuxserver-playground/builder) | The contract (`CONVENTIONS.md`), the JSON Schemas, and the `builder` tool that validates `image.yml` and renders every generated file. |
| [`workflows`](https://github.com/linuxserver-playground/workflows) | The reusable GitHub Actions workflow `image-build.yml@v1` that every image calls. |
| [`ci`](https://github.com/linuxserver-playground/ci) | The test harness container: starts the image, watches it come up, writes the bundle assets. |
| [`control`](https://ci.thelamer.duckdns.org:8443/) | The public control plane: GitHub App, scheduler, fleet board, live run status, Discord notifications, CI badges. |
| [`hub`](https://linuxserver-playground.github.io/hub/) | Ingests the bundles, keeps the data in git, serves the [API](/docs/general/api/) and generates every downstream artefact. |
| [`stores`](https://github.com/linuxserver-playground/stores), [`proxy-confs`](https://github.com/linuxserver-playground/proxy-confs) | Generated output pushed by the hub for platforms that read a git repository. |
| [`site`](https://github.com/linuxserver-playground/site) | The www site, these pages included; reads the hub at build time. |

The flow, left to right:

1. **`image.yml`, `Dockerfile`, `root/`** in the image repository. A push, an upstream release or the weekly package check triggers
2. **`workflows`** (`image-build.yml`), which pushes the image to **ghcr.io** and publishes a **Release** (the tag and the bundle), and reports `build.summary` to
3. the **control plane** (live status, badges), which tells the **hub** that an image was released;
4. the **hub** ingests the Release bundle into `data/` in git and generates the **API, the image pages, the store templates, the Kubernetes manifests, the quadlets, the proxy confs and the build reports**, which
5. the **www site** (these pages included) and the **stores repository** consume.

## 1. Something changes

A live build starts for one of three reasons, recorded in the build record as `reason`:

* **push**: a maintainer merges a pull request to a *live branch*. A live branch is one whose `image.yml` names it in `release.branch`; `master` publishes `latest`, and a `develop` branch publishes `develop`. Every other branch is a *dev branch*: it builds, tests and publishes to `ghcr.io/linuxserver-playground/dev/<name>` for 30 days, but never releases.
* **upstream**: the control plane's scheduler resolved `upstream.version` from the manifest (a GitHub release, a JSON endpoint and `jq` expression, an Alpine or Debian package index, PyPI, npm, and so on) and found a version newer than the newest release of the branch. It sends a `repository_dispatch` to the image repository.
* **packages**: once a week the control plane asks for a package check. The image is built and tested as usual, then its package table is compared with the committed `package_versions.txt`. If nothing changed, nothing is released. If something did, the table is committed as `Update package versions` and that commit triggers the real release build, so a security fix in Alpine ships without anyone touching the repository.

`rebuild` (a base image changed, or a release was bad) and `manual` exist for maintainers. Pull requests build and test fully too, but publish to `ghcr.io/linuxserver-playground/untrusted-pr/<name>:pr-<number>-<sha7>`, never to a released tag, and those images are deleted when the PR closes.

## 2. Prepare

The shared workflow's first job reads `image.yml` and validates it against `image.schema.json`. It decides the mode (`live`, `dev` or `pr`), resolves the upstream version, and reads the next LinuxServer build number from the branch's newest GitHub Release: `4.0.20.3014-ls1` becomes `4.0.20.3014-ls2` if upstream has not moved, `4.0.21.0000-ls1` if it has. The number comes from Releases, never from a registry, so GHCR can be wiped and the sequence survives.

It then runs the `builder` container. On a live branch `builder render` regenerates `README.md`, `AGENTS.md`, `LICENSE` and `.github/workflows/build.yml` and commits them as `Update generated files [skip ci]` if they drifted; on a pull request `builder check` fails the build instead, with the file, field and line. Shellcheck runs over `root/`, every s6 `run` script is checked for its executable bit, and the job emits the platform matrix and the full tag set.

## 3. Build and test, per architecture

One job per platform in `build.platforms`, on a native runner (`ubuntu-24.04` for amd64, `ubuntu-24.04-arm` for arm64; nothing is emulated). Each job:

1. injects `ENV LSIO_FIRST_PARTY=true` after `FROM` (see [Container Branding](/docs/general/container-branding/)),
2. builds with `--no-cache --pull`, provenance and SBOM attestations, and the OCI labels listed in CONVENTIONS §5 (`org.opencontainers.image.version`, `.revision`, `.source`, `io.linuxserver.image.base` with the digest of the base image, and the legacy `build_version`),
3. pushes the result to a **staging** reference, `ghcr.io/linuxserver-playground/build/<name>:<arch>-<sha7>-<run id>`, which no user ever pulls,
4. runs the `ci` container against exactly that reference: it starts the container with the manifest's parameters, waits for `[ls.io-init] done.`, probes `test.web` in a browser and takes a screenshot, records the init graph, and writes `test.<arch>.json`, `packages.<arch>.json.gz` (syft), `layers.<arch>.json`, `files.<arch>.json.gz`, `package_versions.<arch>.txt` and the HTML report tarball,
5. uploads all of that as a workflow artifact, whatever the test result. A failed test fails the job, but only after the evidence is saved.

A pull request from a fork runs the same steps without any secret: the image is saved into the artifact instead of being pushed.

## 4. Publish and release

The publish job runs when every architecture has finished. Only if prepare and every arch job succeeded does it create the multi-platform indexes and the arch-prefixed twins for the whole tag set from the staging references, in one step; a run that fails anywhere leaves every released tag untouched, so `latest` is never a half-published image.

It writes `build.json`, validates it against `bundle.schema.json`, creates the git tag at the built commit and the GitHub Release on the branch, and attaches the bundle: `build.json`, and per architecture the syft packages, layers, file list, test report, report tarball and package table. The release notes have three sections: **CI** links to the build's page, **LinuxServer changes** are GitHub's generated notes since the previous release of the branch, **Upstream changes** are fetched from `upstream.notes`.

Finally it POSTs a signed `build.summary` event to the control plane, which updates the fleet board, flips the badge, posts to Discord and sends the hub a `repository_dispatch` of type `image-released`.

### Versions and tags

| Tag | `sonarr` master | `sonarr` develop | Meaning |
| --- | --- | --- | --- |
| `T` | `latest` | `develop` | The branch's release tag. Follows every release. |
| `[T-]<upstream>-ls<N>` | `4.0.20.3014-ls1` | `develop-5.0.1.1234-ls7` | One exact build. The git tag and GitHub Release carry this name. |
| `[T-]version-<upstream>` | `version-4.0.20.3014` | `develop-version-5.0.1.1234` | The newest LinuxServer rebuild of that upstream version. |
| `[T-]<semver>` | `4.0.20` | `develop-5.0.1` | Derived when the upstream version contains `MAJOR.MINOR.PATCH`. |
| `amd64-...`, `arm64v8-...` | `amd64-latest` | `arm64v8-develop` | Single-architecture twins of every tag above. |

`<upstream>` is the resolved upstream version with `~ , % @ + ; : /` and spaces removed. `N` starts at 1 per branch and increments on every release of that branch.

## 5. The hub ingests

Within minutes the hub's workflow downloads `build.json` and the small assets from the Release, validates them (a bundle that fails the schema is recorded under `rejected` in [`/api/v1/status.json`](https://linuxserver-playground.github.io/hub/api/v1/status.json) and retried every run), computes the diff against the previous build of the branch (packages per ecosystem, config, base image, size, Dockerfile) and commits the result to `data/` as `Update data`. Every hour it also reconciles every repository and release it may have missed, polls stars and the GHCR tag list, and refreshes the mods index. Nothing in `data/` is hand-edited.

From `data/` the hub builds the static [API](/docs/general/api/) and runs its generators:

| Generator | Output | Consumed by |
| --- | --- | --- |
| `docs` | `images/docker-<name>.md`, `images-by-category.md` | Markdown copies of the image pages, for anyone who wants them; [this site](#6-this-page) reads the catalog JSON instead. |
| `unraid`, `portainer`, `casaos`, `umbrel`, `runtipi`, `cosmos` | Store templates per platform | The [platform stores](/docs/general/platform-stores/). |
| `proxy` | `<name>.subdomain.conf.sample`, `<name>.subfolder.conf.sample` | The `proxy-confs` repository that [SWAG](/docs/general/swag/) pulls. |
| `kubernetes`, `quadlet` | `<name>.yaml`, `<name>.container` | [Kubernetes](/docs/general/kubernetes/), [Podman](/docs/general/podman-quadlet/); also at `/api/v1/catalog/<name>/`. |
| `mods` | `mod-list.yml`, `/api/v1/mods.json` | The image pages' mod badges, the control plane. |
| `builds` | `/builds/<name>/<tag>/` | Humans. The test table per architecture, screenshot, logs, diff summary and release notes, with the report tarball unpacked beside it. |

## 6. This page

The www site, this page included, is rebuilt on every push, once a day, and whenever the hub sends it a `repository_dispatch` of type `hub-updated`. The build runs [`scripts/refresh-data.mjs`](https://github.com/linuxserver-playground/site/blob/main/scripts/refresh-data.mjs), which snapshots the hub's catalog, builds, mods, stores and fleet data into `src/data/`, and then renders a page for every image and every retained build from those snapshots. No image page is written by hand, and a change to an image's documentation is a change to its `image.yml`. The pages in this documentation section are the only hand-written Markdown in the site repository; [CONTRIBUTING.md](https://github.com/linuxserver-playground/site/blob/main/CONTRIBUTING.md) explains how to edit them.

## Where to look when something is wrong

| Question | Where |
| --- | --- |
| Is a build running, did the last one pass? | Control plane: [fleet board](https://ci.thelamer.duckdns.org:8443/), `/images/<name>`, `/runs`. |
| Why did the test fail, what does the app log say? | Hub: `/builds/<name>/<tag>/`, linked from the Release notes and the control plane. |
| What changed between two releases? | Hub: `/api/v1/catalog/<name>/builds/<tag>/diff.json`, summarised on the build page. |
| Which images ship package X, at which version? | Hub: `/api/v1/packages/<package>.json`. |
| Is the hub current? | Hub: `/api/v1/status.json` (source freshness and rejected bundles). |
| Which image is on a base that has since been rebuilt? | Hub: `/api/v1/fleet/staleness.json`. |
