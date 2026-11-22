---
image: "plex"
section: "parameters"
title: "Parameters"
order: 5
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `--net=host` | Use Host Networking |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e VERSION=docker` | Set whether to update plex or not - see Application Setup section. |
| `-e PLEX_CLAIM=` | Optionally you can obtain a claim token from https://plex.tv/claim and input here. Keep in mind that the claim tokens expire within 4 minutes. |
| `-v /config` | Plex library location. *This can grow very large, 50gb+ is likely for a large collection.* |
| `-v /tv` | Media goes here. Add as many as needed e.g. `/movies`, `/tv`, etc. |
| `-v /movies` | Media goes here. Add as many as needed e.g. `/movies`, `/tv`, etc. |
| `--read-only=true` | Run container with a read-only filesystem. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/read-only/). |
| `--user=1000:1000` | Run container with a non-root user. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/non-root/). |
