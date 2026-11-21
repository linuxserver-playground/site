---
image: "flexget"
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
  flexget:
    image: ghcr.io/linuxserver-playground/flexget:latest
    container_name: flexget
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - FG_LOG_LEVEL=info
      - FG_LOG_FILE=/config/flexget.log
      - FG_CONFIG_FILE=/config/.flexget/config.yml
      - FG_WEBUI_PASSWORD=info #optional
    volumes:
      - /path/to/flexget/data:/config
      - /path/to/downloads:/data #optional
    ports:
      - 5050:5050
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=flexget \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e FG_LOG_LEVEL=info \
  -e FG_LOG_FILE=/config/flexget.log \
  -e FG_CONFIG_FILE=/config/.flexget/config.yml \
  -e FG_WEBUI_PASSWORD=info `#optional` \
  -p 5050:5050 \
  -v /path/to/flexget/data:/config \
  -v /path/to/downloads:/data `#optional` \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/flexget:latest
```
