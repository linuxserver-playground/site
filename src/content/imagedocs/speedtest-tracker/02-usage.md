---
image: "speedtest-tracker"
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
  speedtest-tracker:
    image: ghcr.io/linuxserver-playground/speedtest-tracker:latest
    container_name: speedtest-tracker
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - APP_KEY=
      - APP_URL=
      - DB_CONNECTION=sqlite
      - SPEEDTEST_SCHEDULE=
      - SPEEDTEST_SERVERS=
      - DB_HOST= #optional
      - DB_PORT= #optional
      - DB_DATABASE= #optional
      - DB_USERNAME= #optional
      - DB_PASSWORD= #optional
      - DISPLAY_TIMEZONE=Etc/UTC #optional
      - PRUNE_RESULTS_OLDER_THAN=0 #optional
    volumes:
      - /path/to/speedtest-tracker/data:/config
    ports:
      - 80:80
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=speedtest-tracker \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e APP_KEY= \
  -e APP_URL= \
  -e DB_CONNECTION=sqlite \
  -e SPEEDTEST_SCHEDULE= \
  -e SPEEDTEST_SERVERS= \
  -e DB_HOST= `#optional` \
  -e DB_PORT= `#optional` \
  -e DB_DATABASE= `#optional` \
  -e DB_USERNAME= `#optional` \
  -e DB_PASSWORD= `#optional` \
  -e DISPLAY_TIMEZONE=Etc/UTC `#optional` \
  -e PRUNE_RESULTS_OLDER_THAN=0 `#optional` \
  -p 80:80 \
  -v /path/to/speedtest-tracker/data:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/speedtest-tracker:latest
```
