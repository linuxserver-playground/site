---
image: "nzbget"
section: "support-info"
title: "Support Info"
order: 11
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it nzbget /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f nzbget
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' nzbget
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/nzbget:latest
    ```
