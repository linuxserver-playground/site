---
image: "steam"
section: "permissions"
title: "Permissions"
order: 2
---
Steam runs its browser helper and every game inside [bubblewrap](https://github.com/containers/bubblewrap), which needs user namespaces. Docker's default seccomp profile (and AppArmor on Debian/Ubuntu hosts) blocks those, so the recommended way to run this container is with `--security-opt seccomp=unconfined` and `--security-opt apparmor=unconfined`, which lets Steam use bubblewrap as intended.

These options are not required, but running without them will degrade performance as userspace proot with ptrace or fakechroot will be used to run games. [proot-bwrap](https://github.com/selkies-project/proot-bwrap)
