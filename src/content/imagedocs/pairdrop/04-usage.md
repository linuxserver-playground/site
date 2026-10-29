---
image: "pairdrop"
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
  pairdrop:
    image: ghcr.io/linuxserver-playground/pairdrop:latest
    container_name: pairdrop
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - RATE_LIMIT=false #optional
      - WS_FALLBACK=false #optional
      - RTC_CONFIG= #optional
      - DEBUG_MODE=false #optional
    ports:
      - 3000:3000
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=pairdrop \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e RATE_LIMIT=false `#optional` \
  -e WS_FALLBACK=false `#optional` \
  -e RTC_CONFIG= `#optional` \
  -e DEBUG_MODE=false `#optional` \
  -p 3000:3000 \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/pairdrop:latest
```
