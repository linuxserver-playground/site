---
image: "rsnapshot"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it rsnapshot /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f rsnapshot
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' rsnapshot
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/rsnapshot:latest
    ```
