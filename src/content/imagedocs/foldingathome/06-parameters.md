---
image: "foldingathome"
section: "parameters"
title: "Parameters"
order: 6
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 7396:7396` | Folding@home web gui (redirects to [https://app.foldingathome.org](https://app.foldingathome.org)). |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e ACCOUNT_TOKEN=` | Register for an account on `https://app.foldingathome.org` and retrieve account token in settings. Required on first start. |
| `-e MACHINE_NAME=` | Assign a friendly name to this instance (no spaces). Required on first start. |
| `-e CLI_ARGS=` | Optionally pass additional cli arguments to `fah-client` on container start. |
| `-v /config` | Where Folding@home should store its database and config. |
| `--read-only=true` | Run container with a read-only filesystem. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/read-only/). |
