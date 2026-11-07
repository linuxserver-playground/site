---
image: "medusa"
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
  medusa:
    image: ghcr.io/linuxserver-playground/medusa:latest
    container_name: medusa
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - /path/to/medusa/config:/config
      - /path/to/downloads:/downloads
      - /path/to/tv/shows:/tv
    ports:
      - 8081:8081
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=medusa \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -p 8081:8081 \
  -v /path/to/medusa/config:/config \
  -v /path/to/downloads:/downloads \
  -v /path/to/tv/shows:/tv \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/medusa:latest
```
