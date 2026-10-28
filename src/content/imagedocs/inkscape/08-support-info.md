---
image: "inkscape"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it inkscape /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f inkscape
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' inkscape
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/inkscape:latest
    ```
