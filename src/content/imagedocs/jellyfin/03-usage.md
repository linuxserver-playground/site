---
image: "jellyfin"
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
  jellyfin:
    image: ghcr.io/linuxserver-playground/jellyfin:latest
    container_name: jellyfin
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - JELLYFIN_PublishedServerUrl=http://192.168.0.5 #optional
    volumes:
      - /path/to/jellyfin/library:/config
      - /path/to/tvseries:/data/tvshows
      - /path/to/movies:/data/movies
    ports:
      - 8096:8096
      - 8920:8920 #optional
      - 7359:7359/udp #optional
      - 1900:1900/udp #optional
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=jellyfin \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e JELLYFIN_PublishedServerUrl=http://192.168.0.5 `#optional` \
  -p 8096:8096 \
  -p 8920:8920 `#optional` \
  -p 7359:7359/udp `#optional` \
  -p 1900:1900/udp `#optional` \
  -v /path/to/jellyfin/library:/config \
  -v /path/to/tvseries:/data/tvshows \
  -v /path/to/movies:/data/movies \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/jellyfin:latest
```
