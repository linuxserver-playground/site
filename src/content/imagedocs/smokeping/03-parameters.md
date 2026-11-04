---
image: "smokeping"
section: "parameters"
title: "Parameters"
order: 3
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `--hostname=` | In a master-slave architecture, the hostname of the master node is displayed as its name in the web interface, while the hostname of the slave nodes represents their device aliases. These slave hostnames must match the aliases defined in the master's Slaves file. |
| `-p 80:80` | Allows HTTP access to the internal webserver. |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e MASTER_URL=http://<master-host-ip>:80/smokeping/` | Specify the master url to connect to. Used when in slave mode. |
| `-e SHARED_SECRET=password` | Specify the master shared secret for this host. Used when in slave mode. |
| `-e CACHE_DIR=/tmp` | Specify the cache directory for this host. Used when in slave mode. |
| `-v /config` | Persistent config files |
| `-v /data` | Storage location for db and application data (graphs etc) |
