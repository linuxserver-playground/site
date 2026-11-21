---
image: "swag"
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
  swag:
    image: ghcr.io/linuxserver-playground/swag:latest
    container_name: swag
    cap_add:
      - NET_ADMIN
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - URL=example.com
      - VALIDATION=http
      - SUBDOMAINS=www, #optional
      - CERTPROVIDER= #optional
      - CERT_PROFILE= #optional
      - DNSPLUGIN=cloudflare #optional
      - PROPAGATION= #optional
      - EMAIL= #optional
      - ONLY_SUBDOMAINS=false #optional
      - EXTRA_DOMAINS= #optional
      - STAGING=false #optional
      - DISABLE_F2B= #optional
      - SWAG_AUTORELOAD= #optional
      - SWAG_AUTORELOAD_WATCHLIST= #optional
    volumes:
      - /path/to/swag/config:/config
    ports:
      - 443:443
      - 80:80 #optional
      - 443:443/udp #optional
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=swag \
  --cap-add=NET_ADMIN \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e URL=example.com \
  -e VALIDATION=http \
  -e SUBDOMAINS=www, `#optional` \
  -e CERTPROVIDER= `#optional` \
  -e CERT_PROFILE= `#optional` \
  -e DNSPLUGIN=cloudflare `#optional` \
  -e PROPAGATION= `#optional` \
  -e EMAIL= `#optional` \
  -e ONLY_SUBDOMAINS=false `#optional` \
  -e EXTRA_DOMAINS= `#optional` \
  -e STAGING=false `#optional` \
  -e DISABLE_F2B= `#optional` \
  -e SWAG_AUTORELOAD= `#optional` \
  -e SWAG_AUTORELOAD_WATCHLIST= `#optional` \
  -p 443:443 \
  -p 80:80 `#optional` \
  -p 443:443/udp `#optional` \
  -v /path/to/swag/config:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/swag:latest
```
