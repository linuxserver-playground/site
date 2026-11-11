---
image: "phpmyadmin"
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
  phpmyadmin:
    image: ghcr.io/linuxserver-playground/phpmyadmin:latest
    container_name: phpmyadmin
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - PMA_ARBITRARY=1 #optional
      - PMA_ABSOLUTE_URI=https://phpmyadmin.example.com #optional
    volumes:
      - /path/to/phpmyadmin/config:/config
    ports:
      - 80:80
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=phpmyadmin \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e PMA_ARBITRARY=1 `#optional` \
  -e PMA_ABSOLUTE_URI=https://phpmyadmin.example.com `#optional` \
  -p 80:80 \
  -v /path/to/phpmyadmin/config:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/phpmyadmin:latest
```
