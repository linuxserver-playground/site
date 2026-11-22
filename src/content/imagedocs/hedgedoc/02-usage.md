---
image: "hedgedoc"
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
  hedgedoc:
    image: ghcr.io/linuxserver-playground/hedgedoc:latest
    container_name: hedgedoc
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - "DB_HOST=<hostname or ip>"
      - DB_PORT=3306
      - DB_USER=hedgedoc
      - "DB_PASS=<secret password>"
      - DB_NAME=hedgedoc
      - CMD_DOMAIN=localhost
      - CMD_URL_ADDPORT=false #optional
      - CMD_PROTOCOL_USESSL=false #optional
      - CMD_PORT=3000 #optional
      - CMD_ALLOW_ORIGIN=['localhost'] #optional
      - CMD_DB_DIALECT= #optional
    volumes:
      - /path/to/hedgedoc/config:/config
    ports:
      - 3000:3000
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=hedgedoc \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e DB_HOST="<hostname or ip>" \
  -e DB_PORT=3306 \
  -e DB_USER=hedgedoc \
  -e DB_PASS="<secret password>" \
  -e DB_NAME=hedgedoc \
  -e CMD_DOMAIN=localhost \
  -e CMD_URL_ADDPORT=false `#optional` \
  -e CMD_PROTOCOL_USESSL=false `#optional` \
  -e CMD_PORT=3000 `#optional` \
  -e CMD_ALLOW_ORIGIN=['localhost'] `#optional` \
  -e CMD_DB_DIALECT= `#optional` \
  -p 3000:3000 \
  -v /path/to/hedgedoc/config:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/hedgedoc:latest
```
