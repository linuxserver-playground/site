---
image: "qbittorrent"
section: "support-info"
title: "Support Info"
order: 11
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it qbittorrent /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f qbittorrent
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' qbittorrent
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/qbittorrent:latest
    ```
