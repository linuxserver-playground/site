---
image: "vscodium-web"
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
  vscodium-web:
    image: ghcr.io/linuxserver-playground/vscodium-web:latest
    container_name: vscodium-web
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - CONNECTION_TOKEN= #optional
      - CONNECTION_TOKEN_FILE= #optional
      - SUDO_PASSWORD=password #optional
      - SUDO_PASSWORD_HASH= #optional
      - CODE_ARGS= #optional
    volumes:
      - /path/to/vscodium-web/config:/config
    ports:
      - 8000:8000
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=vscodium-web \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e CONNECTION_TOKEN= `#optional` \
  -e CONNECTION_TOKEN_FILE= `#optional` \
  -e SUDO_PASSWORD=password `#optional` \
  -e SUDO_PASSWORD_HASH= `#optional` \
  -e CODE_ARGS= `#optional` \
  -p 8000:8000 \
  -v /path/to/vscodium-web/config:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/vscodium-web:latest
```
