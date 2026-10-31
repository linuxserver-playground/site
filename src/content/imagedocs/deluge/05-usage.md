---
image: "deluge"
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
  deluge:
    image: ghcr.io/linuxserver-playground/deluge:latest
    container_name: deluge
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - DELUGE_LOGLEVEL=error #optional
    volumes:
      - /path/to/deluge/config:/config
      - /path/to/downloads:/downloads
    ports:
      - 8112:8112
      - 6881:6881
      - 6881:6881/udp
      - 58846:58846 #optional
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=deluge \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e DELUGE_LOGLEVEL=error `#optional` \
  -p 8112:8112 \
  -p 6881:6881 \
  -p 6881:6881/udp \
  -p 58846:58846 `#optional` \
  -v /path/to/deluge/config:/config \
  -v /path/to/downloads:/downloads \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/deluge:latest
```
