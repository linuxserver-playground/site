---
image: "faster-whisper"
section: "support-info"
title: "Support Info"
order: 10
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it faster-whisper /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f faster-whisper
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' faster-whisper
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/faster-whisper:latest
    ```
