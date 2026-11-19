---
image: "ubooquity"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it ubooquity /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f ubooquity
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ubooquity
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/ubooquity:latest
    ```
