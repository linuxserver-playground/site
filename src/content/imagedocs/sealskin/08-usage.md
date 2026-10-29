---
image: "sealskin"
section: "usage"
title: "Usage"
order: 8
---
To help you get started creating a container from this image you can either use docker-compose or the docker cli.

> [!NOTE]
> Unless a parameter is flagged as 'optional', it is *mandatory* and a value must be provided.

### docker-compose (recommended, [click here for more info](https://linuxserver-playground.github.io/site/docs/general/docker-compose))

```yaml
---
services:
  sealskin:
    image: ghcr.io/linuxserver-playground/sealskin:latest
    container_name: sealskin
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - "HOST_URL=IP or subdomain.domain.com" #optional
    volumes:
      - /path/to/sealskin/config:/config
      - /path/to/sealskin/storage:/storage
      - /var/run/docker.sock:/var/run/docker.sock
    ports:
      - 8443:8443
      - 8000:8000 #optional
      - 8444:8444 #optional
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=sealskin \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e HOST_URL="IP or subdomain.domain.com" `#optional` \
  -p 8443:8443 \
  -p 8000:8000 `#optional` \
  -p 8444:8444 `#optional` \
  -v /path/to/sealskin/config:/config \
  -v /path/to/sealskin/storage:/storage \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/sealskin:latest
```
