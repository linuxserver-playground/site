---
image: "duplicati"
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
  duplicati:
    image: ghcr.io/linuxserver-playground/duplicati:latest
    container_name: duplicati
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - SETTINGS_ENCRYPTION_KEY=
      - CLI_ARGS= #optional
      - DUPLICATI__WEBSERVICE_PASSWORD= #optional
    volumes:
      - /path/to/duplicati/config:/config
      - /path/to/backups:/backups
      - /path/to/source:/source
    ports:
      - 8200:8200
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=duplicati \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e SETTINGS_ENCRYPTION_KEY= \
  -e CLI_ARGS= `#optional` \
  -e DUPLICATI__WEBSERVICE_PASSWORD= `#optional` \
  -p 8200:8200 \
  -v /path/to/duplicati/config:/config \
  -v /path/to/backups:/backups \
  -v /path/to/source:/source \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/duplicati:latest
```
