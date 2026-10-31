---
image: "vscodium-web"
section: "parameters"
title: "Parameters"
order: 3
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 8000:8000` | Web UI port. |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e CONNECTION_TOKEN=` | Optional security token for accessing the Web UI (ie. `supersecrettoken`). |
| `-e CONNECTION_TOKEN_FILE=` | Optional path to a file inside the container that contains the security token for accessing the Web UI (ie. `/path/to/file`). Overrides `CONNECTION_TOKEN`. |
| `-e SUDO_PASSWORD=password` | If this optional variable is set, user will have sudo access in the vscodium-web terminal with the specified password. |
| `-e SUDO_PASSWORD_HASH=` | Optionally set sudo password via hash (takes priority over `SUDO_PASSWORD` var). Format is `$type$salt$hashed`. |
| `-e CODE_ARGS=` | Optionally add cli parameters to vscodium binary. |
| `-v /config` | Contains all relevant configuration files. |
