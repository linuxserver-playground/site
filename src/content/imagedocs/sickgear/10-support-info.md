---
image: "sickgear"
section: "support-info"
title: "Support Info"
order: 10
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it sickgear /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f sickgear
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' sickgear
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/sickgear:latest
    ```
