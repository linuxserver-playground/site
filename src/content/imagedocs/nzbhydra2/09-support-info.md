---
image: "nzbhydra2"
section: "support-info"
title: "Support Info"
order: 9
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it nzbhydra2 /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f nzbhydra2
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' nzbhydra2
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/nzbhydra2:latest
    ```
