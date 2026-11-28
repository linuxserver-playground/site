---
image: "sealskin"
section: "parameters"
title: "Parameters"
order: 9
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 8443:8443` | HTTPS Sessions and API communication port. |
| `-p 8000:8000` | HTTP fallback API port, only needed by the Chrome extension with a self-signed certificate. |
| `-p 8444:8444` | Peer listener, only needed to join several servers into a cluster. |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e HOST_URL=IP or subdomain.domain.com` | On initial setup this will be used to fill in the default admin configuration file in the `/config` directory, if unset the string HOST_URL will need to be replaced. |
| `-v /config` | All configuration files and metadata for the application. |
| `-v /storage` | All file storage for home directories and ephemeral mounts. |
| `-v /var/run/docker.sock` | Docker socket, required to spin up application containers. |
