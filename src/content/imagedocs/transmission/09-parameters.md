---
image: "transmission"
section: "parameters"
title: "Parameters"
order: 9
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 9091:9091` | WebUI |
| `-p 51413:51413` | Torrent Port TCP |
| `-p 51413:51413/udp` | Torrent Port UDP |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e TRANSMISSION_WEB_HOME=` | Specify the path to an alternative UI folder. |
| `-e USER=` | Specify an optional username for the interface |
| `-e PASS=` | Specify an optional password for the interface |
| `-e WHITELIST=` | Specify an optional list of comma separated ip whitelist. Fills rpc-whitelist setting. |
| `-e PEERPORT=` | Specify an optional port for torrent TCP/UDP connections. Fills peer-port setting. |
| `-e HOST_WHITELIST=` | Specify an optional list of comma separated dns name whitelist. Fills rpc-host-whitelist setting. |
| `-v /config` | Where transmission should store config files and logs. |
| `-v /downloads` | Local path for downloads. |
| `-v /watch` | Watch folder for torrent files. |
| `--read-only=true` | Run container with a read-only filesystem. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/read-only/). |
| `--user=1000:1000` | Run container with a non-root user. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/non-root/). |
