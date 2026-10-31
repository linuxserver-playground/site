---
image: "ldap-auth"
section: "parameters"
title: "Parameters"
order: 5
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 8888:8888` | the port for ldap auth daemon |
| `-p 9000:9000` | the port for ldap login page |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e FERNETKEY=` | Optionally define a custom valid fernet key (only needed if container is frequently recreated, or if using multi-node setups, invalidating previous authentications) |
| `-e CERTFILE=` | Optionally point this to a certificate file to enable HTTP over SSL (HTTPS) for the ldap auth daemon |
| `-e KEYFILE=` | Optionally point this to the private key file, matching the certificate file referred to in CERTFILE |
| `--read-only=true` | Run container with a read-only filesystem. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/read-only/). |
| `--user=1000:1000` | Run container with a non-root user. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/non-root/). |
