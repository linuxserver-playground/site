---
image: "duckstation"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it duckstation /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f duckstation
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' duckstation
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/duckstation:latest
    ```
