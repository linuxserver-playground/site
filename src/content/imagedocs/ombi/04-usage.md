---
image: "ombi"
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
  ombi:
    image: ghcr.io/linuxserver-playground/ombi:latest
    container_name: ombi
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - BASE_URL=/ #optional
    volumes:
      - /path/to/ombi/config:/config
    ports:
      - 3579:3579
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=ombi \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e BASE_URL=/ `#optional` \
  -p 3579:3579 \
  -v /path/to/ombi/config:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/ombi:latest
```
