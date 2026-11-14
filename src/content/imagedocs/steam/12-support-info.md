---
image: "steam"
section: "support-info"
title: "Support Info"
order: 12
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it steam /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f steam
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' steam
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/steam:latest
    ```
