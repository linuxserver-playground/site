---
image: "openshot"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it openshot /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f openshot
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' openshot
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/openshot:latest
    ```
