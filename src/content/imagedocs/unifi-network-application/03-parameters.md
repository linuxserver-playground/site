---
image: "unifi-network-application"
section: "parameters"
title: "Parameters"
order: 3
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 8443:8443` | Unifi web admin port |
| `-p 3478:3478/udp` | Unifi STUN port |
| `-p 10001:10001/udp` | Required for AP discovery |
| `-p 8080:8080` | Required for device communication |
| `-p 1900:1900/udp` | Required for `Make controller discoverable on L2 network` option |
| `-p 8843:8843` | Unifi guest portal HTTPS redirect port |
| `-p 8880:8880` | Unifi guest portal HTTP redirect port |
| `-p 6789:6789` | For mobile throughput test |
| `-p 5514:5514/udp` | Remote syslog port |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e MONGO_USER=unifi` | Mongodb Username. Only evaluated on first run. **Special characters must be [url encoded](https://en.wikipedia.org/wiki/Percent-encoding)**. |
| `-e MONGO_PASS=` | Mongodb Password. Only evaluated on first run. **Special characters must be [url encoded](https://en.wikipedia.org/wiki/Percent-encoding)**. |
| `-e MONGO_HOST=unifi-db` | Mongodb Hostname. Only evaluated on first run. |
| `-e MONGO_PORT=27017` | Mongodb Port. Only evaluated on first run. |
| `-e MONGO_DBNAME=unifi` | Mongodb Database Name (stats DB is automatically suffixed with `_stat`). Only evaluated on first run. |
| `-e MONGO_AUTHSOURCE=admin` | Mongodb [authSource](https://www.mongodb.com/docs/manual/reference/connection-string/#mongodb-urioption-urioption.authSource). For Atlas set to `admin`. Only evaluated on first run. |
| `-e MEM_LIMIT=1024` | Optionally change the Java memory limit (in Megabytes). Set to `default` to reset to default |
| `-e MEM_STARTUP=1024` | Optionally change the Java initial/minimum memory (in Megabytes). Set to `default` to reset to default |
| `-e MONGO_TLS=` | Mongodb enable [TLS](https://www.mongodb.com/docs/manual/reference/connection-string/#mongodb-urioption-urioption.tls). Only evaluated on first run. |
| `-v /config` | Persistent config files |
