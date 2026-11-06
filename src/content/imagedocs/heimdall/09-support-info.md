---
image: "heimdall"
section: "support-info"
title: "Support Info"
order: 9
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it heimdall /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f heimdall
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' heimdall
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/heimdall:latest
    ```
