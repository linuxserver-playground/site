---
image: "duckdns"
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
  duckdns:
    image: ghcr.io/linuxserver-playground/duckdns:latest
    container_name: duckdns
    network_mode: host #optional
    environment:
      - PUID=1000 #optional
      - PGID=1000 #optional
      - TZ=Etc/UTC #optional
      - SUBDOMAINS=subdomain1,subdomain2
      - TOKEN=token
      - UPDATE_IP=ipv4 #optional
      - LOG_FILE=false #optional
    volumes:
      - /path/to/duckdns/config:/config #optional
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=duckdns \
  --net=host `#optional` \
  -e PUID=1000 `#optional` \
  -e PGID=1000 `#optional` \
  -e TZ=Etc/UTC `#optional` \
  -e SUBDOMAINS=subdomain1,subdomain2 \
  -e TOKEN=token \
  -e UPDATE_IP=ipv4 `#optional` \
  -e LOG_FILE=false `#optional` \
  -v /path/to/duckdns/config:/config `#optional` \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/duckdns:latest
```
