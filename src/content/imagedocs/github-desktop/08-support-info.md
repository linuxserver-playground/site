---
image: "github-desktop"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it github-desktop /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f github-desktop
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' github-desktop
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/github-desktop:latest
    ```
