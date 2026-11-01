---
image: "vlc"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it vlc /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f vlc
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' vlc
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/vlc:latest
    ```
