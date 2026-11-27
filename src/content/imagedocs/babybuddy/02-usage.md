---
image: "babybuddy"
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
  babybuddy:
    image: ghcr.io/linuxserver-playground/babybuddy:latest
    container_name: babybuddy
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - CSRF_TRUSTED_ORIGINS=http://127.0.0.1:8000,https://babybuddy.domain.com
    volumes:
      - /path/to/babybuddy/config:/config
    ports:
      - 8000:8000
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=babybuddy \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e CSRF_TRUSTED_ORIGINS=http://127.0.0.1:8000,https://babybuddy.domain.com \
  -p 8000:8000 \
  -v /path/to/babybuddy/config:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/babybuddy:latest
```
