---
image: "librespeed"
section: "parameters"
title: "Parameters"
order: 3
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 80:80` | web gui |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e PASSWORD=PASSWORD` | Set the password for the results database. |
| `-e CUSTOM_RESULTS=false` | (optional) set to `true` to enable custom results page in `/config/www/results/index.php`. |
| `-e DB_TYPE=sqlite` | Defaults to `sqlite`, can also be set to `mysql` or `postgresql`. |
| `-e DB_NAME=DB_NAME` | Database name. Required for mysql and pgsql. |
| `-e DB_HOSTNAME=DB_HOSTNAME` | Database address. Required for mysql and pgsql. |
| `-e DB_USERNAME=DB_USERNAME` | Database username. Required for mysql and pgsql. |
| `-e DB_PASSWORD=DB_PASSWORD` | Database password. Required for mysql and pgsql. |
| `-e DB_PORT=DB_PORT` | Database port. Required for mysql. |
| `-e IPINFO_APIKEY=ACCESS_TOKEN` | Access token from ipinfo.io. Required for detailed IP information. |
| `-v /config` | Persistent config files |
