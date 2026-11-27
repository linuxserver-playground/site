---
image: "planka"
section: "parameters"
title: "Parameters"
order: 5
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 1337:1337` | Planka web UI. |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e BASE_URL=https://planka.example.com` | The URL you will use to access planka including protocol, and port if not 80/443. |
| `-e DATABASE_URL=postgresql://user:password@planka-db:5432/planka` | Postgres database URL. Special characters must be [url encoded](https://en.wikipedia.org/wiki/Percent-encoding). |
| `-e DEFAULT_ADMIN_EMAIL=demo@demo.demo` | Email address for default user. |
| `-e DEFAULT_ADMIN_USERNAME=demo` | Username for default user. |
| `-e DEFAULT_ADMIN_PASSWORD=demo` | Password for default user. |
| `-e DEFAULT_ADMIN_NAME=Demo User` | Display name for default user. |
| `-e SECRET_KEY=notasecretkey` | Session encryption key, recommended 32-64 character alphanumeric. |
| `-e TRUST_PROXY=false` | Set to `true` to trust upstream proxies if reverse proxying. |
| `-e DEFAULT_LANGUAGE=en-US` | This sets the default language for sending notifications per user (if a user hasn't selected a language) and per board. |
| `-v /config` | Local path for planka config files. |
| `--read-only=true` | Run container with a read-only filesystem. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/read-only/). |
| `--user=1000:1000` | Run container with a non-root user. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/non-root/). |
