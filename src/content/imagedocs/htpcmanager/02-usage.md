---
image: "htpcmanager"
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
  htpcmanager:
    image: ghcr.io/linuxserver-playground/htpcmanager:latest
    container_name: htpcmanager
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - /path/to/htpcmanager/config:/config
    ports:
      - 8085:8085
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=htpcmanager \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -p 8085:8085 \
  -v /path/to/htpcmanager/config:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/htpcmanager:latest
```
