---
image: "ungoogled-chromium"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it ungoogled-chromium /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f ungoogled-chromium
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ungoogled-chromium
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/ungoogled-chromium:latest
    ```
