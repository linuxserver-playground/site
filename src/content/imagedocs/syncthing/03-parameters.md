---
image: "syncthing"
section: "parameters"
title: "Parameters"
order: 3
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `--hostname=` | Optionally the hostname can be defined. |
| `-p 8384:8384` | Application WebUI |
| `-p 22000:22000/tcp` | Listening port (TCP) |
| `-p 22000:22000/udp` | Listening port (UDP) |
| `-p 21027:21027/udp` | Protocol discovery |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-v /config` | Configuration files. |
| `-v /data1` | Data1 |
| `-v /data2` | Data2 |
