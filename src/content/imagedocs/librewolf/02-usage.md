---
image: "librewolf"
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
  librewolf:
    image: ghcr.io/linuxserver-playground/librewolf:latest
    container_name: librewolf
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - LIBREWOLF_CLI=https://www.linuxserver.io/ #optional
    volumes:
      - /path/to/librewolf/config:/config
    ports:
      - 3000:3000
      - 3001:3001
    shm_size: "1gb"
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=librewolf \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e LIBREWOLF_CLI=https://www.linuxserver.io/ `#optional` \
  -p 3000:3000 \
  -p 3001:3001 \
  -v /path/to/librewolf/config:/config \
  --shm-size="1gb" \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/librewolf:latest
```
