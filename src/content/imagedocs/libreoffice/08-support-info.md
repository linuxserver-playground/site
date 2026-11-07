---
image: "libreoffice"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it libreoffice /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f libreoffice
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' libreoffice
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/libreoffice:latest
    ```
