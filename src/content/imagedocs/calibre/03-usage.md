---
image: "calibre"
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
  calibre:
    image: ghcr.io/linuxserver-playground/calibre:latest
    container_name: calibre
    security_opt:
      - seccomp:unconfined #optional
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - PASSWORD= #optional
      - CLI_ARGS= #optional
    volumes:
      - /path/to/calibre/config:/config
    ports:
      - 8080:8080
      - 8181:8181
      - 8081:8081
    shm_size: "1gb"
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=calibre \
  --security-opt seccomp=unconfined `#optional` \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e PASSWORD= `#optional` \
  -e CLI_ARGS= `#optional` \
  -p 8080:8080 \
  -p 8181:8181 \
  -p 8081:8081 \
  -v /path/to/calibre/config:/config \
  --shm-size="1gb" \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/calibre:latest
```
