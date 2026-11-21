---
image: "mariadb"
section: "parameters"
title: "Parameters"
order: 5
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 3306:3306` | MariaDB listens on this port. |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e MYSQL_ROOT_PASSWORD=ROOT_ACCESS_PASSWORD` | Set this to root password for installation (minimum 4 characters & non-alphanumeric passwords must be properly escaped). (valid only for first run) |
| `-e MYSQL_DATABASE=USER_DB_NAME` | Specify the name of a database to be created. (valid only for first run) |
| `-e MYSQL_USER=MYSQL_USER` | This user will have superuser access to the database specified by MYSQL_DATABASE (do not use root here). (valid only for first run) |
| `-e MYSQL_PASSWORD=DATABASE_PASSWORD` | Set this to the password you want to use for you MYSQL_USER (minimum 4 characters & non-alphanumeric passwords must be properly escaped). (valid only for first run) |
| `-e REMOTE_SQL=http://URL1/your.sql,https://URL2/your.sql` | Set this to ingest sql files from an http/https endpoint (comma seperated array). |
| `-e CLI_OPTS=` | Pass CLI options to mariadbd via mariadbd-safe. Use with caution as mariadbd option precedence is complex. |
| `-v /config` | Persistent config files |
| `--read-only=true` | Run container with a read-only filesystem. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/read-only/). |
| `--user=1000:1000` | Run container with a non-root user. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/non-root/). |
