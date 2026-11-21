---
image: "lazylibrarian"
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
  lazylibrarian:
    image: ghcr.io/linuxserver-playground/lazylibrarian:latest
    container_name: lazylibrarian
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - DOCKER_MODS=linuxserver/mods:universal-calibre|linuxserver/mods:lazylibrarian-ffmpeg #optional
    volumes:
      - /path/to/lazylibrarian/data:/config
      - /path/to/downloads/:/downloads
      - /path/to/data/:/books #optional
    ports:
      - 5299:5299
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=lazylibrarian \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e DOCKER_MODS=linuxserver/mods:universal-calibre|linuxserver/mods:lazylibrarian-ffmpeg `#optional` \
  -p 5299:5299 \
  -v /path/to/lazylibrarian/data:/config \
  -v /path/to/downloads/:/downloads \
  -v /path/to/data/:/books `#optional` \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/lazylibrarian:latest
```
