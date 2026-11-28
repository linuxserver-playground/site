---
image: "pydio-cells"
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
  pydio-cells:
    image: ghcr.io/linuxserver-playground/pydio-cells:latest
    container_name: pydio-cells
    hostname: pydio-cells
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - EXTERNALURL=yourdomain.url
      - SERVER_IP=0.0.0.0 #optional
    volumes:
      - /path/to/pydio-cells/config:/config
    ports:
      - 8080:8080
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=pydio-cells \
  --hostname=pydio-cells \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e EXTERNALURL=yourdomain.url \
  -e SERVER_IP=0.0.0.0 `#optional` \
  -p 8080:8080 \
  -v /path/to/pydio-cells/config:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/pydio-cells:latest
```
