---
image: "boinc"
section: "parameters"
title: "Parameters"
order: 3
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 8080:8080` | Boinc desktop gui HTTP (only to be used by reverse proxies and not direct access). |
| `-p 8181:8181` | Boinc desktop gui HTTPS. |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e PASSWORD=` | Optionally set a password for the gui. |
| `-v /config` | Where BOINC should store its database and config. |
| `--device /dev/dri` | Only needed if you want to use your Intel GPU (vaapi). |
| `--shm-size=` | Recommended for all desktop images. |
