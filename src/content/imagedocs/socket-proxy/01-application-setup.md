---
image: "socket-proxy"
section: "application-setup"
title: "Application Setup"
order: 1
---
This container is conceptually based on [https://github.com/Tecnativa/docker-socket-proxy](https://github.com/Tecnativa/docker-socket-proxy) and as such does not follow our usual container conventions. It *does not* support mods or custom scripts/services. It is designed to act as a drop-in replacement for the Tecnativa container.

The container should be run on the same docker network as the service(s) using it. Most containers that would normally connect to a mounted docker.sock can have their endpoint overridden using the `DOCKER_HOST` environment variable if they do not offer the option in their configuration; it should typically be pointed to `tcp://socket-proxy:2375`.

* Never expose this container's port to a public network. It should be treated the same way you would treat the docker socket or TCP endpoint.
* Revoke access to any API section that you consider your service should not need.
* To see the versions of the API your Docker daemon and client support, use `docker version` and check the `API version`.
* [Read the docs](https://docs.docker.com/engine/api/) for the API version you are using for an explanation of all the available endpoints.

### Podman / libpod API

Podman exposes two API groups on the same socket: the Docker-compatible API (controlled by the existing env vars above) and the libpod-native API prefixed with `/libpod/`. The `LIBPOD_*` environment variables control access to the libpod endpoints independently of their Docker-compat equivalents.

For example, to use [prometheus-podman-exporter](https://github.com/containers/prometheus-podman-exporter), enable:

```yaml
- LIBPOD_CONTAINERS=1
- LIBPOD_INFO=1
- LIBPOD_NETWORKS=1
- LIBPOD_PODS=1
- LIBPOD_VOLUMES=1
- LIBPOD_IMAGES=1
- LIBPOD_EVENTS=1
```

Point the exporter at `tcp://socket-proxy:2375` using `CONTAINER_HOST`. `LIBPOD_PING` and `LIBPOD_VERSION` are enabled by default (like their Docker-compat counterparts `PING` and `VERSION`).

### Rootless Podman as a non-root user

Under rootless Podman the container process runs as `root` *inside its user namespace* by default. You can go a step further and drop root inside the container as well, running the proxy as an unprivileged user such as `nobody` (UID/GID `65534`). Two things need to be handled for this to work:

* **Socket ownership.** The rootless Podman socket (`$XDG_RUNTIME_DIR/podman/podman.sock`) is owned by your host user. That user maps to `root` inside the container's namespace, so a non-root user in the container cannot read it. Use `--userns=keep-id:uid=65534,gid=65534` to map your host user onto UID/GID `65534` inside the container, so `nobody` owns the socket and can proxy it.
* **A writable `/run`.** The entrypoint renders the HAProxy config into `/run/haproxy` at startup, so `/run` must be writable by the non-root user. Mount it as a tmpfs with `mode=1777` (this also satisfies read-only operation).

Example `podman run`:

```bash
podman run -d \
  --name=socket-proxy \
  --user 65534:65534 \
  --userns=keep-id:uid=65534,gid=65534 \
  -e CONTAINERS=1 `#optional` \
  -e LIBPOD_CONTAINERS=1 `#optional` \
  -e POST=0 `#optional` \
  -v $XDG_RUNTIME_DIR/podman/podman.sock:/var/run/docker.sock:ro \
  -p 2375:2375 \
  --read-only \
  --tmpfs /run:rw,mode=1777 \
  --restart unless-stopped \
  lscr.io/linuxserver/socket-proxy:latest
```

Or as a rootless [Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) unit (`~/.config/containers/systemd/socket-proxy.container`), started with `systemctl --user daemon-reload && systemctl --user start socket-proxy`:

```ini
[Container]
ContainerName=socket-proxy
Image=lscr.io/linuxserver/socket-proxy:latest
User=65534:65534
UserNS=keep-id:uid=65534,gid=65534
Environment=CONTAINERS=1
Environment=LIBPOD_CONTAINERS=1
Environment=POST=0
Volume=%t/podman/podman.sock:/var/run/docker.sock:ro
PublishPort=2375:2375
ReadOnly=true
Tmpfs=/run:rw,mode=1777

[Install]
WantedBy=default.target
```

(`%t` expands to `$XDG_RUNTIME_DIR`.) Enable the socket first with `systemctl --user enable --now podman.socket`.

> [!NOTE]
> On SELinux-enforcing hosts (e.g. Fedora/RHEL), add `--security-opt label=disable` to the `podman run` (or `SecurityLabelDisable=true` to the Quadlet) so the container can access the mounted socket.
