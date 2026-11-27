---
image: "piper"
section: "usage"
title: "Usage"
order: 3
---
To help you get started creating a container from this image you can either use docker-compose or the docker cli.

> [!NOTE]
> Unless a parameter is flagged as 'optional', it is *mandatory* and a value must be provided.

### docker-compose (recommended, [click here for more info](https://linuxserver-playground.github.io/site/docs/general/docker-compose))

```yaml
---
services:
  piper:
    image: ghcr.io/linuxserver-playground/piper:latest
    container_name: piper
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - PIPER_VOICE=en_US-lessac-medium
      - LOCAL_ONLY= #optional
      - PIPER_LENGTH=1.0 #optional
      - PIPER_NOISE=0.667 #optional
      - PIPER_NOISEW=0.333 #optional
      - PIPER_SPEAKER=0 #optional
      - NO_STREAMING= #optional
    volumes:
      - /path/to/piper/data:/config
    ports:
      - 10200:10200
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=piper \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e PIPER_VOICE=en_US-lessac-medium \
  -e LOCAL_ONLY= `#optional` \
  -e PIPER_LENGTH=1.0 `#optional` \
  -e PIPER_NOISE=0.667 `#optional` \
  -e PIPER_NOISEW=0.333 `#optional` \
  -e PIPER_SPEAKER=0 `#optional` \
  -e NO_STREAMING= `#optional` \
  -p 10200:10200 \
  -v /path/to/piper/data:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/piper:latest
```
