---
image: "beets"
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
  beets:
    image: ghcr.io/linuxserver-playground/beets:latest
    container_name: beets
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - /path/to/beets/config:/config
      - /path/to/music/library:/music
      - /path/to/ingest:/downloads
    ports:
      - 8337:8337
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=beets \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -p 8337:8337 \
  -v /path/to/beets/config:/config \
  -v /path/to/music/library:/music \
  -v /path/to/ingest:/downloads \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/beets:latest
```
