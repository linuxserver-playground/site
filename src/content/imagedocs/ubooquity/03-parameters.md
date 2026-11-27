---
image: "ubooquity"
section: "parameters"
title: "Parameters"
order: 3
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 2202:2202` | The library port. |
| `-p 2203:2203` | The admin port. |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e MAXMEM=` | To set the maximum memory. ( ex: set '1024' for 1GB ) |
| `-v /config` | Config files and database for ubooquity. |
| `-v /books` | Location of books. |
| `-v /comics` | Location of comics. |
| `-v /files` | Location of raw files. |
