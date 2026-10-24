---
title: App stores and platforms
description: The app-store templates the hub generates for Unraid, Portainer, CasaOS, Umbrel, Runtipi, Cosmos and TrueNAS, and how to add each store to your platform.
section: general
order: 12
group: Other platforms
updated: 2026-10-24
aliases:
  - /general/platform-stores/
---
The hub turns every image's `image.yml` into a template for each platform that has an app store, so what you install there is the same configuration the image page documents, with the same defaults and the same `PUID`/`PGID` semantics. The list of stores, their URLs and a one-line how-to is itself an endpoint:

```
https://linuxserver-playground.github.io/hub/api/v1/stores/index.json
```

Stores that fetch a URL point at the hub's Pages site, `https://linuxserver-playground.github.io/hub/stores/<platform>/...`. Stores that clone a git repository point at [`linuxserver-playground/stores`](https://github.com/linuxserver-playground/stores), which the hub pushes the same output to, one folder per platform. An image can opt out of a store with `publish.stores.<platform>: false` in its manifest; deprecated images move to a `deprecated/` folder where the platform has one.

> [!NOTE] What is supported
> Templates are checked for validity when the hub generates them and are tested against the platforms' documented formats. The platforms themselves are [reasonable endeavours](/docs/misc/support-policy/#reasonable-endeavours-support), with the exception of Unraid with our templates, which is formally supported. In every case we help with what the container does; we do not debug the store. If the template produces a container that misbehaves, the fastest way to find out whether the template or the platform is at fault is to run the compose snippet from the image page on the same machine.

## Unraid

Unraid's Docker page can load templates from a GitHub repository. Under **Docker → Template Repositories** add

```
https://github.com/linuxserver-playground/stores/tree/main/unraid
```

and save. **Add Container → Template** then lists one entry per image, and the form is pre-filled with every port, path and variable from the manifest, the icon from `docs.logo`, the WebUI address from the image's `test.web` port and the `Requires` text from `publish.unraid.requirement` where an image has one. The fields are the same ones the legacy Unraid templates carried, so a container created from a playground template looks like one created from the production template.

Templates for deprecated images sit in `unraid/deprecated/`, and `unraid/ignore.list` names the images whose manifest sets `publish.stores.unraid: false`. Community Applications shows only its curated feed, so the playground templates do not appear there; this is deliberate while the images are not for production use.

## Portainer

Portainer reads a single JSON file of app templates. Under **Settings → App Templates**, set the URL to

```
https://linuxserver-playground.github.io/hub/stores/portainer/templates.json
```

and save; **App Templates** in the sidebar then lists the images (format version 3, container templates, which needs Portainer 2.19 or newer). Each template carries the image reference, ports, volumes as bind mounts you fill in, and the environment variables with their descriptions and defaults, so `PUID`, `PGID` and `TZ` are presented as fields rather than buried in a compose file.

Remember our stance on Portainer in the [FAQ](/docs/faq/#why-does-linuxserverio-recommend-to-use-docker-compose-over-portainer): it is a fine way to deploy from a template, but the template is the source of truth. If you edit the container in Portainer afterwards, keep the compose equivalent somewhere, because that is what we will ask for.

## CasaOS

CasaOS 0.4.4 and newer can add third-party app stores from a zip file. Under **App Store → More Apps → Add Source**, paste

```
https://linuxserver-playground.github.io/hub/stores/casaos/linuxserver.zip
```

Each app is the image's compose file with an `x-casaos` block that carries the title, description, icon, category and the port CasaOS should open as the web UI. Volumes default to `/DATA/AppData/<name>/...` as CasaOS expects; the `PUID`/`PGID` defaults are the manifest's (1000/1000). Change them in the install dialog if your CasaOS user has a different id.

## Umbrel

Umbrel installs apps from community app stores, which are git repositories. Under **App Store → Community App Stores**, add the stores repository:

```
https://github.com/linuxserver-playground/stores
```

The store id is `lsio`, so every app appears as `lsio-<name>`. Each app folder has Umbrel's `umbrel-app.yml` manifest, a compose file that routes the web UI through Umbrel's `app_proxy` and keeps data under `${APP_DATA_DIR}`, and an `exports.sh`. Umbrel runs apps as its own user; the templates keep `PUID`/`PGID` at 1000, which is Umbrel's default user id on umbrelOS.

> [!NOTE]
> Umbrel expects `umbrel-app-store.yml` at the root of the repository it clones. The hub writes the Umbrel store into the `umbrel/` folder of the stores repository alongside the other platforms; until a repository (or branch) with the Umbrel output at its root is published, the add-store step above will not find the store. Track this in the [hub repository](https://github.com/linuxserver-playground/hub).

## Runtipi

Runtipi (version 4 and newer) takes additional app stores as git repositories under **Settings → App Stores**. Add

```
https://github.com/linuxserver-playground/stores
```

Each app is `apps/<name>/config.json` (schema version 2) with the ports, form fields for the environment variables and `logo_url` pointing at the image's logo, a compose file with the `x-runtipi` metadata, and `metadata/description.md`, which is the image's summary and setup text. Runtipi substitutes `${APP_DATA_DIR}` and the form fields into the compose file at install time; `PUID`/`PGID` are presented as form fields with the manifest defaults.

> [!NOTE]
> As with Umbrel, Runtipi clones a repository whose root contains the `apps/` folder; the hub's output is in the `runtipi/` subfolder of the stores repository, so the store does not load until that output is published at a repository root. Runtipi also wants `metadata/logo.jpg` as a file, which the hub does not copy into git; the logo shows from `logo_url` where Runtipi supports it.

## Cosmos Cloud

Cosmos's market takes JSON sources. Under **Market → Sources**, add

```
https://linuxserver-playground.github.io/hub/stores/cosmos/index.json
```

The index lists every image with its description and icon; each `servapps/<name>/cosmos-compose.json` is the Cosmos variant of the compose file, with the routes Cosmos should create for the web UI. Cosmos manages its own reverse proxy and certificates, so the `URL` and port fields are filled by Cosmos rather than by you. The format follows the community sources Cosmos already consumes.

## TrueNAS SCALE

There is no store entry for TrueNAS, on purpose. Since TrueNAS SCALE 24.10 ("Electric Eel") apps run on Docker, and the only catalogs are the ones iXsystems curates; third-party catalogs are not a thing you can add. What you can do is install any compose file as a **custom app**, which is exactly our use case.

1. Download the compose snippet: `https://linuxserver-playground.github.io/hub/api/v1/catalog/<name>/docker-compose.yml`, or copy it from the image page.
2. Create a dataset for `/config` (one per app, under your apps pool) and, where needed, datasets or existing ones for media.
3. **Apps → Discover Apps → ⋮ → Install via YAML**, paste the compose file, and replace the `/path/to/...` host paths with the dataset mount points (`/mnt/<pool>/apps/<name>/config`).
4. Set `PUID` and `PGID` to the owner of those datasets. TrueNAS's built-in `apps` user and group are **568**; either chown the datasets to `568:568` and use `PUID=568`/`PGID=568`, or use the id of the user who owns your media and make sure the config dataset is owned by the same.
5. Install. The app appears under **Installed** with its logs, and TrueNAS restarts it with the system.

TrueNAS applies its own ACL defaults to new datasets; if the container logs permission errors on first start, check the dataset's ACL type (POSIX is simplest for `/config`) and ownership. Datasets on an NFS-shared pool are local to the apps and fine; mounting a *remote* NFS share as `/config` is as unsupported here as everywhere else.

## Not a store: Kubernetes, Podman, SWAG

The hub also generates per-image [Kubernetes manifests](/docs/general/kubernetes/), [Podman quadlets](/docs/general/podman-quadlet/) and the [SWAG proxy confs](/docs/general/swag/) (`/stores/proxy/<name>.subdomain.conf.sample`, pulled into SWAG automatically). They are listed in the same `stores/index.json` for completeness and have their own pages.
