---
image: "kometa"
section: "usage"
title: "Usage"
order: 3
---
To help you get started creating a container from this image you can either use docker-compose or the docker cli.

> [!NOTE]
> Unless a parameter is flagged as 'optional', it is *mandatory* and a value must be provided.

### docker-compose (recommended, [click here for more info](https://linuxserver-playground.github.io/site/docs/general/docker-compose))

```yaml
---
services:
  kometa:
    image: ghcr.io/linuxserver-playground/kometa:latest
    container_name: kometa
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - KOMETA_CONFIG=/config/config.yml #optional
      - KOMETA_TIMES=03:00 #optional
      - KOMETA_RUN=False #optional
      - KOMETA_TESTS=False #optional
      - KOMETA_NO_MISSING=False #optional
    volumes:
      - /path/to/kometa/config:/config
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=kometa \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e KOMETA_CONFIG=/config/config.yml `#optional` \
  -e KOMETA_TIMES=03:00 `#optional` \
  -e KOMETA_RUN=False `#optional` \
  -e KOMETA_TESTS=False `#optional` \
  -e KOMETA_NO_MISSING=False `#optional` \
  -v /path/to/kometa/config:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/kometa:latest
```
