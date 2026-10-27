---
image: "xemu"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it xemu /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f xemu
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' xemu
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/xemu:latest
    ```
