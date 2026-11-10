---
image: "kometa"
section: "building-locally"
title: "Building locally"
order: 11
---
If you want to make local modifications to these images for development purposes or just to customize the logic:

```bash
git clone https://github.com/linuxserver-playground/docker-kometa.git
cd docker-kometa
docker build \
  --no-cache \
  --pull \
  -t ghcr.io/linuxserver-playground/kometa:latest .
```

The ARM variants can be built on x86_64 hardware and vice versa using `ghcr.io/linuxserver/qemu-static`

```bash
docker run --rm --privileged ghcr.io/linuxserver/qemu-static --reset
```

Once registered you can define the dockerfile to use with `-f Dockerfile.aarch64`.

Every push builds and tests the image with the shared workflow in [`linuxserver-playground/workflows`](https://github.com/linuxserver-playground/workflows); every build's tests, screenshots and package changes are on [the image's builds](https://linuxserver-playground.github.io/site/images/kometa/#builds) on the website.
