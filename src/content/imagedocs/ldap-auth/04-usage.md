---
image: "ldap-auth"
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
  ldap-auth:
    image: ghcr.io/linuxserver-playground/ldap-auth:latest
    container_name: ldap-auth
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - FERNETKEY= #optional
      - CERTFILE= #optional
      - KEYFILE= #optional
    ports:
      - 8888:8888
      - 9000:9000
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=ldap-auth \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e FERNETKEY= `#optional` \
  -e CERTFILE= `#optional` \
  -e KEYFILE= `#optional` \
  -p 8888:8888 \
  -p 9000:9000 \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/ldap-auth:latest
```
