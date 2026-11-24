---
image: "sabnzbd"
section: "support-info"
title: "Support Info"
order: 11
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it sabnzbd /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f sabnzbd
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' sabnzbd
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/sabnzbd:latest
    ```
