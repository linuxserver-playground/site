---
image: "intellij-idea"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it intellij-idea /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f intellij-idea
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' intellij-idea
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/intellij-idea:latest
    ```
