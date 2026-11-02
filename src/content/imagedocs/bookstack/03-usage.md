---
image: "bookstack"
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
  bookstack:
    image: ghcr.io/linuxserver-playground/bookstack:latest
    container_name: bookstack
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - APP_URL=
      - APP_KEY=
      - DB_HOST=
      - DB_PORT=3306
      - DB_USERNAME=
      - DB_PASSWORD=
      - DB_DATABASE=
      - QUEUE_CONNECTION= #optional
    volumes:
      - /path/to/bookstack/config:/config
    ports:
      - 6875:80
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=bookstack \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e APP_URL= \
  -e APP_KEY= \
  -e DB_HOST= \
  -e DB_PORT=3306 \
  -e DB_USERNAME= \
  -e DB_PASSWORD= \
  -e DB_DATABASE= \
  -e QUEUE_CONNECTION= `#optional` \
  -p 6875:80 \
  -v /path/to/bookstack/config:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/bookstack:latest
```
