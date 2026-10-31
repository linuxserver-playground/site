---
image: "openssh-server"
section: "support-info"
title: "Support Info"
order: 9
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it openssh-server /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f openssh-server
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' openssh-server
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/openssh-server:latest
    ```
