---
image: "pyload-ng"
section: "support-info"
title: "Support Info"
order: 9
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it pyload-ng /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f pyload-ng
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' pyload-ng
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/pyload-ng:latest
    ```
