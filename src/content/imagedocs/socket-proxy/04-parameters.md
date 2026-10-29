---
image: "socket-proxy"
section: "parameters"
title: "Parameters"
order: 4
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-e ALLOW_ARCHIVE=0` | `(/libpod)?/(containers∣pods)/{id}/archive` |
| `-e AUTH=0` | `/auth` |
| `-e BUILD=0` | `/build` |
| `-e COMMIT=0` | `/commit` |
| `-e CONFIGS=0` | `/configs` |
| `-e CONTAINERS=0` | `/containers` |
| `-e DISTRIBUTION=0` | `/distribution` |
| `-e DISABLE_IPV6=0` | Set to `1` to prevent binding to the IPv6 interface for legacy systems that cannot support IPv6. |
| `-e EVENTS=1` | `/events` |
| `-e EXEC=0` | `/exec` & `/containers/{id}/exec` |
| `-e IMAGES=0` | `/images` |
| `-e INFO=0` | `/info` |
| `-e LOG_LEVEL=info` | Possible values are: `debug`, `info`, `notice`, `warning`, `err`, `crit`, `alert` and `emerg`. Defaults to `info`. |
| `-e NETWORKS=0` | `/networks` |
| `-e NODES=0` | `/nodes` |
| `-e PING=1` | `/_ping` |
| `-e PLUGINS=0` | `/plugins` |
| `-e POST=0` | When set to `0`, only `GET` and `HEAD` operations are allowed, making API access read-only. |
| `-e SECRETS=0` | `/secrets` |
| `-e SERVICES=0` | `/services` |
| `-e SESSION=0` | `/session` |
| `-e SWARM=0` | `/swarm` |
| `-e SYSTEM=0` | `/system` |
| `-e TASKS=0` | `/tasks` |
| `-e TZ=Etc/UTC` | `Set container timezone` |
| `-e VERSION=1` | `/version` |
| `-e VOLUMES=0` | `/volumes` |
| **Podman libpod API** | |
| `-e LIBPOD_CONTAINERS=0` | `/libpod/containers` |
| `-e LIBPOD_EVENTS=0` | `/libpod/events` |
| `-e LIBPOD_EXEC=0` | `/libpod/exec` |
| `-e LIBPOD_GENERATE=0` | `/libpod/generate` (systemd/kube YAML generation) |
| `-e LIBPOD_IMAGES=0` | `/libpod/images` |
| `-e LIBPOD_INFO=0` | `/libpod/info` |
| `-e LIBPOD_MANIFESTS=0` | `/libpod/manifests` |
| `-e LIBPOD_NETWORKS=0` | `/libpod/networks` |
| `-e LIBPOD_PING=1` | `/libpod/_ping` |
| `-e LIBPOD_PLAY=0` | `/libpod/play` (kube play) |
| `-e LIBPOD_PODS=0` | `/libpod/pods` (Podman-specific pod management) |
| `-e LIBPOD_SECRETS=0` | `/libpod/secrets` |
| `-e LIBPOD_SYSTEM=0` | `/libpod/system` |
| `-e LIBPOD_VERSION=1` | `/libpod/version` |
| `-e LIBPOD_VOLUMES=0` | `/libpod/volumes` |
| **These are `GET`-only options (they are not affected by the `POST` option)** | |
| `-e ALLOW_CHANGES=0` | `(/libpod)?/(containers∣pods)/{id}/changes` |
| `-e ALLOW_EXPORT=0` | `(/libpod)?/(containers∣pods)/{id}/export` |
| `-e ALLOW_LOGS=0` | `(/libpod)?/(containers∣pods)/{id}/logs` |
| `-e ALLOW_TOP=0` | `(/libpod)?/(containers∣pods)/{id}/top` |
| **These options work even when `POST=0`** | |
| `-e ALLOW_PAUSE=0` | `(/libpod)?/(containers∣pods)/{id}/pause` |
| `-e ALLOW_RESTARTS=0` | `(/libpod)?/(containers∣pods)/{id}/stop`, `(/libpod)?/(containers∣pods)/{id}/restart`, and `(/libpod)?/(containers∣pods)/{id}/kill` |
| `-e ALLOW_START=0` | `(/libpod)?/(containers∣pods)/{id}/start` |
| `-e ALLOW_STOP=0` | `(/libpod)?/(containers∣pods)/{id}/stop` |
| `-e ALLOW_UNPAUSE=0` | `(/libpod)?/(containers∣pods)/{id}/unpause` |
| `-v /var/run/docker.sock:ro` | Mount the host docker socket into the container. |
| `--read-only` | Make the container filesystem read-only. |
| `--tmpfs /run` | Mount /run to tmpfs (RAM) to make it writeable. |
