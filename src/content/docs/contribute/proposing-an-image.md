---
title: Proposing an image
description: How to ask for an app LinuxServer.io does not ship yet, what makes a good fit, and how to show it working.
section: contribute
order: 5
updated: 2026-10-27
tags: [new image, proposal, labs, request, contribute]
---
Want an app we do not ship? Propose it. A good proposal is made of facts, not enthusiasm, and the best ones come with a scaffold that already runs.

> [!NOTE]
> We are setting up **Labs**: a home outside the main fleet where new images and experiments can grow before they join it. Until it opens, a proposal is an issue on the [harness repository](https://github.com/linuxserver-playground/harness/issues) with a title starting `Proposal:`. This page will change when Labs opens.

## With an agent

In [the harness](/docs/contribute/ai-agents/), ask: *"I'd like LinuxServer to ship an image for `<app>`. Check it fits and draft the proposal."* The agent checks the image does not exist already, reads the upstream project, fills in the proposal from real data, and shows it to you before filing. Ask it to build a scaffold too, if you want to show the app running.

## Does it fit?

LinuxServer images are long-lived, multi-architecture images of self-hosted applications, on our s6 base images, maintained for years. Before proposing, check:

* **It is not here already.** Search the [catalogue](/images/), the [open proposals](https://github.com/linuxserver-playground/harness/issues?q=is%3Aissue+Proposal) and LinuxServer's own fleet. If it is proposed, add your evidence to that issue instead.
* **The licence** lets us redistribute it.
* **Upstream ships releases** with a version we can read by machine: GitHub releases, a package index or a JSON API.
* **It runs on amd64 and arm64**, or says clearly why not.
* **What it needs:** a GUI (our Selkies bases), a database, special devices.
* **Why ours.** If an official image exists, what would ours do better?

## Write the proposal

Open an issue titled `Proposal: <app>` with the answers to the checklist above, each with a link, plus the existing image most like it (its "model") and the base image it would use. Keep it short and factual.

## Show it running (optional)

A proposal with a working scaffold is far easier to say yes to. Build one in a repository in your own account, `docker-<app>`, in our layout: `image.yml`, `Dockerfile`, `Dockerfile.aarch64` and `root/`, on the playground base images. [Contributing an image](/docs/contribute/contributing-an-image/) describes each file, and any existing image repository is a worked example. Validate it with `builder check`, run it, and link it from the proposal with the output.

## What happens next

The team reads proposals and decides with you. When one is accepted, a member creates the repository from your scaffold or the proposal, and you are credited in the pull request. If you want to maintain the image yourself, say so: that makes a yes much more likely.
