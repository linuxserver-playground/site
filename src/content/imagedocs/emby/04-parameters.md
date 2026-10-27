---
image: "emby"
section: "parameters"
title: "Parameters"
order: 4
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 8096:8096` | Http webUI. |
| `-p 8920:8920` | Https webUI (you need to setup your own certificate). |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-v /config` | Emby data storage location. *This can grow very large, 50gb+ is likely for a large collection.* |
| `-v /data/tvshows` | Media goes here. Add as many as needed e.g. `/data/movies`, `/data/tv`, etc. |
| `-v /data/movies` | Media goes here. Add as many as needed e.g. `/data/movies`, `/data/tv`, etc. |
| `-v /opt/vc/lib` | Path for Raspberry Pi OpenMAX libs *optional*. |
| `--device /dev/dri` | Only needed if you want to use your Intel or AMD GPU for hardware accelerated video encoding (vaapi). |
| `--device /dev/video10` | Only needed if you want to use your Raspberry Pi V4L2 video encoding. |
| `--device /dev/video11` | Only needed if you want to use your Raspberry Pi V4L2 video encoding. |
| `--device /dev/video12` | Only needed if you want to use your Raspberry Pi V4L2 video encoding. |
