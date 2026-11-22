---
image: "homeassistant"
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
  homeassistant:
    image: ghcr.io/linuxserver-playground/homeassistant:latest
    container_name: homeassistant
    network_mode: host
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - /path/to/homeassistant/data:/config
    ports:
      - 8123:8123 #optional
    devices:
      - /dev/ttyUSB0:/dev/ttyUSB0 #optional
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=homeassistant \
  --net=host \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -p 8123:8123 `#optional` \
  -v /path/to/homeassistant/data:/config \
  --device /dev/ttyUSB0:/dev/ttyUSB0 `#optional` \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/homeassistant:latest
```
