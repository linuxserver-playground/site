---
title: Updating our containers
description: When our images are rebuilt, how to update a container by pulling the new image and recreating it, and the tools that automate it.
section: general
order: 6
updated: 2026-10-24
aliases:
  - /general/updating-our-containers/
---
Our images are rebuilt whenever the upstream application releases a new version, whenever a change is pushed to the image repository, and on a weekly package check when the packages inside the image have changed. Every rebuild that passes its tests becomes a GitHub Release tagged `<upstream>-ls<N>` and is published to `ghcr.io/linuxserver-playground/<name>`, so make sure you're always running the latest version, as it may contain important bug fixes and new features.

The release notes of each image are on its GitHub Releases page and in the [changelog feed](https://linuxserver-playground.github.io/hub/api/v1/changelog.xml); each build's test results and package changes are on its page, `/images/<name>/builds/<tag>/`. See [How a build happens](/docs/general/how-a-build-happens/).

## Steps required to update

Docker containers are, for the most part, immutable. This means that important configuration such as volume and port mappings can't be easily changed once the container has been created. The containers created from our images run a very specific version of the application they wrap, so in order to update the application, you must recreate the container.

### Stop the container

Firstly, stop the container.

```shell
docker stop <container_name>
```

### Remove the container

Once the container has been stopped, remove it.

> [!WARNING]
> Did you remember to persist the `/config` volume when you originally created the container? Bear in mind, you'll lose any configuration inside the container if this volume was not persisted. [Read up on why this is important](/docs/general/volumes/).

```shell
docker rm <container_name>
```

### Pull the latest version

Now you can pull the latest version of the application image from the GitHub Container Registry.

```shell
docker pull ghcr.io/linuxserver-playground/<image_name>
```

### Recreate the container

Finally, you can recreate the container. This is often cited as the most arduous task as it requires you to remember all of the mappings you set beforehand. You can help mitigate this step by using Docker Compose instead - this topic has been [outlined in our documentation](/docs/general/docker-compose/).

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

## Docker Compose

It is also possible to update a single container using Docker Compose:

```shell
docker compose pull <service_name>
docker compose up -d <service_name>
```

Or, to update all containers at once:

```shell
docker compose pull
docker compose up -d
```

## Pinning a version

If you need to stay on a particular build, use its release tag rather than `latest`:

```yaml
image: ghcr.io/linuxserver-playground/sonarr:4.0.20.3014-ls1
```

`version-<upstream>` tags also exist and follow the latest LinuxServer rebuild of that upstream version. See [Versions and tags](/docs/general/how-a-build-happens/#versions-and-tags) for the full set. Remember that a pinned container is one you have to come back to.

## Update notifications

We recommend [Diun](https://crazymax.dev/diun/) to be told when a new image is available. Tools that automatically recreate containers unattended, such as Watchtower, are not recommended and not supported; see the [support policy](/docs/misc/support-policy/). On Podman, the generated quadlets set `AutoUpdate=registry` so `podman auto-update` can do the same job under your control; see [Podman quadlets](/docs/general/podman-quadlet/#automatic-updates).

## Removing old images

Whenever a Docker image is updated, a fresh version of that image gets downloaded and stored on your host machine. Doing this, however, does not remove the _old_ version of the image. Eventually you will end up with a lot of disk space used up by stale images. You can `prune` old images from your system, which will free up space:

```shell
docker image prune
```
