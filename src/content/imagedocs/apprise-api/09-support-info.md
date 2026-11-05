---
image: "apprise-api"
section: "support-info"
title: "Support Info"
order: 9
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it apprise-api /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f apprise-api
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' apprise-api
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/apprise-api:latest
    ```
