---
title: Proposing an image
description: New applications start in LinuxServer Labs. What Labs is, the bar an app has to meet, how to propose one and what happens after.
section: contribute
order: 5
updated: 2026-11-02
tags: [new image, proposal, labs, request, contribute]
---
Want an app we do not ship? New applications start in **[LinuxServer Labs](https://linuxserverlabs-playground.github.io/site/)**. You propose it with a form, the team tries it, and if it works it is published there, built and tested by the same pipeline as the main fleet.

## What Labs is

Labs is a second organisation, [`linuxserverlabs-playground`](https://github.com/linuxserverlabs-playground), for container images of software that is newer or smaller than the main fleet's. A project that would take years to earn a LinuxServer image can publish in Labs, be used and get known there, and graduate to the main fleet once it is good, popular and maintained.

* **The same pipeline.** Labs images are built, tested and released by the main fleet's workflows, on the LinuxServer base images, and every build's layers, files, packages and tests are published on the [Labs site](https://linuxserverlabs-playground.github.io/site/).
* **A lower bar for the software, not for the process.** Nobody outside the team gets push access. You propose, and you contribute by pull request from a fork; team members create the repositories, review, merge and decide what goes live. An image's maintainers are credited and mentioned, which gives no access.
* **Docker images only,** published to `ghcr.io/linuxserverlabs-playground/<name>`. No Labs mods or PRoot Apps.
* **Not security reviewed.** The team reviews every change to a Labs repository, but not the application itself.

## The bar

A proposal is checked against these before anyone spends time on it:

* **The upstream is owned by an organisation,** on GitHub (preferred) or any git host, never a personal account. No exceptions: an organisation is free to create.
* **An approved open-source licence.**
* **Stable, versioned releases** we can ingest: release assets the image downloads (preferred), or a source release it builds, with asset names that stay the same from release to release.
* **A self-hosted web application** that fits the LinuxServer container design: s6, `PUID` and `PGID`, state under `/config`, a web interface on a port. Desktop applications run on the Selkies base.
* **It works with just the container.** An embedded database (SQLite or similar) must be an option, or the image bakes in its own fallback. No companion containers.
* **No paywalled shells.** Not a front end to a vendor's paid service. An open-source app that calls a hosted API is fine when the endpoint is configurable, such as an AI app that works with Ollama or any OpenAI-compatible server.
* **Any telemetry** is disclosed and can be turned off.
* **amd64 only is allowed;** arm64 is encouraged.
* **A unique name** across Labs, the main fleet and LinuxServer's own images.

Check it is not here already: search the [catalogue](/images/), the [Labs images](https://linuxserverlabs-playground.github.io/site/images/) and the [open proposals](https://github.com/linuxserverlabs-playground/proposals/issues).

## How to propose

Fill in the [proposal form](https://github.com/linuxserverlabs-playground/proposals/issues/new/choose). It asks for everything a team member needs to build the image and try it without asking you anything: the upstream repository and its latest stable release, the release asset per architecture (or that it builds from source), how it runs, its web port, where it writes state, its environment variables and database, what the first run looks like, a screenshot, and who maintains it. Answer from real links, not from memory.

### With an agent

In [the harness](/docs/contribute/ai-agents/), ask: *"I'd like `<app>` in LinuxServer Labs. Check it meets the bar and draft the proposal."* The agent reads the upstream project, checks the bar, fills in the form from real data and shows it to you before anything is filed.

## What happens next

1. **The first check.** A workflow in the proposals repository reads your form and checks it against the real upstream: the owner, the licence, the latest release and its asset names, and name collisions. It keeps one comment up to date with what passes and what is missing, and labels the issue `meets-bar` or `needs-info`. Edit the issue to fix what it asks for; it checks again.
2. **A team member tries it.** They build the image from your proposal and run it in a throwaway sandbox. Software that is not really self-hosted stops here.
3. **Pending approval.** The member creates `docker-<name>` in Labs and opens its first pull request, crediting you. Its build posts a report with the tests, screenshots and package table, and the image shows on the Labs site as [in review](https://linuxserverlabs-playground.github.io/site/#pending). You can improve it by pull request from a fork into that branch, or comment and leave the edits to the member.
4. **Published.** A member merges it. From then on the image rebuilds on every upstream release, and it has its pages on the Labs site.

An image that stops working, with releases that no longer build or assets that disappear, is flagged to its maintainers and archived if nobody fixes it. One that proves itself, used, maintained and building cleanly, can graduate to the main fleet.
