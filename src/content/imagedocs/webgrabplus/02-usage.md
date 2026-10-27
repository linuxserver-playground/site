---
image: "webgrabplus"
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
  webgrabplus:
    image: ghcr.io/linuxserver-playground/webgrabplus:latest
    container_name: webgrabplus
    hostname: webgrabplus
    mac_address: 00:00:00:00:00:00
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - /path/to/webgrabplus/config:/config
      - /path/to/data:/data
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=webgrabplus \
  --hostname=webgrabplus \
  --mac-address=00:00:00:00:00:00 \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -v /path/to/webgrabplus/config:/config \
  -v /path/to/data:/data \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/webgrabplus:latest
```
