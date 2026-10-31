---
image: "kali-linux"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it kali-linux /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f kali-linux
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' kali-linux
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/kali-linux:latest
    ```
