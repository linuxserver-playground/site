---
image: "airsonic-advanced"
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
  airsonic-advanced:
    image: ghcr.io/linuxserver-playground/airsonic-advanced:latest
    container_name: airsonic-advanced
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - CONTEXT_PATH= #optional
      - JAVA_OPTS= #optional
    volumes:
      - /path/to/airsonic-advanced/config:/config
      - /path/to/music:/music
      - /path/to/playlists:/playlists
      - /path/to/podcasts:/podcasts
      - /path/to/other media:/media #optional
    ports:
      - 4040:4040
    devices:
      - /dev/snd:/dev/snd #optional
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=airsonic-advanced \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e CONTEXT_PATH= `#optional` \
  -e JAVA_OPTS= `#optional` \
  -p 4040:4040 \
  -v /path/to/airsonic-advanced/config:/config \
  -v /path/to/music:/music \
  -v /path/to/playlists:/playlists \
  -v /path/to/podcasts:/podcasts \
  -v /path/to/other media:/media `#optional` \
  --device /dev/snd:/dev/snd `#optional` \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/airsonic-advanced:latest
```
