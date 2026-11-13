---
image: "ubooquity"
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
  ubooquity:
    image: ghcr.io/linuxserver-playground/ubooquity:latest
    container_name: ubooquity
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - MAXMEM= #optional
    volumes:
      - /path/to/ubooquity/data:/config
      - /path/to/books:/books
      - /path/to/comics:/comics
      - /path/to/raw/files:/files
    ports:
      - 2202:2202
      - 2203:2203
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=ubooquity \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e MAXMEM= `#optional` \
  -p 2202:2202 \
  -p 2203:2203 \
  -v /path/to/ubooquity/data:/config \
  -v /path/to/books:/books \
  -v /path/to/comics:/comics \
  -v /path/to/raw/files:/files \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/ubooquity:latest
```
