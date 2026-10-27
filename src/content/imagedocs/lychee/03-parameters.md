---
image: "lychee"
section: "parameters"
title: "Parameters"
order: 3
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 80:80` | http gui |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e DB_CONNECTION=` | DB type, from `sqlite`, `mysql`, `pqsql`. |
| `-e DB_HOST=` | DB server hostname. For `mysql` and `pgsql` only. |
| `-e DB_PORT=` | DB server port. For `mysql` and `pgsql` only. |
| `-e DB_USERNAME=` | DB user. For `mysql` and `pgsql` only. |
| `-e DB_PASSWORD=` | DB password. For `mysql` and `pgsql` only. |
| `-e DB_DATABASE=` | Path to DB file for `sqlite`. DB name for `mysql` and `pgsql`. |
| `-e APP_NAME=Lychee` | The gallery name. |
| `-e APP_URL=` | The URL you will use to access Lychee including protocol, and port where appropriate. |
| `-e TRUSTED_PROXIES=` | Set to the IP or netmask covering your reverse proxy, if running behind one. Set to `*` to trust all IPs (**do not** use `*` if exposed to the internet`). |
| `-v /config` | Persistent config files. |
| `-v /pictures` | Where lychee will store uploaded images. |
