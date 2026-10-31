---
image: "kasm"
section: "parameters"
title: "Parameters"
order: 3
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 3000:3000` | Kasm Installation wizard. (https) |
| `-p 443:443` | Kasm Workspaces interface. (https) |
| `-e KASM_PORT=443` | Specify the port you bind to the outside for Kasm Workspaces. |
| `-e DOCKER_HUB_USERNAME=USER` | Optionally specify a DockerHub Username to pull private images. |
| `-e DOCKER_HUB_PASSWORD=PASS` | Optionally specify a DockerHub password to pull private images. |
| `-e DOCKER_MTU=1500` | Optionally specify the mtu options passed to dockerd. |
| `-v /opt` | Docker and installation storage. |
| `-v /profiles` | Optionally specify a path for persistent profile storage. |
| `-v /dev/input` | Optional for gamepad support. |
| `-v /run/udev/data` | Optional for gamepad support. |
| `--stop-timeout=` | Increase container shutdown delay to give Kasm services time to stop cleanly. |
| `--security-opt apparmor=rootlesskit` | Some hosts require this on top of privileged for namespacing to work properly inside the DinD layer. |
