---
image: "tvheadend"
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
  tvheadend:
    image: ghcr.io/linuxserver-playground/tvheadend:latest
    container_name: tvheadend
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - RUN_OPTS= #optional
    volumes:
      - /path/to/tvheadend/data:/config
      - /path/to/recordings:/recordings
    ports:
      - 9981:9981
      - 9982:9982
    devices:
      - /dev/dri:/dev/dri #optional
      - /dev/dvb:/dev/dvb #optional
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=tvheadend \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e RUN_OPTS= `#optional` \
  -p 9981:9981 \
  -p 9982:9982 \
  -v /path/to/tvheadend/data:/config \
  -v /path/to/recordings:/recordings \
  --device /dev/dri:/dev/dri `#optional` \
  --device /dev/dvb:/dev/dvb `#optional` \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/tvheadend:latest
```
