---
image: "duckdns"
section: "parameters"
title: "Parameters"
order: 5
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `--net=host` | Use host networking for IPv6 detection |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e SUBDOMAINS=subdomain1,subdomain2` | multiple subdomains allowed, comma separated, no spaces, if your domain is user.duckdns.org you put user, not a sub-subdomain |
| `-e TOKEN=token` | DuckDNS token |
| `-e UPDATE_IP=ipv4` | Set to `ipv6` or `ipv4` to update  **only** your public IPv4/6 address. Set to `both` to update IPv6 and IPv4 address. This variable makes use of a [third-party service](#notice-regarding-automatic-detection). Omitting this variable uses DuckDNS for detection and only supports IPv4. `both` and `ipv6` modes needs [host networking](#networking-net). |
| `-e LOG_FILE=false` | Set to `true` to log to file (also need to map /config). |
| `-v /config` | Persistent config files. Also set `LOG_FILE=true` to keep address history. |
| `--read-only=true` | Run container with a read-only filesystem. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/read-only/). |
