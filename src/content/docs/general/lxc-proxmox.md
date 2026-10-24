---
title: Docker in an LXC container on Proxmox
description: "A nested arrangement of three user namespaces: the Proxmox host, an unprivileged LXC container with Docker CE installed from Docker's repositories, and our image running under that Docker."
section: general
order: 15
group: Other platforms
updated: 2026-10-24
aliases:
  - /general/lxc-proxmox/
---
> [!WARNING] Reasonable endeavours
> Running Docker inside an LXC container is supported on a [reasonable endeavours](/docs/misc/support-policy/#reasonable-endeavours-support) basis. Proxmox's own documentation recommends a VM for application containers, and so do we: a VM with Docker CE is the environment we test. If you choose LXC anyway, this page tells you what to configure and where the sharp edges are. Problems that only occur inside LXC are yours to diagnose; we will help with what the container does once Docker works. Privileged LXC containers are [unsupported](/docs/misc/support-policy/#unsupported).

## What you are building

A nested arrangement of three user namespaces: the Proxmox host, an **unprivileged** LXC container with Docker CE installed from Docker's repositories, and our image running under that Docker. The LXC container gives you snapshots, backups and resource limits with almost no overhead compared with a VM; the price is that every one of the three layers has an opinion about user ids, devices and filesystems.

## Container features

Create the container unprivileged (the default in the Proxmox UI) from a current Debian or Ubuntu template, then enable the two features Docker needs:

```bash
pct set <vmid> --features nesting=1,keyctl=1
```

`nesting` lets the container create its own cgroup and AppArmor namespaces, which Docker's runtime needs; `keyctl` allows the kernel keyring syscalls systemd and Docker use. Both are in the UI under Options → Features. No `lxc.apparmor.profile: unconfined`, no `lxc.cap.drop:` edits and no privileged mode are needed on Proxmox 7 or later; if a guide tells you otherwise, it predates `nesting`.

Reboot the container, install Docker from the [official repository](https://docs.docker.com/engine/install/) (not the distribution's package, see the support policy), and check:

```bash
docker info | grep -E 'Storage Driver|Cgroup|Security'
docker run --rm hello-world
```

## Storage driver

The storage driver line above should read `overlay2`. If it says `vfs`, stop: every image layer is copied in full, pulls take minutes and a handful of images fills the disk.

`vfs` appears when the container's root filesystem does not support overlayfs. On Proxmox that is ZFS before OpenZFS 2.2 (Proxmox 7); Proxmox 8 ships 2.2, where overlayfs on ZFS works, so a current host with a ZFS-backed container volume is fine. Directory, LVM-thin and ext4 storages have always worked. Two alternatives if you are stuck on an older ZFS: give the container a second mount point on a non-ZFS storage and bind it to `/var/lib/docker`, or enable `fuse=1` in the features and install `fuse-overlayfs` inside the container, which Docker picks up automatically but which is noticeably slower.

Give `/var/lib/docker` room. A media stack with a dozen of our images and their updates sits between 20 and 40 GB before `docker image prune`.

## User ids: three layers of mapping

This is where LXC differs from a VM, and where every "permission denied" on a bind mount comes from.

An unprivileged LXC container maps its uid 0 to host uid 100000 by default, uid 1 to 100001, and so on; the range is `root:100000:65536` in the host's `/etc/subuid` and `/etc/subgid`. Inside it, Docker runs rootful (as the container's root) and our image's `PUID`/`PGID` behave exactly as they do anywhere else, **relative to the LXC container**. So `PUID=1000` means uid 1000 inside the LXC, which the Proxmox host sees as uid **101000**.

| Where you look | Owner of `/config` files with `PUID=1000` |
| --- | --- |
| Inside our container | `abc` (1000) |
| Inside the LXC container | 1000 |
| On the Proxmox host | 101000 |

Consequences:

* Storage that lives inside the LXC's own disk needs nothing special. Create a user with uid 1000 in the LXC, use `PUID=1000`, done.
* A **bind mount from the Proxmox host** (`pct set <vmid> --mp0 /tank/media,mp=/mnt/media`) shows up with the host's ownership shifted by 100000. Host files owned by 1000 appear as `nobody` inside; files the container writes with uid 1000 land on the host as 101000. Either `chown -R 101000:101000` the host directory and accept the odd-looking ids, or shift the mapping so that container uid 1000 is host uid 1000:

    ```
    # /etc/pve/lxc/<vmid>.conf
    lxc.idmap: u 0 100000 1000
    lxc.idmap: g 0 100000 1000
    lxc.idmap: u 1000 1000 1
    lxc.idmap: g 1000 1000 1
    lxc.idmap: u 1001 101001 64535
    lxc.idmap: g 1001 101001 64535
    ```

    and allow root to map that id on the host by adding `root:1000:1` to both `/etc/subuid` and `/etc/subgid`. Every line must add up to a contiguous range of 65536 or the container will not start; the Proxmox wiki has the worked example under "Unprivileged LXC containers".

* Mounting an NFS or SMB share from inside an unprivileged LXC container needs the host to allow it (`mount` capabilities are dropped); mount it on the host and bind it in instead. NFS and SMB for `/config` remain unsupported wherever they are mounted; use them for media only.

Decide the mapping before you create data. Changing it later means a recursive `chown` over every mount.

## Hardware passthrough

### `/dev/dri` (Intel and AMD transcoding)

The GPU's render node must reach the LXC container first, then the Docker container. On Proxmox 8 the container configuration has a device entry for it:

```
# /etc/pve/lxc/<vmid>.conf
dev0: /dev/dri/renderD128,gid=104
dev1: /dev/dri/card0,gid=44
```

`gid` is the group the node will be owned by *inside* the LXC; `getent group render video` in the container tells you the numbers for your template (104 and 44 on Debian and Ubuntu). This replaces the older pair of lines, which still works:

```
lxc.cgroup2.devices.allow: c 226:* rwm
lxc.mount.entry: /dev/dri dev/dri none bind,optional,create=dir
```

Inside the LXC the device is then an ordinary `/dev/dri`, and you pass it to our image as on any host: `--device /dev/dri:/dev/dri`, or `devices: [/dev/dri:/dev/dri]` in compose, as shown on the image page. Our images that use the GPU add `abc` to the groups owning the device nodes at start, so there is nothing more to do; `vainfo` inside the application container (`docker exec jellyfin vainfo`, where the image ships it) confirms the driver loaded. The Proxmox host needs no driver for Intel beyond the kernel's `i915`; for AMD, `amdgpu`.

### NVIDIA

The driver has to be installed on the Proxmox host (with the kernel module) **and** inside the LXC container (the same version, with `--no-kernel-module`), then the NVIDIA Container Toolkit inside the LXC, with the device nodes (`/dev/nvidia0`, `/dev/nvidiactl`, `/dev/nvidia-uvm`, `/dev/nvidia-uvm-tools`, `/dev/nvidia-modeset`) passed through as above. Driver versions must match across host and LXC after every host upgrade, which is the main reason people move this workload to a VM. The Docker side is then what the image page says: `--runtime=nvidia`, `NVIDIA_VISIBLE_DEVICES=all`.

### USB devices and others

Zigbee and Z-Wave sticks, TV tuners and similar devices follow the same `dev0:` pattern with the `/dev/ttyUSB0` or `/dev/bus/usb/...` path and the right `gid` (`dialout`, 20, for serial devices). A device that appears and disappears (a USB stick re-plugged) keeps its path but can change its minor number; a udev rule on the host with a stable symlink saves you a restart.

## Networking

Bridge networking from the LXC (the default `vmbr0` interface) and Docker's default bridge inside it work without changes, including published ports and host networking for Plex. Docker `macvlan` networks inside an LXC container generally do not: the LXC's virtual interface is not promiscuous and the host bridge drops the extra MAC addresses. If you need containers with their own LAN addresses, give the LXC container additional network interfaces from Proxmox and use `ipvlan`, or run that workload in a VM.

## Backups and updates

Proxmox backs up the whole LXC container, `/var/lib/docker` included, which means every image layer goes into every backup. Exclude it (`vzdump` honours `--exclude-path`, or the backup job's advanced options) and keep only your compose files and the `/config` mounts; images are a `docker compose pull` away. Snapshot before `apt upgrade` in the container: a kernel on the host changes under the LXC without warning, and a Docker CE upgrade inside the LXC occasionally needs the container restarted to pick up a new `containerd`.

## What is and is not supported

* We support the images. If Sonarr behaves the same way in an LXC as it does in a VM, we help as usual; if a problem goes away when you move the same compose file to a VM, it is an LXC problem and ours ends there.
* Unprivileged LXC with `nesting` and `keyctl`, Docker CE from Docker's repository, `overlay2`: reasonable endeavours.
* Privileged LXC containers, running our images directly under LXC without Docker or Podman (they are OCI images, not LXC templates), Docker from the distribution's repository and `vfs` storage: unsupported.
* Rootless Docker or [rootless Podman](/docs/general/podman-quadlet/) *inside* an unprivileged LXC container adds a fourth user namespace. It can work on recent kernels; it is well outside what we can help with.
