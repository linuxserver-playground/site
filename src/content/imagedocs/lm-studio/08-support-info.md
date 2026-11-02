---
image: "lm-studio"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it lm-studio /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f lm-studio
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' lm-studio
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/lm-studio:latest
    ```
