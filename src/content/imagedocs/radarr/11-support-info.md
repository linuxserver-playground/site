---
image: "radarr"
section: "support-info"
title: "Support Info"
order: 11
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it radarr /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f radarr
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' radarr
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/radarr:latest
    ```
