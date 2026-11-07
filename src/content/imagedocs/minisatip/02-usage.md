---
image: "minisatip"
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
  minisatip:
    image: ghcr.io/linuxserver-playground/minisatip:latest
    container_name: minisatip
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - RUN_OPTS=
    volumes:
      - /path/to/minisatip/config:/config
    ports:
      - 8875:8875
      - 554:554
      - 1900:1900/udp
    devices:
      - /dev/dvb:/dev/dvb
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=minisatip \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e RUN_OPTS= \
  -p 8875:8875 \
  -p 554:554 \
  -p 1900:1900/udp \
  -v /path/to/minisatip/config:/config \
  --device /dev/dvb:/dev/dvb \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/minisatip:latest
```
