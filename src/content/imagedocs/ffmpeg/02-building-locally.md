---
image: "ffmpeg"
section: "building-locally"
title: "Building locally"
order: 2
---
If you want to make local modifications to these images for development purposes or just to customize the logic:

```bash
git clone https://github.com/linuxserver/docker-ffmpeg.git
cd docker-ffmpeg
docker build \
  --no-cache \
  --pull \
  -t lscr.io/linuxserver/docker-ffmpeg:latest .
```

The ARM variants can be built on x86_64 hardware using `multiarch/qemu-user-static`

```bash
docker run --rm --privileged multiarch/qemu-user-static:register --reset
```

Once registered you can define the dockerfile to use with `-f Dockerfile.aarch64`.
