---
image: "mastodon"
section: "support-info"
title: "Support Info"
order: 9
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it mastodon /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f mastodon
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' mastodon
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/mastodon:latest
    ```
