---
image: "speedtest-tracker"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it speedtest-tracker /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f speedtest-tracker
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' speedtest-tracker
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/speedtest-tracker:latest
    ```
