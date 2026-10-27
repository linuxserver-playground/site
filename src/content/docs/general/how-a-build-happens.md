---
title: How a build happens
description: "What triggers a build, how it is tested and released, the tags every release publishes, and where to find the results."
section: general
order: 16
group: Project
updated: 2026-10-24
aliases:
  - /general/how-a-build-happens/
---
Every image repository carries one manifest, `image.yml`, and calls a shared GitHub Actions workflow. The
README, the image page, the store templates, the Kubernetes manifest, the quadlet and the SWAG proxy conf are
all generated from that manifest. The contract is
[`CONVENTIONS.md`](https://github.com/linuxserver-playground/builder/blob/main/CONVENTIONS.md).

| Repository | Role |
| --- | --- |
| [`docker-<name>`](https://github.com/linuxserver-playground?q=docker-) | One image: `Dockerfile`, `Dockerfile.aarch64`, `root/`, `image.yml`. See [Contributing an image](/docs/contribute/contributing-an-image/). |
| [`builder`](https://github.com/linuxserver-playground/builder) | The contract, the JSON Schemas and the `builder` tool that validates `image.yml` and renders the generated files. |
| [`workflows`](https://github.com/linuxserver-playground/workflows) | The shared build workflow every image calls. |
| [`ci`](https://github.com/linuxserver-playground/ci) | The test harness. |
| [`control`](https://github.com/linuxserver-playground/control) | The scheduler, live status and notifications behind the [fleet pages](/fleet/). |
| [`hub`](https://github.com/linuxserver-playground/hub) | The [API](/docs/general/api/) and every generated artefact. |

## 1. Something changes

A live build starts for one of three reasons, recorded in the build as `reason`:

* **push**: a change is merged to a *live branch*, one whose `image.yml` names it in `release.branch`. `master` publishes `latest`, and a `develop` branch publishes `develop`. Every other branch builds, tests and publishes to `ghcr.io/linuxserver-playground/dev/<name>` for 30 days, but never releases.
* **upstream**: the scheduler found an upstream version newer than the branch's newest release.
* **packages**: once a week the image is rebuilt and its package table compared with the committed `package_versions.txt`. If something changed, a release follows.

`rebuild` (a base image changed, or a release was bad) and `manual` exist for maintainers. Pull requests build and test fully, but publish to `ghcr.io/linuxserver-playground/untrusted-pr/<name>:pr-<number>-<sha7>`, and those images are deleted when the PR closes.

## 2. Build and test, per architecture

Each architecture builds on a native runner (amd64 and arm64; nothing is emulated). The image is started with
its documented parameters, checked until init completes, probed in a browser for a screenshot, and scanned for
its packages and files. A failed test fails the build, after the results are saved.

## 3. Publish and release

Only when every architecture passes are the released tags created, so `latest` is never a half-published
image. The GitHub Release carries the build record and the test results, and its notes link to the build's
page on this site, the LinuxServer changes since the previous release and the upstream release notes.

### Versions and tags

| Tag | `sonarr` master | `sonarr` develop | Meaning |
| --- | --- | --- | --- |
| `T` | `latest` | `develop` | The branch's release tag. Follows every release. |
| `[T-]<upstream>-ls<N>` | `4.0.20.3014-ls1` | `develop-5.0.1.1234-ls7` | One exact build. The git tag and GitHub Release carry this name. |
| `[T-]version-<upstream>` | `version-4.0.20.3014` | `develop-version-5.0.1.1234` | The newest LinuxServer rebuild of that upstream version. |
| `[T-]<semver>` | `4.0.20` | `develop-5.0.1` | Derived when the upstream version contains `MAJOR.MINOR.PATCH`. |
| `amd64-...`, `arm64v8-...` | `amd64-latest` | `arm64v8-develop` | Single-architecture twins of every tag above. |

`<upstream>` is the resolved upstream version with `~ , % @ + ; : /` and spaces removed. `N` starts at 1 per branch and increments on every release of that branch.

## Where to look

| Question | Where |
| --- | --- |
| Is a build running, did the last one pass? | The [fleet board](/fleet/) and [runs](/fleet/runs/). |
| Why did a test fail, what does the app log say? | The build's page, `/images/<name>/builds/<tag>/`. |
| What changed between two releases? | The build's page, or [`/api/v1/catalog/<name>/builds/<tag>/diff.json`](https://linuxserver-playground.github.io/hub/#endpoints). |
| Which images ship package X, at which version? | [Packages](/packages/). |
| Is the data current? | [`/api/v1/status.json`](https://linuxserver-playground.github.io/hub/api/v1/status.json). |
