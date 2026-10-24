---
title: Running LinuxServer Containers
description: The base images our application images derive from, where the images are published, and the standard run and compose parameters they share.
section: general
order: 2
updated: 2026-10-24
aliases:
  - /general/running-our-containers/
---
## Image Structure

### Base Images

We have curated various base images which our main application images derive from. This is beneficial for two main reasons:

* A common dependency base between multiple images, reducing the likelihood of variation between two or more applications that share the same dependencies.
* Reduction in image footprint on your host machine by fully utilising Docker's image layering system. Multiple containers running locally that share the same base image will reuse that image and any of its ancestors.

In the playground every application image is built `FROM ghcr.io/linuxserver/baseimage-<base>:<tag>`; the base is named in the image's `image.yml` under `build.base` and shown on its page.

### The `/config` volume

To help reduce variation between our images, we have adopted a common structure pattern for application config and dependent directories. This means that each image has its own internal `/config` directory which holds all application-specific configuration. With the exception of a small number of images, all of our images expose this volume.

We do this because we believe that it makes it easier to answer the common question of "where does the application data get persisted?" - the answer being "always in `/config`". If you don't map this directory when creating your containers, the config will only last as long as the lifespan of the container itself!

## Where the images are

Playground images are published to the GitHub Container Registry only, as `ghcr.io/linuxserver-playground/<name>`. There is no Docker Hub, `lscr.io`, Quay or GitLab mirror. The tags every release publishes are described in [How a build happens](/docs/general/how-a-build-happens/#versions-and-tags); for day-to-day use `latest` (or the branch tag such as `develop` where an image has one) is what you want.

## Creating a Container

Every image page carries a ready-made `docker compose` service and the equivalent `docker run` command, generated from the manifest with every required parameter filled in and the optional ones marked `#optional`. Start from those rather than from memory. The same snippets are available from the hub as plain files, for scripting:

```shell
curl -fsSL https://linuxserver-playground.github.io/hub/api/v1/catalog/<name>/docker-compose.yml
```

Each image follows the same pattern when creating a container by hand:

```shell
docker create \
    --name=<container_name> \
    -v <path_to_data>:/config \
    -e PUID=<uid> \
    -e PGID=<gid> \
    -e TZ=<timezone> \
    -p <host_port>:<app_port> \
    ghcr.io/linuxserver-playground/<image_name>
```

`PUID` and `PGID` make the application inside the container run as the user who owns `<path_to_data>` on your host; see [Understanding PUID and PGID](/docs/general/understanding-puid-and-pgid/). We recommend [Docker Compose](/docs/general/docker-compose/) over `docker create` so that the parameters are kept in a file you can read, version and reuse when you [update](/docs/general/updating-our-containers/).

## Other ways to run them

Docker on Linux is what we build and test against. The same manifest also produces a [Podman quadlet](/docs/general/podman-quadlet/), a [Kubernetes manifest](/docs/general/kubernetes/) and templates for the [app stores](/docs/general/platform-stores/) of Unraid, Portainer, CasaOS, Umbrel, Runtipi and Cosmos; those guides say what changes on each platform and what is and is not supported.
