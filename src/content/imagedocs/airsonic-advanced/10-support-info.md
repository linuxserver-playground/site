---
image: "airsonic-advanced"
section: "support-info"
title: "Support Info"
order: 10
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it airsonic-advanced /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f airsonic-advanced
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' airsonic-advanced
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/airsonic-advanced:latest
    ```
