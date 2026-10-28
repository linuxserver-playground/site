---
image: "nginx"
section: "parameters"
title: "Parameters"
order: 4
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 80:80` | http |
| `-p 443:443` | https |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e NGINX_AUTORELOAD=` | Set to `true` to enable automatic reloading of confs on change without stopping/restarting nginx. Your filesystem must support inotify. This functionality was previously offered [via mod](https://github.com/linuxserver/docker-mods/tree/swag-auto-reload). |
| `-e NGINX_AUTORELOAD_WATCHLIST=` | A [pipe](https://en.wikipedia.org/wiki/Vertical_bar)-separated list of additional folders for auto reload to watch in addition to `/config/nginx` |
| `-v /config` | Persistent config files |
| `--read-only=true` | Run container with a read-only filesystem. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/read-only/). |
