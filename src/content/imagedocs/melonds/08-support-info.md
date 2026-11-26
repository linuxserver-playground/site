---
image: "melonds"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it melonds /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f melonds
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' melonds
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/melonds:latest
    ```
