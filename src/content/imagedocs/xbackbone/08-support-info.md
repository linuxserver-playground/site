---
image: "xbackbone"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it xbackbone /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f xbackbone
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' xbackbone
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/xbackbone:latest
    ```
