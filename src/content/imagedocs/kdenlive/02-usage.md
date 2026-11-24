---
image: "kdenlive"
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
  kdenlive:
    image: ghcr.io/linuxserver-playground/kdenlive:latest
    container_name: kdenlive
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - /path/to/kdenlive/config:/config
    ports:
      - 3000:3000
      - 3001:3001
    shm_size: "1gb" #optional
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=kdenlive \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -p 3000:3000 \
  -p 3001:3001 \
  -v /path/to/kdenlive/config:/config \
  --shm-size="1gb" `#optional` \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/kdenlive:latest
```
