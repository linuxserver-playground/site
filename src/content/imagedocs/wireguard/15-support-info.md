---
image: "wireguard"
section: "support-info"
title: "Support Info"
order: 15
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it wireguard /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f wireguard
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' wireguard
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/wireguard:latest
    ```
