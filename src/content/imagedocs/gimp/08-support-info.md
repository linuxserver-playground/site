---
image: "gimp"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it gimp /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f gimp
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' gimp
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/gimp:latest
    ```
