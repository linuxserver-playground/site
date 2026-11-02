---
image: "apprise-api"
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
  apprise-api:
    image: ghcr.io/linuxserver-playground/apprise-api:latest
    container_name: apprise-api
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - APPRISE_ATTACH_SIZE=0 #optional
    volumes:
      - /path/to/apprise-api/config:/config
      - /path/to/apprise-api/attachments:/attachments #optional
    ports:
      - 8000:8000
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=apprise-api \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e APPRISE_ATTACH_SIZE=0 `#optional` \
  -p 8000:8000 \
  -v /path/to/apprise-api/config:/config \
  -v /path/to/apprise-api/attachments:/attachments `#optional` \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/apprise-api:latest
```
