---
image: "bitcoin-knots"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it bitcoin-knots /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f bitcoin-knots
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' bitcoin-knots
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/bitcoin-knots:latest
    ```
