---
image: "pyload-ng"
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
  pyload-ng:
    image: ghcr.io/linuxserver-playground/pyload-ng:latest
    container_name: pyload-ng
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - /path/to/pyload-ng/config:/config
      - /path/to/downloads:/downloads
    ports:
      - 8000:8000
      - 9666:9666 #optional
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=pyload-ng \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -p 8000:8000 \
  -p 9666:9666 `#optional` \
  -v /path/to/pyload-ng/config:/config \
  -v /path/to/downloads:/downloads \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/pyload-ng:latest
```
