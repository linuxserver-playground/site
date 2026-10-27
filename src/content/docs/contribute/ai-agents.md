---
title: Contributing with an AI agent
description: The harness gives an AI coding agent everything it needs to know about LinuxServer.io, so you can fix images, make mods and review pull requests without learning the whole system first.
section: contribute
order: 1
updated: 2026-10-27
tags: [ai, agent, harness, claude, codex, contribute, pull request]
---
LinuxServer.io is a lot of system: a dozen infrastructure repositories, hundreds of image repositories, a manifest format, generated files, a build pipeline and a decade of conventions. A newcomer used to need weeks to find their way around before making a useful change. An AI coding agent can read all of it in minutes, if it knows where to look and what the rules are.

The [harness](https://github.com/linuxserver-playground/harness) is that knowledge, packaged. It is a repository you clone and start your agent in. It holds a map of the whole system, a playbook for every kind of request, our rules, and commands to fetch repositories, validate changes and run images in your own Docker. You ask in plain words; the agent does the reading.

## What you need

* git, the [GitHub CLI](https://cli.github.com/) signed in (`gh auth login`), jq, curl and Docker.
* An AI coding agent that reads `AGENTS.md`: [Claude Code](https://github.com/anthropics/claude-code) or any other. Most need an account with their provider.
* Python 3.12+ and Node 22+, only if you change the infrastructure (the hub, the site, the build tools).

A machine that can run Docker is enough for images and mods. Your machine builds for its own architecture; the pull request build covers the other one.

## Start

```bash
gh repo clone linuxserver-playground/harness && cd harness
./harness doctor        # what you have, and what anything missing rules out
./harness core          # clone the infrastructure repositories into repos/ (about a minute)
claude                  # or start any agent that reads AGENTS.md here
```

Then ask *"What can I ask you?"*. The agent works out whether you are on the team or contributing from outside (it asks GitHub), and follows the right path for you.

## What to ask

Say what you want to end up with: an answer, an issue, a pull request or a review.

### Understanding

* "Explain the newest red build on the fleet board. Is it us, upstream or a network flake?"
* "Walk me through what happens from a push to docker-sonarr until the website shows the release."
* "Explain issue `<number>` on docker-`<image>`. What happens if nobody fixes it?"
* "Which images ship openssl, and at what versions?"

### Fixing and improving an image

* "My `<image>` container `<what goes wrong>`. Reproduce it, fix it and draft the PR."
* "Add the `<package>` package to the `<image>` image, test it and draft the PR."
* "Add an environment variable to `<image>` that sets `<setting>`."

The agent builds the image, runs it in your Docker and checks it survives a restart before it calls the change done. [Contributing an image](/docs/contribute/contributing-an-image/) is what it follows.

### Mods

* "Make a mod that installs yt-dlp into any image, and test it."
* "The `<branch>` mod fails on Ubuntu-based images. Fix it."

See [Making a mod](/docs/contribute/making-a-mod/).

### New images

* "I'd like LinuxServer to ship an image for `<app>`. Check it fits and draft the proposal."

See [Proposing an image](/docs/contribute/proposing-an-image/).

### Reviewing

* "Review PR 6 on docker-heimdall. Build it, run it and compare it with the released image."
* "Does this PR follow the rules? Generated files, changelog, both Dockerfiles?"

A review you run for yourself teaches you the system faster than anything else. Post it on the pull request if you think it helps; the agent drafts it, and you decide.

### Docs

* "The `<page>` docs page doesn't explain `<thing>`. Fix it and draft the PR."

## You stay in charge

* **The agent drafts, you file.** It shows you every issue, pull request and review before anything is sent, and runs the `gh` command only when you approve.
* **Contributors work in forks.** `./harness fork <repo>` makes your fork the place you push to. A guard stops pushes to the organisation's repositories and points back to the fork.
* **Ask it to show its work.** Every claim should come with a link or a command you can run. If an answer looks wrong, say why: it re-checks rather than defends.
* **You answer for the change.** Read the diff, run the image, and be ready to explain it in review in your own words. Say which agent you used in the pull request description.

## What you can do from outside the team

| What | Contributors | The team |
| --- | --- | --- |
| Understand anything: builds, issues, the fleet, the data | yes | yes |
| Fix an image, a mod, docs or infrastructure | a fork and a pull request | a branch and a pull request |
| A new mod | a working mod in your fork, and an issue asking for its branch | a new branch |
| A new image | a [proposal](/docs/contribute/proposing-an-image/) | a new repository, reviewed by pull request |
| Blog posts | suggest a topic in an issue | yes |
| Rerun, dispatch, skip builds | ask on the pull request | yes |

## Without the harness

Every image, mod and infrastructure repository has its own `AGENTS.md` saying what may change there, how to validate it and what the pull request rules are. Any agent started in a plain clone reads it. The harness adds the map between repositories, the playbooks and the local testing tools, which is what makes a first contribution easy. And everything here can be done by hand: the other pages in this section are written for people too.
