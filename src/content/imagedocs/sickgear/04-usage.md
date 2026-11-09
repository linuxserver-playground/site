---
image: "sickgear"
section: "usage"
title: "Usage"
order: 4
---
To help you get started creating a container from this image you can either use docker-compose or the docker cli.

> [!NOTE]
> Unless a parameter is flagged as 'optional', it is *mandatory* and a value must be provided.

### docker-compose (recommended, [click here for more info](https://linuxserver-playground.github.io/site/docs/general/docker-compose))

```yaml
---
services:
  sickgear:
    image: ghcr.io/linuxserver-playground/sickgear:latest
    container_name: sickgear
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - /path/to/sickgear/data:/config
      - /path/to/tv:/tv
      - /path/to/downloads:/downloads
    ports:
      - 8081:8081
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=sickgear \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -p 8081:8081 \
  -v /path/to/sickgear/data:/config \
  -v /path/to/tv:/tv \
  -v /path/to/downloads:/downloads \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/sickgear:latest
```
