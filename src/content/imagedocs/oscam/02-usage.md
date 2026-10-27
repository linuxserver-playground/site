---
image: "oscam"
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
  oscam:
    image: ghcr.io/linuxserver-playground/oscam:latest
    container_name: oscam
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - /path/to/oscam/data:/config
    ports:
      - 8888:8888
    devices:
      - /dev/ttyUSB0:/dev/ttyUSB0
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=oscam \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -p 8888:8888 \
  -v /path/to/oscam/data:/config \
  --device /dev/ttyUSB0:/dev/ttyUSB0 \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/oscam:latest
```
