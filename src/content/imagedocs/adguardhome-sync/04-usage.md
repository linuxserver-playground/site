---
image: "adguardhome-sync"
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
  adguardhome-sync:
    image: ghcr.io/linuxserver-playground/adguardhome-sync:latest
    container_name: adguardhome-sync
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - CONFIGFILE=/config/adguardhome-sync.yaml #optional
    volumes:
      - /path/to/adguardhome-sync/config:/config
    ports:
      - 8080:8080
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=adguardhome-sync \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e CONFIGFILE=/config/adguardhome-sync.yaml `#optional` \
  -p 8080:8080 \
  -v /path/to/adguardhome-sync/config:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/adguardhome-sync:latest
```
