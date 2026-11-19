---
image: "foldingathome"
section: "usage"
title: "Usage"
order: 5
---
To help you get started creating a container from this image you can either use docker-compose or the docker cli.

> [!NOTE]
> Unless a parameter is flagged as 'optional', it is *mandatory* and a value must be provided.

### docker-compose (recommended, [click here for more info](https://linuxserver-playground.github.io/site/docs/general/docker-compose))

```yaml
---
services:
  foldingathome:
    image: ghcr.io/linuxserver-playground/foldingathome:latest
    container_name: foldingathome
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - ACCOUNT_TOKEN=
      - MACHINE_NAME=
      - CLI_ARGS= #optional
    volumes:
      - /path/to/foldingathome/data:/config
    ports:
      - 7396:7396 #optional
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=foldingathome \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e ACCOUNT_TOKEN= \
  -e MACHINE_NAME= \
  -e CLI_ARGS= `#optional` \
  -p 7396:7396 `#optional` \
  -v /path/to/foldingathome/data:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/foldingathome:latest
```
