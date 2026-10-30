---
image: "vscodium-web"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it vscodium-web /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f vscodium-web
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' vscodium-web
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/vscodium-web:latest
    ```
