---
image: "lidarr"
section: "usage"
title: "Usage"
order: 5
---
To help you get started creating a container from this image you can either use docker-compose or the docker cli.

> [!NOTE]
> Unless a parameter is flagged as 'optional', it is *mandatory* and a value must be provided.

### docker-compose (recommended, [click here for more info](https://linuxserver-playground.github.io/site/docs/general/docker-compose))

```yaml
---
services:
  lidarr:
    image: ghcr.io/linuxserver-playground/lidarr:latest
    container_name: lidarr
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - /path/to/lidarr/config:/config
      - /path/to/music:/music #optional
      - /path/to/downloads:/downloads #optional
    ports:
      - 8686:8686
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=lidarr \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -p 8686:8686 \
  -v /path/to/lidarr/config:/config \
  -v /path/to/music:/music `#optional` \
  -v /path/to/downloads:/downloads `#optional` \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/lidarr:latest
```
