---
image: "smokeping"
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
  smokeping:
    image: ghcr.io/linuxserver-playground/smokeping:latest
    container_name: smokeping
    hostname: smokeping #optional
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - MASTER_URL=http://<master-host-ip>:80/smokeping/ #optional
      - SHARED_SECRET=password #optional
      - CACHE_DIR=/tmp #optional
    volumes:
      - /path/to/smokeping/config:/config
      - /path/to/smokeping/data:/data
    ports:
      - 80:80
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=smokeping \
  --hostname=smokeping `#optional` \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e MASTER_URL=http://<master-host-ip>:80/smokeping/ `#optional` \
  -e SHARED_SECRET=password `#optional` \
  -e CACHE_DIR=/tmp `#optional` \
  -p 80:80 \
  -v /path/to/smokeping/config:/config \
  -v /path/to/smokeping/data:/data \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/smokeping:latest
```
