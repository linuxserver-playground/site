---
image: "bitcoin-knots"
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
  bitcoin-knots:
    image: ghcr.io/linuxserver-playground/bitcoin-knots:latest
    container_name: bitcoin-knots
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - /path/to/bitcoin-knots/config:/config
    ports:
      - 3000:3000
      - 3001:3001
      - 8333:8333
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=bitcoin-knots \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -p 3000:3000 \
  -p 3001:3001 \
  -p 8333:8333 \
  -v /path/to/bitcoin-knots/config:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/bitcoin-knots:latest
```
