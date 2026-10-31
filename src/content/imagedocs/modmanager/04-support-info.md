---
image: "modmanager"
section: "support-info"
title: "Support Info"
order: 4
---
* Shell access whilst the container is running:

```bash
docker exec -it modmanager /bin/sh
```

* To monitor the logs of the container in realtime:

```bash
docker logs -f modmanager
```

* Container version number:

```bash
docker inspect -f '{{ index .Config.Labels "build_version" }}' modmanager
```

* Image version number:

```bash
docker inspect -f '{{ index .Config.Labels "build_version" }}' lscr.io/linuxserver/modmanager:latest
```
