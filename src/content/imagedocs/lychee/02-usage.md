---
image: "lychee"
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
  lychee:
    image: ghcr.io/linuxserver-playground/lychee:latest
    container_name: lychee
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - DB_CONNECTION=
      - DB_HOST=
      - DB_PORT=
      - DB_USERNAME=
      - DB_PASSWORD=
      - DB_DATABASE=
      - APP_NAME=Lychee #optional
      - APP_URL= #optional
      - TRUSTED_PROXIES= #optional
    volumes:
      - /path/to/lychee/config:/config
      - /path/to/pictures:/pictures
    ports:
      - 80:80
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=lychee \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e DB_CONNECTION= \
  -e DB_HOST= \
  -e DB_PORT= \
  -e DB_USERNAME= \
  -e DB_PASSWORD= \
  -e DB_DATABASE= \
  -e APP_NAME=Lychee `#optional` \
  -e APP_URL= `#optional` \
  -e TRUSTED_PROXIES= `#optional` \
  -p 80:80 \
  -v /path/to/lychee/config:/config \
  -v /path/to/pictures:/pictures \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/lychee:latest
```
