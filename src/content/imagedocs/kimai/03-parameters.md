---
image: "kimai"
section: "parameters"
title: "Parameters"
order: 3
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 80:80` | http gui |
| `-p 443:443` | https gui |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e APP_SECRET=` | Random string used for session encryption. Generate using e.g. `openssl rand -hex 32`. |
| `-e DATABASE_URL=mysql://your_db_user:your_db_pass@your_db_host:3306/your_db_name?charset=your_db_charset&serverVersion=your_db_version` | Configure your database connection, see Application Setup instructions. |
| `-e TRUSTED_HOSTS=kimai.example.com` | Domain or IP you will be using to access Kimai. Can be a regex like `localhost|127.0.0.1|kimai.example.com` |
| `-e TRUSTED_PROXIES=127.0.0.1/32` | If behind a reverse proxy set this to its IP or network CIDR so that Kimai trusts its headers. |
| `-v /config` | Persistent config files |
