---
image: "minisatip"
section: "parameters"
title: "Parameters"
order: 3
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 8875:8875` | Status Page WebUI |
| `-p 554:554` | RTSP Port |
| `-p 1900:1900/udp` | App Discovery |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e RUN_OPTS=` | Specify specific run params for minisatip |
| `-v /config` | Configuration files and minisatip data |
| `--device /dev/dvb` | For passing through Tv-cards |
