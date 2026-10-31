---
image: "unifi-network-application"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it unifi-network-application /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f unifi-network-application
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' unifi-network-application
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/unifi-network-application:latest
    ```
