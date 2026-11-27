---
image: "planka"
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
  planka:
    image: ghcr.io/linuxserver-playground/planka:latest
    container_name: planka
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - BASE_URL=https://planka.example.com
      - DATABASE_URL=postgresql://user:password@planka-db:5432/planka
      - DEFAULT_ADMIN_EMAIL=demo@demo.demo
      - DEFAULT_ADMIN_USERNAME=demo
      - DEFAULT_ADMIN_PASSWORD=demo
      - "DEFAULT_ADMIN_NAME=Demo User"
      - SECRET_KEY=notasecretkey
      - TRUST_PROXY=false
      - DEFAULT_LANGUAGE=en-US #optional
    volumes:
      - /path/to/planka/data:/config
    ports:
      - 1337:1337
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=planka \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e BASE_URL=https://planka.example.com \
  -e DATABASE_URL=postgresql://user:password@planka-db:5432/planka \
  -e DEFAULT_ADMIN_EMAIL=demo@demo.demo \
  -e DEFAULT_ADMIN_USERNAME=demo \
  -e DEFAULT_ADMIN_PASSWORD=demo \
  -e DEFAULT_ADMIN_NAME="Demo User" \
  -e SECRET_KEY=notasecretkey \
  -e TRUST_PROXY=false \
  -e DEFAULT_LANGUAGE=en-US `#optional` \
  -p 1337:1337 \
  -v /path/to/planka/data:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/planka:latest
```
