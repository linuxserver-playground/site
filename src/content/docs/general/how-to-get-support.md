---
title: How to get support
description: "What to check before asking (the image and build pages), how to gather the information we need, and where to ask: Discord, Discussions or an issue on the image repository."
section: general
order: 18
group: Project
updated: 2026-10-24
aliases:
  - /general/how-to-get-support/
---
## Check whether it is us first

1. Open the image's page, [`/images/<name>/`](/images/): it shows every live branch, the last build result and whether a build is running right now. A failed build means we already know, and `latest` still points at the previous release.
2. Open the build's page, `/images/<name>/builds/<tag>/`: the test results per architecture, a screenshot, the container log and the package changes since the previous release. If your problem started with that release, say so when you ask.
3. Read the **Application Setup** section and the parameter tables on the image page.
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
7. Post the link along with a detailed description of your issue in the appropriate discord support channel, or in [GitHub Discussions](https://github.com/orgs/linuxserver-playground/discussions).

Include the image tag you are running (`docker inspect -f '{{ index .Config.Labels "org.opencontainers.image.version" }}' <container-name>` prints the release tag) so we can match it to its build.

## Bugs in an image

If the application itself fails to start, a dependency is missing, or the documentation is wrong, open an issue on the image repository, `https://github.com/linuxserver-playground/docker-<name>/issues`, using the issue template. Please read [Contributing an image](/docs/general/contributing-an-image/) before opening a pull request: most requests belong upstream, in a Docker Mod, or in a custom script rather than in the image.

Problems with the build system itself (a build that fails for every image, the hub serving stale data, a broken template in a store) belong on the infrastructure repository concerned: [`workflows`](https://github.com/linuxserver-playground/workflows), [`ci`](https://github.com/linuxserver-playground/ci), [`hub`](https://github.com/linuxserver-playground/hub), [`control`](https://github.com/linuxserver-playground/control) or, for these pages, [`site`](https://github.com/linuxserver-playground/site).
