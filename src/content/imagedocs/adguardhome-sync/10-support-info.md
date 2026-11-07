---
image: "adguardhome-sync"
section: "support-info"
title: "Support Info"
order: 10
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it adguardhome-sync /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f adguardhome-sync
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' adguardhome-sync
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/adguardhome-sync:latest
    ```
