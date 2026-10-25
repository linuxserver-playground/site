---
title: LinuxServer Support Policy
description: Any exceptions to this support policy will be clearly called out in the readme for the relevant image.
section: misc
order: 1
updated: 2026-10-24
aliases:
  - /misc/support-policy/
---
Any exceptions to this support policy will be clearly called out in the readme for the relevant image.

## Formally Supported Images

Any actively maintained image from the LinuxServer organisation, excluding base images, is in scope for support. Note that if you are running an old version of an image we will likely ask you to upgrade to the latest version before providing support, unless your issue is version-specific.

This means that images, tags, and architectures that have been deprecated or archived are not in scope. An image is deprecated when its `image.yml` says so (`deprecation.status: true`); its page moves to [Deprecated Images](/images/?deprecated=1), its templates move to the deprecated folder of every store, and the container prints the deprecation message at start.

Images built from a pull request (`ghcr.io/linuxserver-playground/untrusted-pr/*`) or a development branch (`ghcr.io/linuxserver-playground/dev/*`) are review artefacts and are never in scope.

## Formally Supported Environments

We build and test all of our images using the latest stable branch of Docker CE using containerd and runc, on Linux, building for x86_64 (amd64) and aarch64 (arm64) architectures. Any matching client environment is in scope for support. In addition, any currently supported version of Docker CE is in scope.

We support the use of both docker compose and the docker CLI to manage containers, though the former is preferred. The compose service and run command on each image page are generated from the manifest and are the reference configuration; if your problem goes away with the generated snippet, the difference is where to look.

We support the running of our containers on Unraid, using our supplied templates. We will not provide support for Unraid itself.

## Docker Mods

Support for the underlying mod logic is within scope for support, however, support for the mods themselves is provided by the listed maintainer of that mod, whether it is published in our mods repo or elsewhere.

## Reasonable Endeavours Support

There are many alternative configurations that should broadly work for most of our images, but we make no guarantees to that effect, and expect that you have a solid understanding of the underlying technologies you're using. Although we do not formally support them, we will endeavour to provide help where we can with any of the following:

* Use of our base images for 3rd party projects
* Use of our images with alternative container runtimes
* Use of locally built versions of our images
* Docker Desktop on Windows, Mac, or Linux
* Rootless Docker
* Docker in Docker
* Docker Swarm
* Docker installed from distro repos (use the [official repos](https://docs.docker.com/engine/install/) instead)
* Docker installed via Snap (use the [official repos](https://docs.docker.com/engine/install/) instead)
* EOL versions of Docker (where there is no option to upgrade)
* EOL versions of the Linux Kernel (where there is no option to upgrade)
* EOL versions of your host linux distribution (where there is no option to upgrade)
* Podman (Rootless or Rootful), including the quadlets we generate. Please [read the guide](/docs/general/podman-quadlet/).
* Docker inside an LXC container, such as on Proxmox. Please [read the guide](/docs/general/lxc-proxmox/).
* Kubernetes (k8s, k3s and the like), using the manifests we generate. Please [read the guide](/docs/general/kubernetes/).
* Our templates in the app stores of Portainer, CasaOS, Umbrel, Runtipi and Cosmos, and compose on TrueNAS. Please [read the guide](/docs/general/platform-stores/).
* Routing container traffic through a VPN
* Use of macvlan/ipvlan networks

The guides linked above exist because the manifests and quadlets we generate are tested to be *valid*, not because those platforms are tested the way Docker is. We will help with what the container does; we will not debug the platform.

## Unsupported

The following configurations are entirely unsupported and we will not provide help with them, even if you have been able to get them to work:

* Any of our images which have been deprecated or archived
* Any forks of our images maintained by 3rd parties
* Use of 3rd party guides or tutorials for configuring our images
* Use of 3rd party management tools to create or update containers, beyond importing our own templates into the stores listed above
* Use of automated container update tools, such as Watchtower
* Use of remote file storage, such as SMB or NFS, for container `/config` mounts
* Privileged LXC containers, and LXC containers that run our images directly without Docker or Podman

## Unsupported and Known To Be Broken

The following configurations are entirely unsupported and you are unlikely to be able to get them to work at all, or experience serious issues if you do:

* Use of a custom `init` for Docker
* Overriding container entrypoints

## Weird Exceptions

The following configurations don't fit nicely into any single category because "it depends". They're not formally supported but we may provide reasonable endeavours support in some cases.

* Running our containers with a root (`0`) PUID or PGID
* Running our containers with a read-only container filesystem. Please [read the docs](/docs/misc/read-only/). Images that have been tested read-only say so on their page (`runtime.readonly.supported` in the manifest).
* Use of the `user` directive to run containers as a custom UID/GID. Please [read the docs](/docs/misc/non-root/). Images that have been tested non-root say so on their page (`runtime.nonroot.supported` in the manifest).

## Change History

* 2026-10-24 - LXC, Kubernetes and the platform stores move to Reasonable Endeavours with guides; PR and dev images out of scope
* 2024-12-05 - Move non-root users to Weird Exceptions
* 2024-06-13 - Add read-only running
* 2024-02-13 - Add Weird Exceptions section
* 2024-02-05 - Add ipvlan/macvlan networks
* 2023-10-03 - Initial release
