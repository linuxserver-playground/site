---
image: "diskover"
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
  diskover:
    image: ghcr.io/linuxserver-playground/diskover:latest
    container_name: diskover
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - ES_HOST=elasticsearch
      - ES_PORT=9200
    volumes:
      - /path/to/diskover/config:/config
      - /path/to/diskover/data:/data
    ports:
      - 80:80
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=diskover \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e ES_HOST=elasticsearch \
  -e ES_PORT=9200 \
  -p 80:80 \
  -v /path/to/diskover/config:/config \
  -v /path/to/diskover/data:/data \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/diskover:latest
```
