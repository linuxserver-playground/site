---
image: "qemu-static"
section: "usage"
title: "Usage"
order: 1
---
Unlike most of our container library this image is meant to be run ephemerally from the command line to enable the underlying host to run containers built for different architechtures. Changes will not persist a host reboot.

### Enable and reset

```
docker run --rm -it \
  --privileged \
  linuxserver/qemu-static \
  --reset \
  -p yes
```
