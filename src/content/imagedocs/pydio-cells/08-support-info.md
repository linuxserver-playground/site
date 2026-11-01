---
image: "pydio-cells"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it pydio-cells /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f pydio-cells
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' pydio-cells
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/pydio-cells:latest
    ```
