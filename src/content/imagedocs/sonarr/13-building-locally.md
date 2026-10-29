---
image: "sonarr"
section: "building-locally"
title: "Building locally"
order: 13
---
If you want to make local modifications to these images for development purposes or just to customize the logic:

```bash
git clone https://github.com/linuxserver-playground/docker-sonarr.git
cd docker-sonarr
docker build \
  --no-cache \
  --pull \
  -t ghcr.io/linuxserver-playground/sonarr:latest .
```

The ARM variants can be built on x86_64 hardware and vice versa using `ghcr.io/linuxserver/qemu-static`

```bash
docker run --rm --privileged ghcr.io/linuxserver/qemu-static --reset
```

Once registered you can define the dockerfile to use with `-f Dockerfile.aarch64`.

Every push builds and tests the image with the shared workflow in [`linuxserver-playground/workflows`](https://github.com/linuxserver-playground/workflows); the results for this tag are shown on the [CI status page](https://ci.thelamer.duckdns.org:8443/images/sonarr/latest).
