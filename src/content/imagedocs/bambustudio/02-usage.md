---
image: "bambustudio"
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
  bambustudio:
    image: ghcr.io/linuxserver-playground/bambustudio:latest
    container_name: bambustudio
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - DARK_MODE=true #optional
    volumes:
      - /path/to/bambustudio/config:/config
    ports:
      - 3000:3000
      - 3001:3001
    shm_size: "1gb"
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=bambustudio \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e DARK_MODE=true `#optional` \
  -p 3000:3000 \
  -p 3001:3001 \
  -v /path/to/bambustudio/config:/config \
  --shm-size="1gb" \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/bambustudio:latest
```
