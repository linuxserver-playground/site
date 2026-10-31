---
image: "pairdrop"
section: "parameters"
title: "Parameters"
order: 5
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 3000:3000` | http gui |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e RATE_LIMIT=false` | Set to `true` to limit clients to 100 requests per 5 min |
| `-e WS_FALLBACK=false` | Set to `true` to enable websocket fallback if the peer to peer WebRTC connection is not available to the client (see App Setup notes). |
| `-e RTC_CONFIG=` | Path to a json file containing custom STUN/TURN config (see App Setup notes) |
| `-e DEBUG_MODE=false` | Set to `true` to debug the http server configuration by logging clients IP addresses used by PairDrop to STDOUT. [See here for more info](https://github.com/schlagmichdoch/PairDrop/blob/master/docs/host-your-own.md#debug-mode). Do not use in production! |
| `--read-only=true` | Run container with a read-only filesystem. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/read-only/). |
| `--user=1000:1000` | Run container with a non-root user. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/non-root/). |
