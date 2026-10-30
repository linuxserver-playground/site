---
image: "mysql-workbench"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it mysql-workbench /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f mysql-workbench
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' mysql-workbench
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/mysql-workbench:latest
    ```
