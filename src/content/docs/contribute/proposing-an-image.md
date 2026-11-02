---
title: Proposing an image
description: New applications start in LinuxServer Labs. A summary of what qualifies and how to propose one, with the full guide on the Labs site.
section: contribute
order: 5
updated: 2026-11-02
tags: [new image, proposal, labs, request, contribute]
---
Want an app we do not ship? New applications start in **[LinuxServer Labs](https://linuxserverlabs-playground.github.io/site/)**: a second organisation, [`linuxserverlabs-playground`](https://github.com/linuxserverlabs-playground), for open-source, self-hosted software that is new or not yet well known. Labs images are built, tested and released by the same pipeline as the main fleet, on the same base images, and published to `ghcr.io/linuxserverlabs-playground/<name>`. The good, popular and maintained ones graduate to the main fleet.

**The full guide is on the Labs site: [Get your app into Labs](https://linuxserverlabs-playground.github.io/site/propose/).** It covers what qualifies and why, building and running your app's image on your own machine from the Labs template, using the harness with an AI agent, every field of the proposal form, and what happens after you propose. This page is the short version.

## What qualifies

* **The upstream is owned by an organisation,** on GitHub or any git host, never a personal account. No exceptions: an organisation is free to create.
* **An approved open-source licence.**
* **Stable, versioned releases** with release assets whose names stay the same from release to release, or a source release the image can build.
* **A self-hosted web application** (or a desktop app on the Selkies base) that fits the LinuxServer container design: s6, `PUID` and `PGID`, state under `/config`, a web interface on a port.
* **It works with just the container:** an embedded database option, no companion containers.
* **No paywalled shells,** and any telemetry disclosed and optional.
* **amd64 only is allowed,** and the name must be free across Labs, the main fleet and LinuxServer's own images.

The guide gives the reason for each rule: [What qualifies](https://linuxserverlabs-playground.github.io/site/propose/#what-qualifies).

## How to propose

1. **Optionally, prove it first.** Copy [docker-template](https://github.com/linuxserverlabs-playground/docker-template) into your own organisation, fill in `image.yml`, then build and run the image locally. Link the repository from your proposal. See [Prove it first](https://linuxserverlabs-playground.github.io/site/propose/#prove-it-first-build-it-locally).
2. **Fill in the [proposal form](https://github.com/linuxserverlabs-playground/proposals/issues/new/choose),** from real links. In [the harness](/docs/contribute/ai-agents/), an AI agent can check the bar and fill it in with you: *"I'd like `<app>` in LinuxServer Labs. Check it meets the bar and draft the proposal."*
3. **A workflow checks it** against the real upstream and labels it `meets-bar` or `needs-info`. Edit the issue to fix what it flags.
4. **A team member tries it** in a sandbox, then creates the image's repository and opens its first pull request, crediting you. The image is listed as [in review](https://linuxserverlabs-playground.github.io/site/proposals/) while the team reviews the build's report.
5. **A member merges it,** and the image is published and rebuilt on every upstream release from then on.

Before proposing, check it is not here already: search the [catalogue](/images/), the [Labs images](https://linuxserverlabs-playground.github.io/site/images/) and the [open proposals](https://github.com/linuxserverlabs-playground/proposals/issues).
