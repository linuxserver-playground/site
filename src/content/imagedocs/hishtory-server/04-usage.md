---
image: "hishtory-server"
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
  hishtory-server:
    image: ghcr.io/linuxserver-playground/hishtory-server:latest
    container_name: hishtory-server
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - HISHTORY_POSTGRES_DB=postgresql://${HISHTORY_DB_USER}:${HISHTORY_DB_PASS}@hishtory-db:5432/hishtory?sslmode=disable #optional
      - HISHTORY_SQLITE_DB=/config/hishtory.db #optional
    ports:
      - 8080:8080
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=hishtory-server \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e HISHTORY_POSTGRES_DB=postgresql://${HISHTORY_DB_USER}:${HISHTORY_DB_PASS}@hishtory-db:5432/hishtory?sslmode=disable `#optional` \
  -e HISHTORY_SQLITE_DB=/config/hishtory.db `#optional` \
  -p 8080:8080 \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/hishtory-server:latest
```
