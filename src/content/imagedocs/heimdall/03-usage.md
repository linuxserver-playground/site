---
image: "heimdall"
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
  heimdall:
    image: ghcr.io/linuxserver-playground/heimdall:latest
    container_name: heimdall
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - ALLOW_INTERNAL_REQUESTS=false #optional
    volumes:
      - /path/to/heimdall/config:/config
    ports:
      - 80:80
      - 443:443
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=heimdall \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e ALLOW_INTERNAL_REQUESTS=false `#optional` \
  -p 80:80 \
  -p 443:443 \
  -v /path/to/heimdall/config:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/heimdall:latest
```
