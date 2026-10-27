---
image: "fail2ban"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it fail2ban /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f fail2ban
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' fail2ban
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/fail2ban:latest
    ```
