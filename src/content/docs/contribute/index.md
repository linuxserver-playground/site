---
title: Contributing to LinuxServer.io
description: LinuxServer.io is a community project that needs people more than money. The ways to help, how to start without knowing the system, and what we ask of every contribution.
section: contribute
order: 0
updated: 2026-10-27
tags: [contribute, get involved, volunteer, pull request, ai, agent, harness]
---
LinuxServer.io has been run by volunteers for over a decade. Every image, mod and page on this site is kept up by people giving their free time, and today that is a small group looking after a large fleet. Donations pay for hosting. What keeps the images alive is people: someone who fixes the image they run, writes the mod they need or brings the app they want.

That used to mean learning a lot first. The fleet is built by a pipeline spread over a dozen repositories, with conventions, generated files and years of history. You no longer have to learn all of that before your first change. Start an AI coding agent in [the harness](/docs/contribute/ai-agents/) and it reads the system for you, tests in your own Docker and drafts the pull request. You stay in charge of what gets filed.

## Ways to help

| You want to | Start here |
| --- | --- |
| Fix a bug, add a package or a setting to an image you use | [Contributing an image](/docs/contribute/contributing-an-image/) |
| Add something only some users need (a tool, a driver, a plugin) | [Making a mod](/docs/contribute/making-a-mod/) |
| See an app we do not ship yet | [Proposing an image](/docs/contribute/proposing-an-image/) |
| Fix or add a docs page | [Improve the docs](#improve-the-docs), below |
| Add a desktop app to [PRoot Apps](/proot-apps/) | The [proot-apps repository](https://github.com/linuxserver-playground/proot-apps) |
| Work out why a build is red, or what an issue means | [Contributing with an AI agent](/docs/contribute/ai-agents/) |
| Review someone else's pull request | [Contributing with an AI agent](/docs/contribute/ai-agents/#reviewing) |
| Help other users | [Discord](https://discord.gg/YWrKVTn) and the forum ([Support](/support/)) |

The best first contribution is usually the thing that annoyed you this week. Look at the [open issues](/fleet/issues/), the [pull requests](/fleet/pulls/) waiting for review and the red branches on the [fleet board](/fleet/) if you want something to pick up.

## Improve the docs

The pages under [Docs](/docs/) are Markdown files in the [site repository](https://github.com/linuxserver-playground/site), under `src/content/docs/`. Each page has **Edit this page on GitHub** at the bottom: change it in the GitHub web editor and propose the change, and GitHub opens the pull request for you. With the harness, ask your agent instead: *"The swag docs page doesn't explain X. Fix it and draft the PR."* [`CONTRIBUTING.md`](https://github.com/linuxserver-playground/site/blob/main/CONTRIBUTING.md) in the site repository explains the front matter and the house style.

An image's own page (parameters, setup, version tags) is not a docs page. It is generated from the image's `image.yml`, so fix it there, in the image's repository. The same goes for a mod's page and its `mod.yml`.

## What we ask

These hold whether you use an agent or not:

* **Disclose AI use.** Say in the pull request which tool you used and for what. AI-assisted contributions are welcome; undisclosed AI-generated pull requests are closed.
* **A person is accountable.** You open the pull request, you have read and understood every line, you have run the result, and you can answer review questions in your own words. Agents draft; people file. Fully autonomous agents must not open pull requests or issues.
* **One focused change, finished.** The smallest change that does the job, tested before you open it. Every push to a pull request rebuilds and retests both architectures.
* **A pull request is a proposal.** It may be declined even if it works, most often because it belongs upstream or in a mod. [Contributing an image](/docs/contribute/contributing-an-image/#decide-where-the-change-belongs) explains where changes belong.

## What happens next

When you open a pull request from your own fork, GitHub holds the build until someone on the team approves the run. Then both architectures build and test, with no secrets, and one comment on your pull request reports the tests, screenshots and package changes. A maintainer reviews it, often by building it locally with an agent of their own. Merging releases it, and the build's page appears on this site within minutes.

If nothing has happened for a few days, ask on the pull request or on Discord. A small team means slow days, not a lack of interest.

## Becoming part of the team

The [team](/about/#team) grows from the people who contribute. Keep at it, review other people's work, help in the issues, and tell us on Discord when you want to take on more: maintaining an image, a group of mods or part of the infrastructure.
