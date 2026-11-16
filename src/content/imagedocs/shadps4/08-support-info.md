---
image: "shadps4"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it shadps4 /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f shadps4
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' shadps4
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/shadps4:latest
    ```
