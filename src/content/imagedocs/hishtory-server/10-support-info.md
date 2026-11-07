---
image: "hishtory-server"
section: "support-info"
title: "Support Info"
order: 10
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it hishtory-server /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f hishtory-server
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' hishtory-server
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/hishtory-server:latest
    ```
