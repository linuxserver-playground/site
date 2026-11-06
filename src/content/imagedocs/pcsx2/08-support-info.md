---
image: "pcsx2"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it pcsx2 /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f pcsx2
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' pcsx2
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/pcsx2:latest
    ```
