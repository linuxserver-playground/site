---
image: "manyfold"
section: "parameters"
title: "Parameters"
order: 3
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 3214:3214` | Port for web frontend |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e DATABASE_URL=` | Database connection URL. For sqlite use `sqlite3:/config/manyfold.sqlite3`. For postgres or mariadb use `<scheme>://<username>:<password>@<hostname>:<port>/<db name>` where `<scheme>` is `postgresql` or `mysql2`. Special characters in username/password must be [URL encoded](https://en.wikipedia.org/wiki/Percent-encoding). |
| `-e REDIS_URL=` | Redis/Valkey database URL in `redis://<hostname>:<port>/<db number>` format. |
| `-e SECRET_KEY_BASE=` | Browser session and database encryption key. If unset a random one will be generated on init, the database is locked to this key. |
| `-v /config` | Persistent storage for application configuration data. |
| `-v /libraries` | Location of your 3D model libraries. |
