---
title: How to get support
description: "What to check before asking (the control plane, the build report), how to gather the information we need, and where to ask: Discord, Discussions or an issue on the image repository."
section: general
order: 18
group: Project
updated: 2026-10-24
aliases:
  - /general/how-to-get-support/
---
> [!NOTE] The playground is a proof of concept
> Images from `linuxserver-playground` are not for production use and are supported on a best-effort basis while the new build system is proven. If you are running the production `linuxserver/*` images, the place to ask is the [LinuxServer.io Discord](https://linuxserver.io/discord) as before.

## Check whether it is us first

1. Open the image's page on the [control plane](https://ci.thelamer.duckdns.org:8443/): `https://ci.thelamer.duckdns.org:8443/images/<name>` shows every live branch, the last build result and whether a build is running right now. The badge at the top of each image page links to the same place. A red badge means the most recent build of that tag failed; we already know, and the previous release is still what `latest` points at.
2. Open the build report in the hub, `https://linuxserver-playground.github.io/hub/builds/<name>/<tag>/`: the test table per architecture, a screenshot of the application coming up, the container log and the package diff against the previous release. If the diff shows a bumped library and your problem started with that release, say so when you ask.
3. Read the image page. The **Application Setup** section and the parameter tables are generated from the same manifest the container is built from, so they are current.
4. Search the [FAQ](/docs/faq/) and the repository's [issues](https://github.com/linuxserver-playground) before opening a new one.

## Gather the information we need

1. Join our [Discord server](https://linuxserver.io/discord), read our [Support Policy](/docs/misc/support-policy/), and read the description of each channel before asking for support.
2. SSH to your server and run the following command to create an alias that gathers the information we require:

   ```bash
   alias lsiosupport='function _lsiosupport(){ uname -a > lsiosupport.txt; docker -v >> lsiosupport.txt; cat /etc/os-release >> lsiosupport.txt; docker inspect --format "$(wget -qO- https://linuxserver-playground.github.io/site/docs/run.tpl)" $1 >> lsiosupport.txt; docker logs $1 >> lsiosupport.txt; }; _lsiosupport'
   ```

   The alias gathers the following information: OS details, docker version, run command, and container logs.
3. Execute the alias with a container name:

   ```bash
   lsiosupport <container-name>
   ```

   Add `sudo` in the beginning if your user can't access docker.
4. A file called `lsiosupport.txt` will be created in the current folder, open it with a text editor.
5. Redact sensitive information such as: passwords, domains, emails, personal information, etc.
   **Don't redact information we need for troubleshooting such as: IPs, volumes, local paths, etc.**
6. Upload the file to a pastebin like [PrivateBin](https://privatebin.net/) or [Gist](https://gist.github.com/).
7. Post the link along with a detailed description of your issue in the appropriate discord support channel, or in [GitHub Discussions](https://github.com/orgs/linuxserver-playground/discussions) for the playground.

Include the image tag you are running (`docker inspect -f '{{ index .Config.Labels "org.opencontainers.image.version" }}' <container-name>` prints the release tag) so we can match it to a build report.

## Bugs in an image

If the application itself fails to start, a dependency is missing, or the documentation generated from `image.yml` is wrong, open an issue on the image repository, `https://github.com/linuxserver-playground/docker-<name>/issues`, using the issue template. Please read [Contributing an image](/docs/general/contributing-an-image/) before opening a pull request: most requests belong upstream, in a Docker Mod, or in a custom script rather than in the image.

Problems with the build system itself (a build that fails for every image, the hub serving stale data, a broken template in a store) belong on the infrastructure repository concerned: [`workflows`](https://github.com/linuxserver-playground/workflows), [`ci`](https://github.com/linuxserver-playground/ci), [`hub`](https://github.com/linuxserver-playground/hub), [`control`](https://github.com/linuxserver-playground/control) or, for these pages, [`site`](https://github.com/linuxserver-playground/site).
