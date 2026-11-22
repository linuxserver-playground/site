---
image: "wikijs"
section: "parameters"
title: "Parameters"
order: 5
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 3000:3000` | Port for Wiki.js's web interface. |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e DB_TYPE=sqlite` | Set to sqlite (default) or postgres depending on the database engine you wish to use |
| `-e DB_HOST=` | DB hostname (postgres only) |
| `-e DB_PORT=` | DB port (postgres only) |
| `-e DB_NAME=` | DB name (postgres only) |
| `-e DB_USER=` | DB username (postgres only) |
| `-e DB_PASS=` | DB password (postgres only) |
| `-v /config` | Persistent config files |
| `-v /data` | Where Wiki.js data is stored. |
| `--read-only=true` | Run container with a read-only filesystem. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/read-only/). |
| `--user=1000:1000` | Run container with a non-root user. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/non-root/). |
