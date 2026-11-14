---
image: "prowlarr"
section: "support-info"
title: "Support Info"
order: 11
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it prowlarr /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f prowlarr
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' prowlarr
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/prowlarr:latest
    ```
