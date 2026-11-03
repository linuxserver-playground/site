---
image: "craft-apps"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it craft-apps /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f craft-apps
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' craft-apps
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/craft-apps:latest
    ```
