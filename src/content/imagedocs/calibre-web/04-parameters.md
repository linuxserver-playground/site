---
image: "calibre-web"
section: "parameters"
title: "Parameters"
order: 4
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 8083:8083` | WebUI |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e DOCKER_MODS=linuxserver/mods:universal-calibre` | #optional & **x86-64 only** Adds the ability to perform ebook conversion |
| `-e OAUTHLIB_RELAX_TOKEN_SCOPE=1` | Optionally set this to allow Google OAUTH to work |
| `-v /config` | Where calibre-web stores the internal database and config. |
| `-v /books` | Where your preexisting calibre database is located. |
