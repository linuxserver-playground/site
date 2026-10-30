---
image: "syslog-ng"
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
  syslog-ng:
    image: ghcr.io/linuxserver-playground/syslog-ng:latest
    container_name: syslog-ng
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - LOG_TO_STDOUT= #optional
    volumes:
      - /path/to/syslog-ng/config:/config
      - /path/to/log:/var/log #optional
    ports:
      - 514:5514/udp
      - 601:6601/tcp
      - 6514:6514/tcp
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=syslog-ng \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e LOG_TO_STDOUT= `#optional` \
  -p 514:5514/udp \
  -p 601:6601/tcp \
  -p 6514:6514/tcp \
  -v /path/to/syslog-ng/config:/config \
  -v /path/to/log:/var/log `#optional` \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/syslog-ng:latest
```
