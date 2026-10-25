---
title: App stores and platforms
description: Adding our images to Unraid, Portainer, CasaOS, Umbrel, Runtipi, Cosmos, Arcane and TrueNAS.
section: general
order: 12
group: Other platforms
updated: 2026-10-24
aliases:
  - /general/platform-stores/
---
Every image has a template for each platform with an app store, carrying the same configuration, defaults and `PUID`/`PGID` semantics as its image page. The [stores page](/stores/) lists every store URL; the same list is at [`/api/v1/stores/index.json`](https://linuxserver-playground.github.io/hub/api/v1/stores/index.json).

> [!NOTE] What is supported
> The platforms are [reasonable endeavours](/docs/misc/support-policy/#reasonable-endeavours-support), with the exception of Unraid with our templates, which is formally supported. In every case we help with what the container does; we do not debug the store. If the template produces a container that misbehaves, the fastest way to find out whether the template or the platform is at fault is to run the compose snippet from the image page on the same machine.

## Unraid

Unraid's Docker page can load templates from a GitHub repository. Under **Docker → Template Repositories** add

```
https://github.com/linuxserver-playground/unraid-store
```

and save. **Add Container → Template** then lists one entry per image, and the form is pre-filled with every port, path and variable from the manifest, the icon, the WebUI address and any `Requires` text.

Templates for deprecated images sit in `deprecated/`.

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

Umbrel installs apps from community app stores, which are git repositories. Under **App Store → Community App Stores**, add

```
https://github.com/linuxserver-playground/umbrel-store
```

The store id is `lsio`, so every app appears as `lsio-<name>`. Each app folder has Umbrel's `umbrel-app.yml` manifest, a compose file that routes the web UI through Umbrel's `app_proxy` and keeps data under `${APP_DATA_DIR}`, and an `exports.sh`. Umbrel runs apps as its own user; the templates keep `PUID`/`PGID` at 1000, which is Umbrel's default user id on umbrelOS.

## Runtipi

Runtipi (version 4 and newer) takes additional app stores as git repositories under **Settings → App Stores**. Add

```
https://github.com/linuxserver-playground/runtipi-store
```

Each app is `apps/<name>/config.json` (schema version 2) with the ports, form fields for the environment variables and `logo_url` pointing at the image's logo, a compose file with the `x-runtipi` metadata, and `metadata/description.md`, which is the image's summary and setup text. Runtipi substitutes `${APP_DATA_DIR}` and the form fields into the compose file at install time; `PUID`/`PGID` are presented as form fields with the manifest defaults.

## Cosmos Cloud

Cosmos's market takes JSON sources. Under **Market → Sources**, add

```
https://linuxserver-playground.github.io/hub/stores/cosmos/index.json
```

The index lists every image with its description and icon; each `servapps/<name>/cosmos-compose.json` is the Cosmos variant of the compose file, with the routes Cosmos should create for the web UI. Cosmos manages its own reverse proxy and certificates, so the `URL` and port fields are filled by Cosmos rather than by you.

## Arcane

Arcane reads template registries as JSON. Under **Customization → Templates → Add Registry**, add

```
https://linuxserver-playground.github.io/hub/stores/arcane/registry.json
```

## TrueNAS SCALE

There is no store entry for TrueNAS, on purpose. Since TrueNAS SCALE 24.10 ("Electric Eel") apps run on Docker, and the only catalogs are the ones iXsystems curates; third-party catalogs are not a thing you can add. What you can do is install any compose file as a **custom app**, which is exactly our use case.

1. Download the compose snippet: `https://linuxserver-playground.github.io/hub/api/v1/catalog/<name>/docker-compose.yml`, or copy it from the image page.
2. Create a dataset for `/config` (one per app, under your apps pool) and, where needed, datasets or existing ones for media.
3. **Apps → Discover Apps → ⋮ → Install via YAML**, paste the compose file, and replace the `/path/to/...` host paths with the dataset mount points (`/mnt/<pool>/apps/<name>/config`).
4. Set `PUID` and `PGID` to the owner of those datasets. TrueNAS's built-in `apps` user and group are **568**; either chown the datasets to `568:568` and use `PUID=568`/`PGID=568`, or use the id of the user who owns your media and make sure the config dataset is owned by the same.
5. Install. The app appears under **Installed** with its logs, and TrueNAS restarts it with the system.

TrueNAS applies its own ACL defaults to new datasets; if the container logs permission errors on first start, check the dataset's ACL type (POSIX is simplest for `/config`) and ownership. Datasets on an NFS-shared pool are local to the apps and fine; mounting a *remote* NFS share as `/config` is as unsupported here as everywhere else.

## Not a store: Kubernetes, Podman, SWAG

Every image page also has a [Kubernetes manifest](/docs/general/kubernetes/), a [Podman quadlet](/docs/general/podman-quadlet/) and, where the image has one, a [SWAG proxy conf](/docs/general/swag/).
