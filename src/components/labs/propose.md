## What Labs is

LinuxServer Labs is a second GitHub organisation, [`linuxserverlabs-playground`](https://github.com/linuxserverlabs-playground), for container images of open-source, self-hosted software that is new or not yet well known. A project that would take years to earn a place in the main LinuxServer.io fleet can publish an image here, be used and get known, and move to the main fleet once it is good, popular and maintained.

A Labs image is a LinuxServer image in every way that matters to the people running it:

* **The same pipeline.** It is built, tested and released by the workflows the main fleet uses, on the same base images, with every build's layers, files, packages, tests and screenshots published on this site.
* **The same container design.** s6 supervises the app, `PUID` and `PGID` set the user it runs as, its state lives under `/config`, and its web interface is on a port. Anyone who has run a LinuxServer image knows how to run a Labs one.
* **Rebuilt when upstream moves.** Labs checks the app's releases every hour and builds when a new stable release appears, with its files uploaded.
* **Published to GitHub's registry** as `ghcr.io/linuxserverlabs-playground/<name>`. Labs publishes Docker images only: no mods, PRoot Apps or store templates.

What is different is the bar for the software. Labs takes apps the main fleet would not yet, and the team does not review the application's code: it reviews every change to the image's repository, and builds what upstream publishes. That is why every Labs page says the software is not security reviewed.

**Who it is for.** Mostly the developers of a self-hosted app who want it packaged properly without maintaining a container setup of their own. Users who want an app they do not work on in Labs are just as welcome to propose it; the steps are the same.

**What does not change: the process.** Nobody outside the LinuxServer team gets push access to a Labs repository, including the developer of the app it packages. You propose, and you contribute by pull request from a fork. Team members create the repositories, review, merge and decide what goes live.

## What qualifies

Every rule is there because the pipeline needs it or because the team cannot support an image without it. A proposal is checked against the rules before anyone spends time on it, and there are no exceptions, so check them before you start.

### The upstream repository belongs to an organisation

The app's source lives under an organisation, on GitHub (preferred) or any other git host, never a personal account.

*Why:* projects that grow move out of personal accounts anyway, and a move later breaks every link, release URL and version check the image depends on. Doing it first costs nothing: an organisation is free to create, and GitHub keeps a transferred repository's history, issues, stars and releases, and redirects the old URL.

### An approved open-source licence

A `LICENSE` file with an OSI-approved licence that GitHub detects, named in the form by its SPDX id (`MIT`, `GPL-3.0-only`, `AGPL-3.0-or-later`).

*Why:* the image redistributes the app. A licence that does not allow that, or no licence at all, means it cannot be published.

### Stable, versioned releases with stable asset names

The app publishes stable, versioned releases (`v1.4.2`, with pre-releases marked as pre-releases). The image downloads a file attached to the release, one per architecture, and the names of those files stay the same from release to release apart from the version: `myapp-1.4.2-linux-amd64.tar.gz` is followed by `myapp-1.4.3-linux-amd64.tar.gz`. Building from the release's source archive is allowed when the project cannot ship binaries.

*Why:* nobody builds Labs images by hand. The scheduler reads the latest stable release, waits until the files the image needs are uploaded, and starts the build. Tags without a release, "build the main branch", or asset names that change shape every release break that automatically, and an image that cannot follow its releases is soon out of date.

### A self-hosted app in the LinuxServer container design

A web application with its interface on a port, or a desktop application, which Labs runs in the browser on its [Selkies](https://github.com/selkies-project/selkies) base. The image is built on a LinuxServer base image, with s6, `PUID`/`PGID` and state under `/config`. The app should keep all its state in one directory it can be told about, take its settings from environment variables, and work behind a reverse proxy.

*Why:* this is what makes every LinuxServer image run, back up and upgrade the same way. It is also what the tests check: every service stays up and the web interface answers.

### It works with just the container

An embedded database (SQLite or similar) must be an option. If the app really needs a server database, the image bakes one in and starts it itself as a fallback. No companion containers are required: no separate database, cache or worker container.

*Why:* anyone can try the image with one `docker run`, and the pipeline can test every build without extra infrastructure. An image that only works with three other containers is tested by nobody and debugged by everybody.

### No paywalled shells

An app whose main function is a vendor's hosted service is out: a glorified web link, or a web server that hosts a login page for someone's paid platform. An open-source app that calls a hosted API is fine when the endpoint is configurable. An AI app that works against Ollama or any OpenAI-compatible server qualifies, even if most people point it at a paid provider.

*Why:* Labs publishes self-hosted software. An image that is only useful with an account at one company is that company's client, and the image breaks the day their service changes.

### Telemetry is disclosed and can be turned off

Any telemetry, analytics or update check is described in the project's README and has a setting that turns it off.

*Why:* people run these images on their own networks and expect to know what leaves them.

### amd64 is enough, and the name must be free

An image for amd64 only is fine; arm64 is welcome when the project ships it. The image's name (lowercase letters, digits and dashes) must not be taken in Labs, in the main LinuxServer.io fleet or by LinuxServer's own images, so an image that graduates never has to be renamed. Search the [Labs images](/images/), the [main fleet](https://linuxserver-playground.github.io/site/images/) and the [existing proposals](https://github.com/linuxserverlabs-playground/proposals/issues?q=is%3Aissue) first.

## Prove it first: build it locally

You do not have to write a Dockerfile to propose an app: a team member builds the first image from your proposal. But the fastest way to a yes is to show it working. The [docker-template](https://github.com/linuxserverlabs-playground/docker-template) repository is a starter kit for exactly that: a working LinuxServer-style image, laid out like every LinuxServer image repository, that you copy into your own organisation, fill in for your app, and build and run on your own machine. Nothing is published from your copy: it runs no workflows and needs no secrets, so you can try as often as you like. The image you run locally is the evidence.

Its [GETTING-STARTED.md](https://github.com/linuxserverlabs-playground/docker-template/blob/main/GETTING-STARTED.md) is the full walkthrough, with every field and command. In outline:

### Create your repository from the template

Name it `docker-<name>`, where `<name>` is the image name you want. On [docker-template](https://github.com/linuxserverlabs-playground/docker-template), choose **Use this template** and create the repository under your organisation or account, or with the GitHub CLI:

```bash
gh repo create <your-org>/docker-<name> --public --clone \
  --template linuxserverlabs-playground/docker-template
```

The kit is a web application image. For a desktop program, swap in the files from `variants/selkies/`: it then runs in the browser on the Selkies base, which starts the program named in `root/defaults/autostart`.

### Fill it in

Every placeholder is marked `TODO`; `grep -rn TODO image.yml Dockerfile Dockerfile.aarch64 root` finds them all.

* **`image.yml`** is the manifest every LinuxServer image is described by. Its README, its build workflow and its page on this site are generated from it. The fields that matter most: `name`, `maintainers` (your GitHub login), `summary`, the upstream repository the image follows, `require_assets` (one regular expression per release asset, with `.*` where the version goes; a new release is built only once every asset is uploaded), the version argument the Dockerfiles read, the platforms, the web port, environment variables, and the setup notes users read after starting the container.
* **`root/`** holds the [s6-overlay](https://github.com/just-containers/s6-overlay) services, which you rename after your app: a oneshot that runs on every start and creates the folders your app writes to under `/config`, and a longrun service that starts your app in the foreground as the unprivileged user `PUID` and `PGID` set, listening on all interfaces.
* **`Dockerfile`** (amd64) and **`Dockerfile.aarch64`** (arm64) start from the playground's base images, download your release asset for the release tag they are given, and unpack it under `/app`. Drop `Dockerfile.aarch64` for an amd64-only image.

### Build and run it

```bash
docker build -t <name> .
docker run -d --name <name> -p 127.0.0.1:8080:8080 \
  -e PUID=1000 -e PGID=1000 -e TZ=Etc/UTC -v "$PWD/config":/config <name>
docker logs -f <name>
```

Without a version argument the build downloads the latest release; `--build-arg <NAME>_RELEASE=v1.2.3` builds a given one, as the pipeline does. Build arm64 with `-f Dockerfile.aarch64` on an arm64 machine. Use your app's own port. A desktop application is at `https://localhost:3001/` instead, and wants `--shm-size=1gb`.

When the log prints `[ls.io-init] done.`, open the app and go through its first run. Then check that it behaves like a LinuxServer image: the app runs as your `PUID`/`PGID`, not root (`docker top <name>`); everything it writes is under `./config`; and it comes back with its data after `docker restart <name>`, and after you remove the container and run it again with the same `./config`.

### Check it with builder

builder is the tool the pipeline checks and renders every image with. Run it from your repository's root, render the generated files first, then check everything:

```bash
docker run --rm -v "$PWD":/repo --user "$(id -u):$(id -g)" \
  -e GITHUB_REPOSITORY=linuxserverlabs-playground/docker-<name> \
  ghcr.io/linuxserver-playground/builder:latest render
docker run --rm -v "$PWD":/repo \
  -e GITHUB_REPOSITORY=linuxserverlabs-playground/docker-<name> \
  ghcr.io/linuxserver-playground/builder:latest check
```

`GITHUB_REPOSITORY` names the Labs repository your image would become, which makes builder apply the Labs rules (that `maintainers` is set and the image builds on a playground base image, for instance) and render the Labs version of the generated files. `check` prints `ok`, or one line per problem. Read the rendered `README.md`: it is the documentation your users would see.

### Link it from your proposal

Push your work and put the repository's URL in the proposal form's **Working repository** field. The automatic check confirms it is public and has `image.yml` and both Dockerfiles at its root, and the team member who takes your proposal starts the Labs image from your `image.yml`, Dockerfiles and `root/` instead of from scratch. The Labs image then lives in its own repository in the Labs organisation, where you improve it with pull requests from a fork.

## Use the harness with an AI agent

The [LinuxServer harness](https://github.com/linuxserver-playground/harness) is a repository you clone and start your AI coding agent in. It holds a map of the whole LinuxServer system, a playbook for each kind of request, the project's rules and the commands to test locally, so the agent knows how Labs works without you explaining it. It works with Claude Code or any agent that reads `AGENTS.md`.

### Start it

You need git, the [GitHub CLI](https://cli.github.com/) signed in (`gh auth login`), jq, curl and Docker.

```bash
gh repo clone linuxserver-playground/harness && cd harness
./harness doctor      # what you have, and what anything missing rules out
./harness core        # clone the repositories it reads into repos/
claude                # or any agent that reads AGENTS.md
```

### What to ask

Ask in plain words. For your own app:

* *"I want my app `<name>` in LinuxServer Labs. It lives at `<repository URL>`."*
* *"Make my app easy to self-host."*
* *"Help me set up releases so a container can install my app."*

For an app you do not work on: *"I'd like `<app>` in LinuxServer Labs. Check it meets the bar and draft the proposal."*

### What it does with you

1. **Checks the bar** against the real repository: who owns it, the licence, the releases and their asset names, whether the name is free. It tells you plainly which rules fail before you spend time on the rest.
2. **Makes the app easy to self-host,** when it is yours. It reads your code and proposes changes in your repository, in your language and style: all state in one directory, settings from environment variables, working behind a reverse proxy, an SQLite option, and a release workflow that attaches a build per architecture with stable file names. You review and commit them; it pushes nothing to your repository on its own. If you want to build the image yourself, it fills in your copy of docker-template with you and runs the local build, the run and `builder check`.
3. **Drafts the proposal** from real data (`./harness draft proposal <name>`), shows it to you, and turns it into a link to the form with every answer filled in (`./harness labs form <name>`). You open the link, read it, tick the bar and submit. The agent never files it for you.
4. **Builds the image the team would build,** once the proposal is filed: `./harness labs try <issue number>` builds an image from your proposal exactly as a team member's harness would, and runs it in a local sandbox with ports on localhost only. If it does not come up, the output says why, and you can fix your app or your answers before anyone from the team looks. `./harness labs try --stop <name>` removes it.

Whatever the agent drafts, you are the one who files it and answers for it. As with pull requests, say which tool you used.

## Fill in the proposal form

[Open the proposal form](https://github.com/linuxserverlabs-playground/proposals/issues/new/choose). It asks for everything a team member needs to build your image and try it without asking you anything. Answer from real links, not from memory.

| Field | What we need |
| --- | --- |
| **Image name** | Lowercase letters, digits and dashes. Becomes `docker-<name>` and `ghcr.io/linuxserverlabs-playground/<name>`. |
| **Upstream repository** | The URL of the app's source repository, under its organisation. |
| **Project homepage** | Optional: its website or documentation. |
| **Licence** | The SPDX id of its licence. |
| **Latest stable release** | The URL of the newest stable release. |
| **How the image installs it** | *Release asset* (a file attached to the release, preferred) or *Source release* (the image builds the release's source). |
| **amd64 release asset**, **arm64 release asset** | The file name in the latest release, or a regular expression with `.*` where the version goes (`myapp-.*-linux-amd64.tar.gz`) so it matches the next release too. Leave arm64 empty for amd64 only. |
| **Application type** | *Web application*, or *Desktop application (selkies)* for a desktop program shown in the browser. |
| **Runtime and install** | What it is written in, what the asset is (a binary, a tarball, a `.deb`, a Node or Python app) and the command that starts it, in backticks: `/app/myapp serve --data /config --port 8080`. |
| **Working repository** | Optional: your repository made from docker-template, if you built the image yourself. |
| **Web interface port** | The port its web interface listens on. Desktop applications use 3000 and 3001. |
| **Where it writes state** | Every path it writes to, and the flag or variable that moves them under `/config`. |
| **Required environment variables** | Optional: one per line, `KEY=example - what it does`. |
| **Database** | *Embedded (SQLite or similar)*, *None needed*, or *Server database baked into the image as a fallback*. |
| **First run** | The default login or the setup wizard, and what the team member should see when it works. |
| **Screenshot** | Optional: the app running. |
| **Maintainers** | GitHub logins, comma separated, without `@`, including yours. They are credited on the image's page and mentioned when it needs attention. |
| **The Labs bar** | One checkbox per rule above. Tick each only when it is true; the check verifies what it can. |

## What happens after you propose

### The automatic check

Within a minute, a workflow in the proposals repository reads your form and compares it with the real upstream: who owns the repository, the licence GitHub detects, the latest stable release and its asset names, whether the name is taken, that the maintainers exist, and, when you gave one, that your working repository holds an image. It posts one comment listing what passed and what is missing, and labels the issue:

| Label | Meaning |
| --- | --- |
| `proposal` | Added by the form. Only issues with it are checked. |
| `meets-bar` | The check found nothing missing. Waiting for a team member to try it. |
| `needs-info` | Something is missing or could not be checked. The comment says what. |
| `accepted` | A team member created the image's repository and opened its first pull request. |

Fix anything it flags by **editing the issue**, not by filing a new one: the check runs again on every edit and updates the same comment. Upstreams that are not on GitHub get the checks their host allows, and a team member checks the rest by hand.

### A team member tries it

A team member builds the image from your proposal, or from your working repository, and runs it in a throwaway sandbox: no access to their files, no credentials, and no network beyond what the app needs. They follow your first-run steps and look at the result. This is where an app that is not really self-hosted, or needs more than its own container, shows. Questions come back to you as comments on the issue.

### A pending repository and its first pull request

When the trial works, the team member creates `docker-<name>` in Labs and opens its first pull request, which holds the image and credits you in the description and in `maintainers`. The proposal is labelled `accepted`, and the image is listed on the [Proposals page](/proposals/) as in review.

### Review

The pull request builds the image for each architecture and tests it. Its report comment shows the test results, screenshots, the package list and a pull command, so the team can review it and anyone can try it. You can follow along, comment, or improve the image with pull requests from your fork into that pull request's branch.

### Published

A team member merges the pull request. The image is released to `ghcr.io/linuxserverlabs-playground/<name>`, gets its page on this site with its documentation, builds and test reports, and is rebuilt automatically for every new upstream release from then on.

Not every proposal goes ahead. When one does not, the comment or a team member says why, and the issue is closed. You are welcome to propose again once the reason is gone.

## Contributing afterwards

The image's repository belongs to Labs, and changes reach it the way they reach every LinuxServer image: fork it, make the change, build and run it locally, and open a pull request. Every pull request is built and tested on both architectures, and its report comment shows the result. A team member reviews and merges it.

Being in `maintainers` is credit and who gets mentioned when the image needs attention, never access. When your app changes in a way the image has to follow (a new port, a renamed asset, a new setting), open the pull request before or with the release that changes it, so the image never breaks in between.

## Staying in Labs

The bar to get in is low, so an image that stops working leaves again. Labs opens an issue on the image's repository, mentioning its maintainers, when:

* a release's assets do not appear, or are renamed, and the build waits on them for a long time;
* builds keep failing;
* upstream has published no stable release for a long time.

Fix it by pull request, or reply. An image that stays broken after a grace period is archived: its page stays up with an archived notice, and it stops building.

## Graduating to the main fleet

An image that proves itself, used, maintained and building cleanly, can move to the main LinuxServer.io fleet. The team decides, informed by how long it has been live, how reliably it builds, how much it is used and how quickly issues are answered. Before moving, the image gets what the main fleet expects and Labs does not: a reverse proxy configuration, categories, full documentation, arm64 where upstream supports it, and a team member's review of its Dockerfiles.

The repository is then transferred to the main organisation, which keeps its history, issues and stars. The container design is the same, so users only change the `image:` line. The Labs image stays published with a notice saying where it moved.
