---
image: "jackett"
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
  jackett:
    image: ghcr.io/linuxserver-playground/jackett:latest
    container_name: jackett
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - AUTO_UPDATE=true #optional
      - RUN_OPTS= #optional
    volumes:
      - /path/to/jackett/data:/config
      - /path/to/blackhole:/downloads
    ports:
      - 9117:9117
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=jackett \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e AUTO_UPDATE=true `#optional` \
  -e RUN_OPTS= `#optional` \
  -p 9117:9117 \
  -v /path/to/jackett/data:/config \
  -v /path/to/blackhole:/downloads \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/jackett:latest
```
