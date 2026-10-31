---
image: "socket-proxy"
section: "usage"
title: "Usage"
order: 3
---
To help you get started creating a container from this image you can either use docker compose or the docker cli.

>[!NOTE]
>Unless a parameter is flaged as 'optional', it is *mandatory* and a value must be provided.

### docker compose (recommended, [click here for more info](https://docs.linuxserver.io/general/docker-compose))

```yaml
---
services:
  socket-proxy:
    image: lscr.io/linuxserver/socket-proxy:latest
    container_name: socket-proxy
    environment:
      - ALLOW_ARCHIVE=0 #optional
      - ALLOW_CHANGES=0 #optional
      - ALLOW_EXPORT=0 #optional
      - ALLOW_LOGS=0 #optional
      - ALLOW_PAUSE=0 #optional
      - ALLOW_RESTARTS=0 #optional
      - ALLOW_STOP=0 #optional
      - ALLOW_START=0 #optional
      - ALLOW_TOP=0 #optional
      - ALLOW_UNPAUSE=0 #optional
      - AUTH=0 #optional
      - BUILD=0 #optional
      - COMMIT=0 #optional
      - CONFIGS=0 #optional
      - CONTAINERS=0 #optional
      - DISABLE_IPV6=0 #optional
      - DISTRIBUTION=0 #optional
      - EVENTS=1 #optional
      - EXEC=0 #optional
      - IMAGES=0 #optional
      - INFO=0 #optional
      - LOG_LEVEL=info #optional
      - NETWORKS=0 #optional
      - NODES=0 #optional
      - PING=1 #optional
      - PLUGINS=0 #optional
      - POST=0 #optional
      - SECRETS=0 #optional
      - SERVICES=0 #optional
      - SESSION=0 #optional
      - SWARM=0 #optional
      - SYSTEM=0 #optional
      - TASKS=0 #optional
      - TZ=Etc/UTC #optional
      - VERSION=1 #optional
      - VOLUMES=0 #optional
      - LIBPOD_CONTAINERS=0 #optional
      - LIBPOD_EVENTS=0 #optional
      - LIBPOD_EXEC=0 #optional
      - LIBPOD_GENERATE=0 #optional
      - LIBPOD_IMAGES=0 #optional
      - LIBPOD_INFO=0 #optional
      - LIBPOD_MANIFESTS=0 #optional
      - LIBPOD_NETWORKS=0 #optional
      - LIBPOD_PING=1 #optional
      - LIBPOD_PLAY=0 #optional
      - LIBPOD_PODS=0 #optional
      - LIBPOD_SECRETS=0 #optional
      - LIBPOD_SYSTEM=0 #optional
      - LIBPOD_VERSION=1 #optional
      - LIBPOD_VOLUMES=0 #optional
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    restart: unless-stopped
    read_only: true
    tmpfs:
      - /run
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=socket-proxy \
  -e ALLOW_ARCHIVE=0 `#optional` \
  -e ALLOW_CHANGES=0 `#optional` \
  -e ALLOW_EXPORT=0 `#optional` \
  -e ALLOW_LOGS=0 `#optional` \
  -e ALLOW_PAUSE=0 `#optional` \
  -e ALLOW_RESTARTS=0 `#optional` \
  -e ALLOW_STOP=0 `#optional` \
  -e ALLOW_START=0 `#optional` \
  -e ALLOW_TOP=0 `#optional` \
  -e ALLOW_UNPAUSE=0 `#optional` \
  -e AUTH=0 `#optional` \
  -e BUILD=0 `#optional` \
  -e COMMIT=0 `#optional` \
  -e CONFIGS=0 `#optional` \
  -e CONTAINERS=0 `#optional` \
  -e DISTRIBUTION=0 `#optional` \
  -e DISABLE_IPV6=0 `#optional` \
  -e EVENTS=1 `#optional` \
  -e EXEC=0 `#optional` \
  -e IMAGES=0 `#optional` \
  -e INFO=0 `#optional` \
  -e LOG_LEVEL=info `#optional` \
  -e NETWORKS=0 `#optional` \
  -e NODES=0 `#optional` \
  -e PING=1 `#optional` \
  -e PLUGINS=0 `#optional` \
  -e POST=0 `#optional` \
  -e SECRETS=0 `#optional` \
  -e SERVICES=0 `#optional` \
  -e SESSION=0 `#optional` \
  -e SWARM=0 `#optional` \
  -e SYSTEM=0 `#optional` \
  -e TASKS=0 `#optional` \
  -e TZ=Etc/UTC `#optional` \
  -e VERSION=1 `#optional` \
  -e VOLUMES=0 `#optional` \
  -e LIBPOD_CONTAINERS=0 `#optional` \
  -e LIBPOD_EVENTS=0 `#optional` \
  -e LIBPOD_EXEC=0 `#optional` \
  -e LIBPOD_GENERATE=0 `#optional` \
  -e LIBPOD_IMAGES=0 `#optional` \
  -e LIBPOD_INFO=0 `#optional` \
  -e LIBPOD_MANIFESTS=0 `#optional` \
  -e LIBPOD_NETWORKS=0 `#optional` \
  -e LIBPOD_PING=1 `#optional` \
  -e LIBPOD_PLAY=0 `#optional` \
  -e LIBPOD_PODS=0 `#optional` \
  -e LIBPOD_SECRETS=0 `#optional` \
  -e LIBPOD_SYSTEM=0 `#optional` \
  -e LIBPOD_VERSION=1 `#optional` \
  -e LIBPOD_VOLUMES=0 `#optional` \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --restart unless-stopped \
  --read-only \
  --tmpfs /run \
  lscr.io/linuxserver/socket-proxy:latest
```
