---
image: "ngircd"
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
  ngircd:
    image: ghcr.io/linuxserver-playground/ngircd:latest
    container_name: ngircd
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
    volumes:
      - /path/to/ngircd/config:/config
    ports:
      - 6667:6667
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=ngircd \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -p 6667:6667 \
  -v /path/to/ngircd/config:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/ngircd:latest
```
