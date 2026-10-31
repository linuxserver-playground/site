---
image: "code-server"
section: "support-info"
title: "Support Info"
order: 10
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it code-server /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f code-server
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' code-server
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/code-server:latest
    ```
