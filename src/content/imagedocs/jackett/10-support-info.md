---
image: "jackett"
section: "support-info"
title: "Support Info"
order: 10
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it jackett /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f jackett
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' jackett
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/jackett:latest
    ```
