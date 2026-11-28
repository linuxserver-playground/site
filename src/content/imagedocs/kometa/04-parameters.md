---
image: "kometa"
section: "parameters"
title: "Parameters"
order: 4
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e KOMETA_CONFIG=/config/config.yml` | Specify a custom config file to use. |
| `-e KOMETA_TIMES=03:00` | Comma-separated list of times to update each day. Format: `HH:MM`. |
| `-e KOMETA_RUN=False` | Set to `True` to run without the scheduler. |
| `-e KOMETA_TESTS=False` | Set to `True` to run in debug mode with only collections that have `test: true`. |
| `-e KOMETA_NO_MISSING=False` | Set to `True` to run without any of the missing movie/show functions. |
| `-v /config` | Persistent config files |
