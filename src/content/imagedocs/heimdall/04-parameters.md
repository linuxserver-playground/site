---
image: "heimdall"
section: "parameters"
title: "Parameters"
order: 4
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 80:80` | http gui |
| `-p 443:443` | https gui |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e ALLOW_INTERNAL_REQUESTS=false` | By default, Heimdall blocks lookup requests to private or reserved IP addresses, if your instance is not exposed to the internet, or is behind some level of authentication, you can set this to `true` to allow requests to private IP addresses. |
| `-v /config` | Persistent config files |
