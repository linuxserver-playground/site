---
image: "mastodon"
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
  mastodon:
    image: ghcr.io/linuxserver-playground/mastodon:latest
    container_name: mastodon
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - LOCAL_DOMAIN=example.com
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - DB_HOST=db
      - DB_USER=mastodon
      - DB_NAME=mastodon
      - DB_PASS=mastodon
      - DB_PORT=5432
      - ES_ENABLED=false
      - ACTIVE_RECORD_ENCRYPTION_PRIMARY_KEY=
      - ACTIVE_RECORD_ENCRYPTION_DETERMINISTIC_KEY=
      - ACTIVE_RECORD_ENCRYPTION_KEY_DERIVATION_SALT=
      - SECRET_KEY_BASE=
      - OTP_SECRET=
      - VAPID_PRIVATE_KEY=
      - VAPID_PUBLIC_KEY=
      - SMTP_SERVER=mail.example.com
      - SMTP_PORT=25
      - SMTP_LOGIN=
      - SMTP_PASSWORD=
      - SMTP_FROM_ADDRESS=notifications@example.com
      - S3_ENABLED=false
      - WEB_DOMAIN=mastodon.example.com #optional
      - ES_HOST=es #optional
      - ES_PORT=9200 #optional
      - ES_USER=elastic #optional
      - ES_PASS=elastic #optional
      - S3_BUCKET= #optional
      - AWS_ACCESS_KEY_ID= #optional
      - AWS_SECRET_ACCESS_KEY= #optional
      - S3_ALIAS_HOST= #optional
      - SIDEKIQ_ONLY=false #optional
      - SIDEKIQ_QUEUE= #optional
      - SIDEKIQ_DEFAULT=false #optional
      - SIDEKIQ_THREADS=5 #optional
      - DB_POOL=5 #optional
      - NO_CHOWN= #optional
      - MASTODON_PROMETHEUS_EXPORTER_ENABLED= #optional
    volumes:
      - /path/to/mastodon/config:/config
    ports:
      - 80:80
      - 443:443
      - 9394:9394 #optional
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=mastodon \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e LOCAL_DOMAIN=example.com \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  -e DB_HOST=db \
  -e DB_USER=mastodon \
  -e DB_NAME=mastodon \
  -e DB_PASS=mastodon \
  -e DB_PORT=5432 \
  -e ES_ENABLED=false \
  -e ACTIVE_RECORD_ENCRYPTION_PRIMARY_KEY= \
  -e ACTIVE_RECORD_ENCRYPTION_DETERMINISTIC_KEY= \
  -e ACTIVE_RECORD_ENCRYPTION_KEY_DERIVATION_SALT= \
  -e SECRET_KEY_BASE= \
  -e OTP_SECRET= \
  -e VAPID_PRIVATE_KEY= \
  -e VAPID_PUBLIC_KEY= \
  -e SMTP_SERVER=mail.example.com \
  -e SMTP_PORT=25 \
  -e SMTP_LOGIN= \
  -e SMTP_PASSWORD= \
  -e SMTP_FROM_ADDRESS=notifications@example.com \
  -e S3_ENABLED=false \
  -e WEB_DOMAIN=mastodon.example.com `#optional` \
  -e ES_HOST=es `#optional` \
  -e ES_PORT=9200 `#optional` \
  -e ES_USER=elastic `#optional` \
  -e ES_PASS=elastic `#optional` \
  -e S3_BUCKET= `#optional` \
  -e AWS_ACCESS_KEY_ID= `#optional` \
  -e AWS_SECRET_ACCESS_KEY= `#optional` \
  -e S3_ALIAS_HOST= `#optional` \
  -e SIDEKIQ_ONLY=false `#optional` \
  -e SIDEKIQ_QUEUE= `#optional` \
  -e SIDEKIQ_DEFAULT=false `#optional` \
  -e SIDEKIQ_THREADS=5 `#optional` \
  -e DB_POOL=5 `#optional` \
  -e NO_CHOWN= `#optional` \
  -e MASTODON_PROMETHEUS_EXPORTER_ENABLED= `#optional` \
  -p 80:80 \
  -p 443:443 \
  -p 9394:9394 `#optional` \
  -v /path/to/mastodon/config:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/mastodon:latest
```
