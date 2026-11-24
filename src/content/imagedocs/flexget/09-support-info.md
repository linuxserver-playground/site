---
image: "flexget"
section: "support-info"
title: "Support Info"
order: 9
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it flexget /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f flexget
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' flexget
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/flexget:latest
    ```
