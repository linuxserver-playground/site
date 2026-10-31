---
image: "qbittorrent"
section: "parameters"
title: "Parameters"
order: 6
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 8080:8080` | WebUI |
| `-p 6881:6881` | tcp connection port |
| `-p 6881:6881/udp` | udp connection port |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e WEBUI_PORT=8080` | for changing the port of the web UI, see below for explanation |
| `-e TORRENTING_PORT=6881` | for changing the port of tcp/udp connection, see below for explanation |
| `-v /config` | Contains all relevant configuration files. |
| `-v /downloads` | Location of downloads on disk. |
| `--stop-timeout=` | If you have a large number of torrents you may need to increase the container stop timeout to ensure a clean shutdown. |
| `--read-only=true` | Run container with a read-only filesystem. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/read-only/). |
| `--user=1000:1000` | Run container with a non-root user. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/non-root/). |
