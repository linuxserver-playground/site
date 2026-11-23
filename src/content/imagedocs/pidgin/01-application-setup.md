---
image: "pidgin"
section: "application-setup"
title: "Application Setup"
order: 1
---
The application can be accessed at:

* https://yourhost:3001/

This Pidgin installation comes with default chat plugins plus a series of third party ones. **Please note that the third party plugins for the most part are not simply plug and play, you will need to reference their documentation and possibly generate oauth tokens along with other workarounds**. Third party plugins are always in a state of constant development do not expect every single native feature to work flawlessly. To ease integration with some third party plugins we include Firefox in this image to allow you to fill out captchas or pre-auth before loading your credentials into the program, simply right click the desktop to launch it.

* Bonjour- Default XMPP style plugin
* Discord- Provided by [purple-discord](https://github.com/EionRobb/purple-discord)
* Facebook- Provided by [purple-facebook](https://github.com/dequis/purple-facebook)
* Gadu-Gadu- Default libgadu plugin
* Google Talk- Provided by [purple-hangouts](https://github.com/EionRobb/purple-hangouts)
* GroupWise- Default GroupWise plugin
* Hangouts- Provided by [purple-hangouts](https://github.com/EionRobb/purple-hangouts)
* ICQ (WIM)- Provided by [icyque](https://github.com/EionRobb/icyque)
* IRC- Default IRC plugin
* Instagram- Provided by [purple-instagram](https://github.com/EionRobb/purple-instagram)
* Office Comminicator (SIPE)- Provided by [SIPE Project](https://sipe.sourceforge.io/)
* Rocket.chat- Provided by [purple-rocketchat](https://github.com/EionRobb/purple-rocketchat)
* SIMPLE- Default plugin
* Skype (HTTP)- Provided by [skype4pidgin](https://github.com/EionRobb/skype4pidgin)
* Slack- Provided by [slack-libpurple](https://github.com/EionRobb/slack-libpurple)
* Telegram- Provided by [telegram-purple](https://github.com/majn/telegram-purple)
* XMPP- Default XMPP plugin
* Zephyr- Default project Athena plugin

### Strict reverse proxies

This image uses a self-signed certificate by default. This naturally means the scheme is `https`.
If you are using a reverse proxy which validates certificates, you need to [disable this check for the container](https://linuxserver-playground.github.io/site/docs/faq#strict-proxy).

This container is based on [Docker Baseimage Selkies](https://github.com/linuxserver/docker-baseimage-selkies), which streams a desktop or single application to your web browser. Only the essentials are covered below, the full platform documentation lives at [docs.linuxserver.io/selkies](https://docs.linuxserver.io/selkies/).

### Start Minimal

Most support issues we see stem from large run configurations assembled from years of forum posts. These containers are designed to work with almost nothing. Start with the minimal command below, confirm it works, then add your options (volumes, env vars, GPU flags) one at a time:

```bash
docker run --rm -it \
  --shm-size=1gb \
  -p 3001:3001 \
  ghcr.io/linuxserver-playground/pidgin:latest bash
```

Open **https://localhost:3001** (note the `https`) and accept the self signed certificate warning. The trailing `bash` gives you a shell inside the container, `ctrl+d` exits and cleans everything up. If a bigger setup misbehaves, return to this command to isolate the problem, see the [Quickstart](https://docs.linuxserver.io/selkies/user-guide/quickstart/) and [Troubleshooting](https://docs.linuxserver.io/selkies/user-guide/troubleshooting/) guides.

### GPU Acceleration

A GPU is optional, the CPU pipeline is fast enough for smooth sessions on modest hardware. When a GPU is mounted into the container it is automatically detected and configured for zero copy rendering and encoding, set `AUTO_GPU=false` to disable this behavior.

**Intel / AMD (open source drivers), one flag is all it takes:**

```bash
docker run --rm -it \
  --shm-size=1gb \
  -p 3001:3001 \
  --device /dev/dri \
  ghcr.io/linuxserver-playground/pidgin:latest bash
```

Compose examples, multi GPU selection (`DRINODE`/`DRI_NODE`), Unraid notes, and a step by step debugging loop are in the [GPU Acceleration](https://docs.linuxserver.io/selkies/user-guide/gpu/) guide.

### Security

> [!WARNING]
> This container provides privileged access to the host system. Do not expose it to the Internet unless you have secured it properly.

**HTTPS is required.** Modern browser features used for video and audio (WebCodecs) only work in a secure context. Port `3001` serves HTTPS directly, the HTTP port exists only to sit behind a reverse proxy.

By default there is **no authentication**. Setting the `CUSTOM_USER` and `PASSWORD` environment variables enables HTTP basic auth, which is suitable only for a trusted local network. For internet exposure, place the container behind a reverse proxy with robust authentication, such as [SWAG](https://github.com/linuxserver-playground/docker-swag). Keep in mind the web interface includes a terminal with passwordless `sudo`, anyone who can reach the GUI can gain root inside the container.

Authentication options, sharing link behavior, container isolation, and the lockdown variables for kiosk style deployments are covered in [Security and Hardening](https://docs.linuxserver.io/selkies/user-guide/security/).

### Language Support - Internationalization

To launch the session in a different language, set the `LC_ALL` environment variable, e.g. `-e LC_ALL=zh_CN.UTF-8` (Chinese), `ja_JP.UTF-8` (Japanese), `ko_KR.UTF-8` (Korean), `ar_AE.UTF-8` (Arabic), `ru_RU.UTF-8` (Russian), `es_MX.UTF-8` (Spanish Latin America), `de_DE.UTF-8` (German), `fr_FR.UTF-8` (French), `nl_NL.UTF-8` (Dutch), `it_IT.UTF-8` (Italian).

### Beyond Running the App

This image inherits every capability of the Selkies platform, all documented in depth on the docs site:

* [Configuration Reference](https://docs.linuxserver.io/selkies/user-guide/configuration/) - every environment variable: ports, subfolder reverse proxy, custom dashboards, watermarking, and the full set of `SELKIES_*` stream, feature, and UI settings with their `|locked` syntax.
* [Using the Web Client](https://docs.linuxserver.io/selkies/user-guide/web-client/) - file transfer, clipboard sync, audio and microphone, up to four gamepads, session sharing, and mobile touch support.
* [Installing Applications](https://docs.linuxserver.io/selkies/user-guide/installing-apps/) - persistent user installed apps with [proot-apps](https://github.com/linuxserver/proot-apps) (`proot-apps install filezilla`) or native packages at boot with Docker mods.
* [Docker in Docker and host Docker control](https://docs.linuxserver.io/selkies/user-guide/configuration/#optional-run-configurations) - run `--privileged` for an isolated DinD setup, or mount `/var/run/docker.sock` to manage the host.
* [Reverse Proxy](https://docs.linuxserver.io/selkies/user-guide/reverse-proxy/) - proxying websockets and subfolders correctly.
* [SealSkin](https://docs.linuxserver.io/selkies/components/sealskin/) - turnkey multi user VDI orchestration with browser extension and mobile apps, this image is fully compatible.
* [Pelorus](https://docs.linuxserver.io/selkies/components/pelorus/) - expose the session to AI agents via a computer use API and accessibility stack.
