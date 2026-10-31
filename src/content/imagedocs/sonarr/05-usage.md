---
image: "sonarr"
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
  sonarr:
    image: ghcr.io/linuxserver-playground/sonarr:latest
    container_name: sonarr
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - /path/to/sonarr/data:/config
      - /path/to/tvseries:/tv #optional
      - /path/to/downloadclient-downloads:/downloads #optional
    ports:
      - 8989:8989
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=sonarr \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -p 8989:8989 \
  -v /path/to/sonarr/data:/config \
  -v /path/to/tvseries:/tv `#optional` \
  -v /path/to/downloadclient-downloads:/downloads `#optional` \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/sonarr:latest
```
