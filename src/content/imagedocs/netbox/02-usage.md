---
image: "netbox"
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
  netbox:
    image: ghcr.io/linuxserver-playground/netbox:latest
    container_name: netbox
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - SUPERUSER_EMAIL=
      - SUPERUSER_PASSWORD=
      - ALLOWED_HOST=
      - DB_NAME=
      - DB_USER=
      - DB_PASSWORD=
      - DB_HOST=
      - DB_PORT=
      - REDIS_HOST=
      - REDIS_PORT=
      - REDIS_USERNAME=
      - REDIS_PASSWORD=
      - REDIS_DB_TASK=
      - REDIS_DB_CACHE=
      - BASE_PATH= #optional
      - CSRF_TRUSTED_ORIGINS= #optional
      - REMOTE_AUTH_ENABLED= #optional
      - REMOTE_AUTH_BACKEND= #optional
      - REMOTE_AUTH_HEADER= #optional
      - REMOTE_AUTH_AUTO_CREATE_USER= #optional
      - REMOTE_AUTH_DEFAULT_GROUPS= #optional
      - REMOTE_AUTH_DEFAULT_PERMISSIONS= #optional
    volumes:
      - /path/to/netbox/config:/config
    ports:
      - 8000:8000
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=netbox \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e SUPERUSER_EMAIL= \
  -e SUPERUSER_PASSWORD= \
  -e ALLOWED_HOST= \
  -e DB_NAME= \
  -e DB_USER= \
  -e DB_PASSWORD= \
  -e DB_HOST= \
  -e DB_PORT= \
  -e REDIS_HOST= \
  -e REDIS_PORT= \
  -e REDIS_USERNAME= \
  -e REDIS_PASSWORD= \
  -e REDIS_DB_TASK= \
  -e REDIS_DB_CACHE= \
  -e BASE_PATH= `#optional` \
  -e CSRF_TRUSTED_ORIGINS= `#optional` \
  -e REMOTE_AUTH_ENABLED= `#optional` \
  -e REMOTE_AUTH_BACKEND= `#optional` \
  -e REMOTE_AUTH_HEADER= `#optional` \
  -e REMOTE_AUTH_AUTO_CREATE_USER= `#optional` \
  -e REMOTE_AUTH_DEFAULT_GROUPS= `#optional` \
  -e REMOTE_AUTH_DEFAULT_PERMISSIONS= `#optional` \
  -p 8000:8000 \
  -v /path/to/netbox/config:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/netbox:latest
```
