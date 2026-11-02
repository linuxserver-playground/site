---
image: "fail2ban"
section: "parameters"
title: "Parameters"
order: 3
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `--net=host` | Shares host networking with container. |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e VERBOSITY=-vv` | Set the container log verbosity. Valid options are -v, -vv, -vvv, -vvvv, or leaving the value blank or not setting the variable. |
| `-v /config` | Persistent config files |
| `-v /var/log:ro` | Host logs. Mounted as Read Only. |
| `-v /remotelogs/airsonic:ro` | Optional path to airsonic log folder. Mounted as Read Only. |
| `-v /remotelogs/apache2:ro` | Optional path to apache2 log folder. Mounted as Read Only. |
| `-v /remotelogs/authelia:ro` | Optional path to authelia log folder. Mounted as Read Only. |
| `-v /remotelogs/emby:ro` | Optional path to emby log folder. Mounted as Read Only. |
| `-v /remotelogs/filebrowser:ro` | Optional path to filebrowser log folder. Mounted as Read Only. |
| `-v /remotelogs/homeassistant:ro` | Optional path to homeassistant log folder. Mounted as Read Only. |
| `-v /remotelogs/lighttpd:ro` | Optional path to lighttpd log folder. Mounted as Read Only. |
| `-v /remotelogs/nextcloud:ro` | Optional path to nextcloud log folder. Mounted as Read Only. |
| `-v /remotelogs/nginx:ro` | Optional path to nginx log folder. Mounted as Read Only. |
| `-v /remotelogs/nzbget:ro` | Optional path to nzbget log folder. Mounted as Read Only. |
| `-v /remotelogs/overseerr:ro` | Optional path to overseerr log folder. Mounted as Read Only. |
| `-v /remotelogs/prowlarr:ro` | Optional path to prowlarr log folder. Mounted as Read Only. |
| `-v /remotelogs/radarr:ro` | Optional path to radarr log folder. Mounted as Read Only. |
| `-v /remotelogs/sabnzbd:ro` | Optional path to sabnzbd log folder. Mounted as Read Only. |
| `-v /remotelogs/sonarr:ro` | Optional path to sonarr log folder. Mounted as Read Only. |
| `-v /remotelogs/unificontroller:ro` | Optional path to unificontroller log folder. Mounted as Read Only. |
| `-v /remotelogs/vaultwarden:ro` | Optional path to vaultwarden log folder. Mounted as Read Only. |
| `--cap-add=NET_ADMIN` | Required for fail2ban to be able to modify iptables rules. |
| `--cap-add=NET_RAW` | Required for fail2ban to be able to bind to any interface & use RAW sockets. |

### Portainer notice

This image utilises `cap_add` or `sysctl` to work properly. This is not implemented properly in some versions of Portainer, thus this image may not work if deployed through Portainer.
