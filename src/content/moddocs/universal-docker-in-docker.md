---
branch: "universal-docker-in-docker"
---
## How to enable:
In the container's docker arguments,
* Set an environment variable `DOCKER_MODS=ghcr.io/linuxserver-playground/mods:universal-docker-in-docker`
* Set the `privileged` option for the container

Docker data root will reside under `/config/var/lib/docker` by default, this is configurable by setting `MODS_DIND_PERSISTENCE` to the wanted path.
On amd64, QEMU will be enabled on container start.
