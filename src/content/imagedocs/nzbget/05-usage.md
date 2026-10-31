---
image: "nzbget"
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
  nzbget:
    image: ghcr.io/linuxserver-playground/nzbget:latest
    container_name: nzbget
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - NZBGET_USER=nzbget #optional
      - NZBGET_PASS=tegbzn6789 #optional
    volumes:
      - /path/to/nzbget/data:/config
      - /path/to/downloads:/downloads #optional
    ports:
      - 6789:6789
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=nzbget \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e NZBGET_USER=nzbget `#optional` \
  -e NZBGET_PASS=tegbzn6789 `#optional` \
  -p 6789:6789 \
  -v /path/to/nzbget/data:/config \
  -v /path/to/downloads:/downloads `#optional` \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/nzbget:latest
```
