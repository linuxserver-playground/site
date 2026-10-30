---
image: "modmanager"
section: "parameters"
title: "Parameters"
order: 3
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-e DOCKER_MODS=` | Pipe-delimited (`\|`) list of mods to download |
| `-e DOCKER_HOST=` | Specify the docker endpoint to use if not using the docker.sock |
| `-e DOCKER_MODS_EXTRA_HOSTS=` | Pipe-delimited (`\|`) list of additional hosts to query & download mods for. See app setup section for details. |
| `-v /modcache` | Modmanager mod storage. |
| `-v /var/run/docker.sock:ro` | Mount the host docker socket into the container. |
