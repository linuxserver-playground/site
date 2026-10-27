---
title: Making a mod
description: When a mod is the right answer, what one is made of, and how to build, test and submit it, with an AI agent or by hand.
section: contribute
order: 4
updated: 2026-10-27
tags: [mods, docker mods, DOCKER_MODS, contribute]
---
A [Docker Mod](/mods/) is a small layer a LinuxServer container downloads and applies when it starts, set with `DOCKER_MODS`. Mods are how the images grow without getting heavier for everyone: an extra package, a driver, a plugin or a helper service that only some users want belongs in a mod, not in the image. Most of the mods on this site were written by users who needed them.

## With an agent

In [the harness](/docs/contribute/ai-agents/), ask for what you need:

* "Make a mod that installs `<tool>` into `<image>`, and test it."
* "Make a universal mod that `<what you need>` in any image, and test it."
* "The `<branch>` mod `<what is wrong>`. Fix it, test it and draft the PR."

The agent starts from the `template` branch, writes the `Dockerfile`, the init scripts and `mod.yml`, renders the generated files, applies the mod to a real container in your Docker and shows you the log. The rest of this page is what it follows, and what you should check.

## What a mod is

Each mod is one branch of [`docker-mods`](https://github.com/linuxserver-playground/docker-mods), named `<target>-<name>`: `target` is the image it applies to, or `universal` for any image. The branch holds:

| File | What |
| --- | --- |
| `Dockerfile` | Ends `FROM scratch` and copies in a single layer. A build stage before it can download or compile anything. |
| `root/` | Files copied over `/` in the container: s6-overlay init scripts and services, default config. |
| `mod.yml` | The manifest: name, target, title, summary, maintainers, the other `images` it suits, the environment variables it reads, its docs. The mod's page on this site comes from it. |
| `README.md`, `AGENTS.md`, `.github/workflows/build.yml` | Generated from `mod.yml` by `builder render-mod`. Never edit them by hand. |

A mod that needs distribution packages does not install them itself: it appends them to `/mod-repo-packages-to-install.list` (or the pip list), and one install step handles every mod, for Alpine and Ubuntu bases alike. A mod that installs one upstream tool at a pinned version gets an `upstream` block in `mod.yml`, and the scheduler rebuilds it whenever the tool has a new release.

The [`docker-mods` README](https://github.com/linuxserver-playground/docker-mods#creating-and-maintaining-a-docker-mod) has the full layout of the s6 units, the package lists and the `mod.yml` reference.

## Build and test it

```bash
gh repo fork linuxserver-playground/docker-mods --clone && cd docker-mods
git fetch upstream template && git switch -c <target>-<name> upstream/template
# edit Dockerfile, root/ and mod.yml, then render the generated files:
docker run --rm -v "$PWD":/repo --user "$(id -u):$(id -g)" ghcr.io/linuxserver-playground/builder:latest render-mod
```

Then run `tools/check-branch.sh` and `tools/test-mod.sh` from the `master` branch against your checkout. `test-mod.sh` builds the mod, applies it to its target image (or a base image for a universal mod), waits for `[ls.io-init] done.` and prints the log, where your mod's own lines appear. Keep that output: mod pull requests get less checking in CI than image pull requests, so your test is what the reviewer reads.

## Submit it

1. **A new mod needs its branch first.** Only the team can create branches in `docker-mods`, so open an issue there with the proposed `<target>-<name>`, what it installs and for which images, your `mod.yml` and the test output. A member creates the branch from `template`.
2. **Open the pull request against that branch,** never `master`, with the commits squashed. The title follows the mods convention: `<target>: <name> <short description>`, for example `code-server: python2 add python-pip`.
3. **Disclose AI use** in the description, as for [every contribution](/docs/contribute/#what-we-ask).

A change to an existing mod skips step 1: open the pull request against its branch.

You are the mod's maintainer: your login goes in `mod.yml` `maintainers`, so we can reach you when a base image change affects it.
