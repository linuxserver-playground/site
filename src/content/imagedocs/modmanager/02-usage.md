---
image: "modmanager"
section: "usage"
title: "Usage"
order: 2
---
To help you get started creating a container from this image you can either use docker compose or the docker cli.

>[!NOTE]
>Unless a parameter is flaged as 'optional', it is *mandatory* and a value must be provided.

### docker compose (recommended, [click here for more info](https://docs.linuxserver.io/general/docker-compose))

```yaml
---
services:
  modmanager:
    image: lscr.io/linuxserver/modmanager:latest
    container_name: modmanager
    environment:
      - DOCKER_MODS= `#optional`
      - DOCKER_HOST= `#optional`
      - DOCKER_MODS_EXTRA_HOSTS= `#optional`
    volumes:
      - /path/to/modcache:/modcache
      - /var/run/docker.sock:/var/run/docker.sock:ro `#optional`
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=modmanager \
  -e DOCKER_MODS= `#optional` \
  -e DOCKER_HOST= `#optional` \
  -e DOCKER_MODS_EXTRA_HOSTS= `#optional` \
  -v /path/to/modcache:/modcache \
  -v /var/run/docker.sock:/var/run/docker.sock:ro `#optional` \
  --restart unless-stopped \
  lscr.io/linuxserver/modmanager:latest
```
