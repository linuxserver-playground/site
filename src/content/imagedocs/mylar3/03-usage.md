---
image: "mylar3"
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
  mylar3:
    image: ghcr.io/linuxserver-playground/mylar3:latest
    container_name: mylar3
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - /path/to/mylar3/config:/config
      - /path/to/comics:/comics
      - /path/to/downloads:/downloads
    ports:
      - 8090:8090
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=mylar3 \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -p 8090:8090 \
  -v /path/to/mylar3/config:/config \
  -v /path/to/comics:/comics \
  -v /path/to/downloads:/downloads \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/mylar3:latest
```
