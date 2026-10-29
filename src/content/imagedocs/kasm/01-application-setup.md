---
image: "kasm"
section: "application-setup"
title: "Application Setup"
order: 1
---
This container uses [Docker in Docker](https://www.docker.com/blog/docker-can-now-run-within-docker/) and requires being run in `privileged` mode. This container also requires an initial setup that runs on port 3000.

**Unlike other containers the web interface port (default 443) needs to be set for the env variable `KASM_PORT` and both the inside and outside port IE for 4443 `KASM_PORT=4443` `-p 4443:4443`**

**Unraid users due to the DinD storage layer `/opt/` should be mounted directly to a disk IE `/mnt/disk1/appdata/path` or optimally with a cache disk at `/mnt/cache/appdata/path`**

Access the installation wizard at https://`your ip`:3000 and follow the instructions there. Once setup is complete access https://`your ip`:443 and login with the credentials you entered during setup. The default users are:

* admin@kasm.local
* user@kasm.local

Currently Synology systems are not supported due to them blocking CPU scheduling in their Kernel.

### Upgrading KASM

In order to upgrade Kasm, first make sure you are using the latest docker image, and then perform the in app update from the installation wizard. Docker image update and recreation of container alone won't upgrade Kasm.

Following the upgrade, you will need to update any workspace image tags to match the new version.

### GPU Support

During installation an option will be presented to force all Workspace containers to mount in and use a specific GPU. If using an NVIDIA GPU you will need to pass `-e NVIDIA_VISIBLE_DEVICES=all` or `--gpus all` and have the [NVIDIA Container Toolkit](https://github.com/NVIDIA/nvidia-container-toolkit) installed on the host. Also if using NVIDIA, Kasm Workspaces has [native NVIDIA support](https://docs.kasm.com/docs/latest/how-to/gpu/index.html) so you can optionally opt to simply use that instead of the manual override during installation.

When NVIDIA devices are passed to this container, a [CDI](https://github.com/cncf-tags/container-device-interface) specification describing them is generated inside the DinD layer on startup and the NVIDIA runtime is made the default one there. This is what allows the driver, and with it Vulkan and OpenGL, to reach the Workspace containers.

### Gamepad support

In order to properly create virtual Gamepads you will need to mount from your host `/dev/input` and `/run/udev/data`. Please see [HERE](https://docs.kasm.com/docs/latest/guide/gamepad_passthrough/index.html) for instructions on enabling gamepad support.

### Persistant profiles

In order to use persistant profiles in Workspaces you will need to mount in a folder to use from your host to `/profiles`. From there when configuring a workspace you can set the `Persistant Profile Path` to IE `/profiles/ubuntu-focal/{username}/`, more infomation can be found [HERE](https://docs.kasm.com/docs/latest/guide/persistent_data/persistent_profiles).

### Reverse proxy

A sample for [SWAG](https://github.com/linuxserver/docker-swag) can be found [here](https://raw.githubusercontent.com/linuxserver/reverse-proxy-confs/master/kasm.subdomain.conf.sample). Post installation you will need to modify the "Proxy Port" setting under the default zone to 0 as outlined [here](https://docs.kasm.com/docs/latest/how-to/reverse_proxy/index.html#update-zones) to launch Workspaces sessions.

### Strict reverse proxies

This image uses a self-signed certificate by default. This naturally means the scheme is `https`.
If you are using a reverse proxy which validates certificates, you need to [disable this check for the container](https://linuxserver-playground.github.io/site/docs/faq#strict-proxy).
