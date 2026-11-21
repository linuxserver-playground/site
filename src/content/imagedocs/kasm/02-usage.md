---
image: "kasm"
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
  kasm:
    image: ghcr.io/linuxserver-playground/kasm:latest
    container_name: kasm
    privileged: true
    security_opt:
      - apparmor:rootlesskit #optional
    environment:
      - KASM_PORT=443
      - DOCKER_HUB_USERNAME=USER #optional
      - DOCKER_HUB_PASSWORD=PASS #optional
      - DOCKER_MTU=1500 #optional
    volumes:
      - /path/to/kasm/data:/opt
      - /path/to/kasm/profiles:/profiles #optional
      - /dev/input:/dev/input #optional
      - /run/udev/data:/run/udev/data #optional
    ports:
      - 3000:3000
      - 443:443
    stop_grace_period: "90s" #optional
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=kasm \
  --privileged \
  --security-opt apparmor=rootlesskit `#optional` \
  -e KASM_PORT=443 \
  -e DOCKER_HUB_USERNAME=USER `#optional` \
  -e DOCKER_HUB_PASSWORD=PASS `#optional` \
  -e DOCKER_MTU=1500 `#optional` \
  -p 3000:3000 \
  -p 443:443 \
  -v /path/to/kasm/data:/opt \
  -v /path/to/kasm/profiles:/profiles `#optional` \
  -v /dev/input:/dev/input `#optional` \
  -v /run/udev/data:/run/udev/data `#optional` \
  --stop-timeout="90s" `#optional` \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/kasm:latest
```
