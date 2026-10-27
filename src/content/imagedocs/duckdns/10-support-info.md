---
image: "duckdns"
section: "support-info"
title: "Support Info"
order: 10
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it duckdns /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f duckdns
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' duckdns
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/duckdns:latest
    ```
