---
image: "socket-proxy"
section: "updating-info"
title: "Updating Info"
order: 6
---
Most of our images are static, versioned, and require an image update and container recreation to update the app inside. With some exceptions (noted in the relevant readme.md), we do not recommend or support updating apps inside the container. Please consult the [Application Setup](#application-setup) section above to see if it is recommended for the image.

Below are the instructions for updating containers:

### Via Docker Compose

* Update images:
  * All images:

  ```bash
  docker compose pull
  ```

  * Single image:

  ```bash
  docker compose pull socket-proxy
  ```

* Update containers:
  * All containers:

  ```bash
  docker compose up -d
  ```

  * Single container:

  ```bash
  docker compose up -d socket-proxy
  ```

* You can also remove the old dangling images:

```bash
docker image prune
```

### Via Docker Run

* Update the image:

```bash
docker pull lscr.io/linuxserver/socket-proxy:latest
```

* Stop the running container:

```bash
docker stop socket-proxy
```

* Delete the container:

```bash
docker rm socket-proxy
```

* You can also remove the old dangling images:

```bash
docker image prune
```

### Image Update Notifications - Diun (Docker Image Update Notifier)

>[!TIP]
>We recommend [Diun](https://crazymax.dev/diun/) for update notifications. Other tools that automatically update containers unattended are not recommended or supported.
