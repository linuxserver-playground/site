---
image: "tvheadend"
section: "support-info"
title: "Support Info"
order: 9
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it tvheadend /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f tvheadend
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' tvheadend
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/tvheadend:latest
    ```
