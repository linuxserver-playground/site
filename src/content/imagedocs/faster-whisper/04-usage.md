---
image: "faster-whisper"
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
  faster-whisper:
    image: ghcr.io/linuxserver-playground/faster-whisper:latest
    container_name: faster-whisper
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - DEBUG= #optional
      - LOCAL_ONLY= #optional
      - WHISPER_BEAM=1 #optional
      - WHISPER_LANG=auto #optional
      - WHISPER_MODEL=auto #optional
    volumes:
      - /path/to/faster-whisper/data:/config
    ports:
      - 10300:10300
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=faster-whisper \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e DEBUG= `#optional` \
  -e LOCAL_ONLY= `#optional` \
  -e WHISPER_BEAM=1 `#optional` \
  -e WHISPER_LANG=auto `#optional` \
  -e WHISPER_MODEL=auto `#optional` \
  -p 10300:10300 \
  -v /path/to/faster-whisper/data:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/faster-whisper:latest
```
