---
image: "scummvm"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it scummvm /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f scummvm
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' scummvm
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/scummvm:latest
    ```
