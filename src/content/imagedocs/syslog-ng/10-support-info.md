---
image: "syslog-ng"
section: "support-info"
title: "Support Info"
order: 10
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it syslog-ng /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f syslog-ng
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' syslog-ng
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/syslog-ng:latest
    ```
