---
image: "hedgedoc"
section: "parameters"
title: "Parameters"
order: 3
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 3000:3000` | Web gui port (internal port also needs to be changed if accessing at port other than 80, 443 and 3000). |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e DB_HOST=<hostname or ip>` | Host address of mariadb database |
| `-e DB_PORT=3306` | Port to access mariadb database default is 3306 |
| `-e DB_USER=hedgedoc` | Database user |
| `-e DB_PASS=<secret password>` | Database password |
| `-e DB_NAME=hedgedoc` | Database name |
| `-e CMD_DOMAIN=localhost` | The address the gui will be accessed at (ie. `192.168.1.1` or `hedgedoc.domain.com`). |
| `-e CMD_URL_ADDPORT=false` | Set to `true` if using a port other than `80` or `443`. |
| `-e CMD_PROTOCOL_USESSL=false` | Set to `true` if accessing over https via reverse proxy. |
| `-e CMD_PORT=3000` | If you wish to access hedgedoc at a port different than 80, 443 or 3000, you need to set this to that port (ie. `CMD_PORT=5000`) and change the port mapping accordingly (5000:5000). |
| `-e CMD_ALLOW_ORIGIN=['localhost']` | Comma-separated list of allowed hostnames |
| `-e CMD_DB_DIALECT=` | This variable allows selecting a database engine (if DB_HOST not set up). Available options are: `mariadb`, `mysql`, `postgres`, `sqlite`. |
| `-v /config` | Persistent config files |
