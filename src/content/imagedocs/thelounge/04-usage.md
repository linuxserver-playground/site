---
image: "thelounge"
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
  thelounge:
    image: ghcr.io/linuxserver-playground/thelounge:latest
    container_name: thelounge
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - /path/to/thelounge/config:/config
    ports:
      - 9000:9000
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=thelounge \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -p 9000:9000 \
  -v /path/to/thelounge/config:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/thelounge:latest
```
