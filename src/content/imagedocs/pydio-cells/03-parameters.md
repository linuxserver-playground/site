---
image: "pydio-cells"
section: "parameters"
title: "Parameters"
order: 3
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `--hostname=` | Pydio Cells uses the hostname to verify local files. This setting is required and should not be changed after it has been set. |
| `-p 8080:8080` | Http port |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e EXTERNALURL=yourdomain.url` | The external url you would like to use to access Pydio Cells (Can be https://domain.url or https://IP:PORT). |
| `-e SERVER_IP=0.0.0.0` | Enter the LAN IP of the docker server. Required for local access by IP, added to self signed cert as SAN (not required if accessing only through reverse proxy). |
| `-v /config` | All the config files reside here. |
