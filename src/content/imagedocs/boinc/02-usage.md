---
image: "boinc"
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
  boinc:
    image: ghcr.io/linuxserver-playground/boinc:latest
    container_name: boinc
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - PASSWORD= #optional
    volumes:
      - /path/to/boinc/config:/config
    ports:
      - 8080:8080
      - 8181:8181
    devices:
      - /dev/dri:/dev/dri #optional
    shm_size: "1gb"
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=boinc \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e PASSWORD= `#optional` \
  -p 8080:8080 \
  -p 8181:8181 \
  -v /path/to/boinc/config:/config \
  --device /dev/dri:/dev/dri `#optional` \
  --shm-size="1gb" \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/boinc:latest
```
