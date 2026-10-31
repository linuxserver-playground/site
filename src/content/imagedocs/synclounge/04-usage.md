---
image: "synclounge"
section: "usage"
title: "Usage"
order: 4
---
To help you get started creating a container from this image you can either use docker-compose or the docker cli.

> [!NOTE]
> Unless a parameter is flagged as 'optional', it is *mandatory* and a value must be provided.

### docker-compose (recommended, [click here for more info](https://linuxserver-playground.github.io/site/docs/general/docker-compose))

```yaml
---
services:
  synclounge:
    image: ghcr.io/linuxserver-playground/synclounge:latest
    container_name: synclounge
    environment:
      - AUTH_LIST=plexuser1,plexuser2,email1,machineid1 #optional
    ports:
      - 8088:8088
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=synclounge \
  -e AUTH_LIST=plexuser1,plexuser2,email1,machineid1 `#optional` \
  -p 8088:8088 \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/synclounge:latest
```
