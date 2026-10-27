---
image: "rpcs3"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it rpcs3 /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f rpcs3
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' rpcs3
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/rpcs3:latest
    ```
