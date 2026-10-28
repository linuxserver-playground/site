---
image: "mullvad-browser"
section: "parameters"
title: "Parameters"
order: 3
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 3000:3000` | Mullvad Browser GUI. |
| `-p 3001:3001` | Mullvad Browser GUI HTTPS. |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e LOCAL_NET=192.168.0.0/16` | If using a VPN, set this to your local LAN IP range using CIDR notation. Without it you will be unable to access the web interface. If you have multiple ranges or a complex LAN setup you will need to manage this yourself in the wg0.conf, see the App Setup section for details. |
| `-v /config` | Users home directory in the container, stores local files and settings |
| `--shm-size=` | This is needed for any modern website to function like youtube. |
| `--cap-add=NET_ADMIN` | Neccessary for Wireguard to create its VPN interface. |

### Portainer notice

This image utilises `cap_add` or `sysctl` to work properly. This is not implemented properly in some versions of Portainer, thus this image may not work if deployed through Portainer.
