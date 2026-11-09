---
image: "audiosilo"
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
  audiosilo:
    image: ghcr.io/linuxserver-playground/audiosilo:latest
    container_name: audiosilo
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - /path/to/audiosilo/config:/config
      - /path/to/audiobooks:/audiobooks:ro
    ports:
      - 8080:8080
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=audiosilo \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -p 8080:8080 \
  -v /path/to/audiosilo/config:/config \
  -v /path/to/audiobooks:/audiobooks:ro \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/audiosilo:latest
```
