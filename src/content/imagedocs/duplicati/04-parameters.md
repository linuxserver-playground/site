---
image: "duplicati"
section: "parameters"
title: "Parameters"
order: 4
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 8200:8200` | http gui |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e SETTINGS_ENCRYPTION_KEY=` | Encryption key for settings database. Minimum 8 characters, alphanumeric. |
| `-e CLI_ARGS=` | Optionally specify any [CLI variables](https://duplicati.readthedocs.io/en/latest/07-other-command-line-utilities/) you want to launch the app with |
| `-e DUPLICATI__WEBSERVICE_PASSWORD=` | Password for the webui. If left unset will default to `changeme` and can be changed from the webui settings. |
| `-v /config` | Contains all relevant configuration files. |
| `-v /backups` | Path to store local backups. |
| `-v /source` | Path to source for files to backup. |
