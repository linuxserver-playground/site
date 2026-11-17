---
image: "flexget"
section: "parameters"
title: "Parameters"
order: 4
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 5050:5050` | HTTP port for the WebUI. |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e FG_LOG_LEVEL=info` | Set the FlexGet logging level. |
| `-e FG_LOG_FILE=/config/flexget.log` | Set the FlexGet log file location. |
| `-e FG_CONFIG_FILE=/config/.flexget/config.yml` | Set the FlexGet config file location. |
| `-e FG_WEBUI_PASSWORD=info` | Set the FlexGet webui password. Pay attention to Bash/YAML reserved characters. |
| `-v /config` | Local path for FlexGet config files. |
| `-v /data` | Default path for downloads. |
| `--read-only=true` | Run container with a read-only filesystem. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/read-only/). |
