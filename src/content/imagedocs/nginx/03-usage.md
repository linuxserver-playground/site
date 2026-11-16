---
image: "nginx"
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
  nginx:
    image: ghcr.io/linuxserver-playground/nginx:latest
    container_name: nginx
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - NGINX_AUTORELOAD= #optional
      - NGINX_AUTORELOAD_WATCHLIST= #optional
    volumes:
      - /path/to/nginx/config:/config
    ports:
      - 80:80
      - 443:443
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=nginx \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e NGINX_AUTORELOAD= `#optional` \
  -e NGINX_AUTORELOAD_WATCHLIST= `#optional` \
  -p 80:80 \
  -p 443:443 \
  -v /path/to/nginx/config:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/nginx:latest
```
