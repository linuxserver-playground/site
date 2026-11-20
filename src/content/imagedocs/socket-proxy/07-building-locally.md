---
image: "socket-proxy"
section: "building-locally"
title: "Building locally"
order: 7
---
If you want to make local modifications to these images for development purposes or just to customize the logic:

```bash
git clone https://github.com/linuxserver/docker-socket-proxy.git
cd docker-socket-proxy
docker build \
  --no-cache \
  --pull \
  -t lscr.io/linuxserver/socket-proxy:latest .
```

The ARM variants can be built on x86_64 hardware and vice versa using `lscr.io/linuxserver/docker-qemu-static`

```bash
docker run --rm --privileged lscr.io/linuxserver/docker-qemu-static --reset
```

Once registered you can define the dockerfile to use with `-f Dockerfile.aarch64`.
