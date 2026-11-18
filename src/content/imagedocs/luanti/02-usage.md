---
image: "luanti"
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
  luanti:
    image: ghcr.io/linuxserver-playground/luanti:latest
    container_name: luanti
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - "CLI_ARGS=--gameid devtest" #optional
    volumes:
      - /path/to/luanti/data:/config/.minetest
    ports:
      - 30000:30000/udp
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=luanti \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e CLI_ARGS="--gameid devtest" `#optional` \
  -p 30000:30000/udp \
  -v /path/to/luanti/data:/config/.minetest \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/luanti:latest
```
