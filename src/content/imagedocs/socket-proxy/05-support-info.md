---
image: "socket-proxy"
section: "support-info"
title: "Support Info"
order: 5
---
* Shell access whilst the container is running:

```bash
docker exec -it socket-proxy /bin/sh
```

* To monitor the logs of the container in realtime:

```bash
docker logs -f socket-proxy
```

* Container version number:

```bash
docker inspect -f '{{ index .Config.Labels "build_version" }}' socket-proxy
```

* Image version number:

```bash
docker inspect -f '{{ index .Config.Labels "build_version" }}' lscr.io/linuxserver/socket-proxy:latest
```
