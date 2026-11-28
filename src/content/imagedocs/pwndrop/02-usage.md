---
image: "pwndrop"
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
  pwndrop:
    image: ghcr.io/linuxserver-playground/pwndrop:latest
    container_name: pwndrop
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - SECRET_PATH=/pwndrop #optional
    volumes:
      - /path/to/pwndrop/appdata:/config
    ports:
      - 8080:8080
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=pwndrop \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e SECRET_PATH=/pwndrop `#optional` \
  -p 8080:8080 \
  -v /path/to/pwndrop/appdata:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/pwndrop:latest
```
