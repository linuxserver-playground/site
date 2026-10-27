---
image: "calibre-web"
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
  calibre-web:
    image: ghcr.io/linuxserver-playground/calibre-web:latest
    container_name: calibre-web
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - DOCKER_MODS=linuxserver/mods:universal-calibre #optional
      - OAUTHLIB_RELAX_TOKEN_SCOPE=1 #optional
    volumes:
      - /path/to/calibre-web/data:/config
      - /path/to/calibre/library:/books
    ports:
      - 8083:8083
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=calibre-web \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e DOCKER_MODS=linuxserver/mods:universal-calibre `#optional` \
  -e OAUTHLIB_RELAX_TOKEN_SCOPE=1 `#optional` \
  -p 8083:8083 \
  -v /path/to/calibre-web/data:/config \
  -v /path/to/calibre/library:/books \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/calibre-web:latest
```
