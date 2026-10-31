---
image: "kasm"
section: "support-info"
title: "Support Info"
order: 7
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it kasm /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f kasm
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' kasm
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/kasm:latest
    ```
