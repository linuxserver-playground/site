---
image: "wikijs"
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
  wikijs:
    image: ghcr.io/linuxserver-playground/wikijs:latest
    container_name: wikijs
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - DB_TYPE=sqlite #optional
      - DB_HOST= #optional
      - DB_PORT= #optional
      - DB_NAME= #optional
      - DB_USER= #optional
      - DB_PASS= #optional
    volumes:
      - /path/to/wikijs/config:/config
      - /path/to/data:/data
    ports:
      - 3000:3000
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=wikijs \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e DB_TYPE=sqlite `#optional` \
  -e DB_HOST= `#optional` \
  -e DB_PORT= `#optional` \
  -e DB_NAME= `#optional` \
  -e DB_USER= `#optional` \
  -e DB_PASS= `#optional` \
  -p 3000:3000 \
  -v /path/to/wikijs/config:/config \
  -v /path/to/data:/data \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/wikijs:latest
```
