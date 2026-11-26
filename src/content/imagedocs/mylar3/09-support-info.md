---
image: "mylar3"
section: "support-info"
title: "Support Info"
order: 9
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it mylar3 /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f mylar3
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' mylar3
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/mylar3:latest
    ```
