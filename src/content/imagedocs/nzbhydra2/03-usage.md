---
image: "nzbhydra2"
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
  nzbhydra2:
    image: ghcr.io/linuxserver-playground/nzbhydra2:latest
    container_name: nzbhydra2
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - /path/to/nzbhydra2/data:/config
      - /path/to/downloads:/downloads #optional
    ports:
      - 5076:5076
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=nzbhydra2 \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -p 5076:5076 \
  -v /path/to/nzbhydra2/data:/config \
  -v /path/to/downloads:/downloads `#optional` \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/nzbhydra2:latest
```
