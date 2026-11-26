---
image: "steam"
section: "parameters"
title: "Parameters"
order: 7
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 3000:3000` | Steam desktop gui HTTP must be proxied. |
| `-p 3001:3001` | Steam desktop gui HTTPS. |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-v /config` | Users home directory in the container, stores all files and games. |
| `--shm-size=` | Recommended for all desktop images. |
| `--security-opt seccomp=unconfined` | This is needed to allow bwrap to use namespacing for games. |
| `--security-opt apparmor=unconfined` | For Debian/Ubuntu hosts Steam needs elevated perms that AppArmor blocks. |
