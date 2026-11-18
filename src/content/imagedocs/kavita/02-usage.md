---
image: "kavita"
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
  kavita:
    image: ghcr.io/linuxserver-playground/kavita:latest
    container_name: kavita
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - /path/to/kavita/config:/config
      - /path/to/data:/data #optional
    ports:
      - 5000:5000
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=kavita \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -p 5000:5000 \
  -v /path/to/kavita/config:/config \
  -v /path/to/data:/data `#optional` \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/kavita:latest
```
