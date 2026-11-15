---
image: "resilio-sync"
section: "usage"
title: "Usage"
order: 2
---
To help you get started creating a container from this image you can either use docker-compose or the docker cli.

> [!NOTE]
> Unless a parameter is flagged as 'optional', it is *mandatory* and a value must be provided.

### docker-compose (recommended, [click here for more info](https://linuxserver-playground.github.io/site/docs/general/docker-compose))

```yaml
---
services:
  resilio-sync:
    image: ghcr.io/linuxserver-playground/resilio-sync:latest
    container_name: resilio-sync
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - /path/to/resilio-sync/config:/config
      - /path/to/downloads:/downloads
      - /path/to/data:/sync
    ports:
      - 8888:8888
      - 55555:55555
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=resilio-sync \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -p 8888:8888 \
  -p 55555:55555 \
  -v /path/to/resilio-sync/config:/config \
  -v /path/to/downloads:/downloads \
  -v /path/to/data:/sync \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/resilio-sync:latest
```
