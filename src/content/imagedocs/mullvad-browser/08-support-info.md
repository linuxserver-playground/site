---
image: "mullvad-browser"
section: "support-info"
title: "Support Info"
order: 8
---
* Shell access whilst the container is running:

    ```bash
    docker exec -it mullvad-browser /bin/bash
    ```

* To monitor the logs of the container in realtime:

    ```bash
    docker logs -f mullvad-browser
    ```

* Container version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' mullvad-browser
    ```

* Image version number:

    ```bash
    docker inspect -f '{{ index .Config.Labels "build_version" }}' ghcr.io/linuxserver-playground/mullvad-browser:latest
    ```
