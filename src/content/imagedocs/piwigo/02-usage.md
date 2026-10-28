---
image: "piwigo"
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
  piwigo:
    image: ghcr.io/linuxserver-playground/piwigo:latest
    container_name: piwigo
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - /path/to/piwigo/config:/config
      - /path/to/appdata/gallery:/gallery
    ports:
      - 80:80
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=piwigo \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -p 80:80 \
  -v /path/to/piwigo/config:/config \
  -v /path/to/appdata/gallery:/gallery \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/piwigo:latest
```
