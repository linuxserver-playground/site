---
image: "manyfold"
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
  manyfold:
    image: ghcr.io/linuxserver-playground/manyfold:latest
    container_name: manyfold
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - DATABASE_URL=
      - REDIS_URL=
      - SECRET_KEY_BASE=
    volumes:
      - /path/to/manyfold/config:/config
      - /path/to/libraries:/libraries #optional
    ports:
      - 3214:3214
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=manyfold \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e DATABASE_URL= \
  -e REDIS_URL= \
  -e SECRET_KEY_BASE= \
  -p 3214:3214 \
  -v /path/to/manyfold/config:/config \
  -v /path/to/libraries:/libraries `#optional` \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/manyfold:latest
```
