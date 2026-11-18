---
image: "blade-of-agony"
section: "support-info"
title: "Support Info"
order: 9
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it blade-of-agony /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f blade-of-agony
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' blade-of-agony
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/blade-of-agony:latest
    ```
