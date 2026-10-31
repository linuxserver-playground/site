---
image: "tvheadend"
section: "parameters"
title: "Parameters"
order: 4
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 9981:9981` | WebUI |
| `-p 9982:9982` | HTSP server port. |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e RUN_OPTS=` | Optionally specify additional arguments to be passed. See Additional runtime parameters. |
| `-v /config` | Where TVHeadend show store it's config files. |
| `-v /recordings` | Where you want the PVR to store recordings. |
| `--device /dev/dri` | Only needed if you want to use your AMD/Intel GPU for hardware accelerated video encoding (vaapi). |
| `--device /dev/dvb` | Only needed if you want to pass through a DVB card to the container. If you use IPTV or HDHomeRun you can leave it out. |
