---
image: "dosbox-staging"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it dosbox-staging /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f dosbox-staging
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' dosbox-staging
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/dosbox-staging:latest
    ```
