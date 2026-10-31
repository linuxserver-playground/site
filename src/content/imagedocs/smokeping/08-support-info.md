---
image: "smokeping"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it smokeping /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f smokeping
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' smokeping
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/smokeping:latest
    ```
