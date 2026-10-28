---
image: "sealskin"
section: "support-info"
title: "Support Info"
order: 14
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it sealskin /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f sealskin
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' sealskin
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/sealskin:latest
    ```
