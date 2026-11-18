---
image: "plex"
section: "optional-parameters"
title: "Optional Parameters"
order: 8
---
If you want to run the container in bridge network mode (instead of the recommended host network mode) you will need to specify ports.
The [official documentation for ports](https://support.plex.tv/articles/201543147-what-network-ports-do-i-need-to-allow-through-my-firewall/) lists 32400 as the only required port.
The rest of the ports are optionally used for specific purposes listed in the documentation.
If you have not already claimed your server (first time setup) you need to set `PLEX_CLAIM` to claim a server set up with bridge networking.

```
  -p 32400:32400 \
  -p 1900:1900/udp \
  -p 5353:5353/udp \
  -p 8324:8324 \
  -p 32410:32410/udp \
  -p 32412:32412/udp \
  -p 32413:32413/udp \
  -p 32414:32414/udp \
  -p 32469:32469

```

The application accepts a series of environment variables to further customize itself on boot:

| Parameter | Function |
| :---: | --- |
| `--device=/dev/dri:/dev/dri` | Add this option to your run command if you plan on using Quicksync hardware acceleration - see Application Setup section.|
| `--device=/dev/dvb:/dev/dvb` | Add this option to your run command if you plan on using dvb devices.|
