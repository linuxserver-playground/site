---
image: "healthchecks"
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
  healthchecks:
    image: ghcr.io/linuxserver-playground/healthchecks:latest
    container_name: healthchecks
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - SECRET_KEY=
      - SITE_ROOT=
      - SITE_NAME=
      - SUPERUSER_EMAIL=
      - SUPERUSER_PASSWORD=
      - ALLOWED_HOSTS= #optional
      - APPRISE_ENABLED=False #optional
      - CSRF_TRUSTED_ORIGINS= #optional
      - DEBUG=True #optional
      - DEFAULT_FROM_EMAIL= #optional
      - EMAIL_HOST= #optional
      - EMAIL_PORT= #optional
      - EMAIL_HOST_USER= #optional
      - EMAIL_HOST_PASSWORD= #optional
      - EMAIL_USE_TLS= #optional
      - INTEGRATIONS_ALLOW_PRIVATE_IPS= #optional
      - PING_EMAIL_DOMAIN= #optional
      - RP_ID= #optional
      - SITE_LOGO_URL= #optional
    volumes:
      - /path/to/healthchecks/config:/config
    ports:
      - 8000:8000
      - 2525:2525 #optional
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=healthchecks \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e SECRET_KEY= \
  -e SITE_ROOT= \
  -e SITE_NAME= \
  -e SUPERUSER_EMAIL= \
  -e SUPERUSER_PASSWORD= \
  -e ALLOWED_HOSTS= `#optional` \
  -e APPRISE_ENABLED=False `#optional` \
  -e CSRF_TRUSTED_ORIGINS= `#optional` \
  -e DEBUG=True `#optional` \
  -e DEFAULT_FROM_EMAIL= `#optional` \
  -e EMAIL_HOST= `#optional` \
  -e EMAIL_PORT= `#optional` \
  -e EMAIL_HOST_USER= `#optional` \
  -e EMAIL_HOST_PASSWORD= `#optional` \
  -e EMAIL_USE_TLS= `#optional` \
  -e INTEGRATIONS_ALLOW_PRIVATE_IPS= `#optional` \
  -e PING_EMAIL_DOMAIN= `#optional` \
  -e RP_ID= `#optional` \
  -e SITE_LOGO_URL= `#optional` \
  -p 8000:8000 \
  -p 2525:2525 `#optional` \
  -v /path/to/healthchecks/config:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/healthchecks:latest
```
