---
image: "webtop"
section: "support-info"
title: "Support Info"
order: 9
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it webtop /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f webtop
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' webtop
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/webtop:latest
    ```
