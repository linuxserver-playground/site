---
image: "azahar"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it azahar /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f azahar
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' azahar
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/azahar:latest
    ```
