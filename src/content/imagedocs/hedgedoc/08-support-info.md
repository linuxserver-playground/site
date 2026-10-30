---
image: "hedgedoc"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it hedgedoc /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f hedgedoc
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' hedgedoc
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/hedgedoc:latest
    ```
