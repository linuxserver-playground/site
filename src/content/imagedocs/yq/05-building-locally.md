---
image: "yq"
section: "building-locally"
title: "Building locally"
order: 5
---
If you want to make local modifications to these images for development purposes or just to customize the logic:

```text
git clone https://github.com/linuxserver/docker-yq.git
cd docker-yq
docker build \
  --no-cache \
  --pull \
  -t linuxserver/yq:latest .
```

The ARM variants can be built on x86_64 hardware and vice versa using `lscr.io/linuxserver/qemu-static`

```bash
docker run --rm --privileged lscr.io/linuxserver/qemu-static --reset
```

Once registered you can define the dockerfile to use with `-f Dockerfile.aarch64`.
