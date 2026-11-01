---
image: "synclounge"
section: "support-info"
title: "Support Info"
order: 9
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it synclounge /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f synclounge
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' synclounge
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/synclounge:latest
    ```
