---
image: "habridge"
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
  habridge:
    image: ghcr.io/linuxserver-playground/habridge:latest
    container_name: habridge
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - SEC_KEY=
    volumes:
      - /path/to/habridge/config:/config
    ports:
      - 8080:8080
      - 50000:50000
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=habridge \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e SEC_KEY= \
  -p 8080:8080 \
  -p 50000:50000 \
  -v /path/to/habridge/config:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/habridge:latest
```
