---
branch: "code-server-julia"
---
**This mod no longer supports arm32v7 due to upstream binaries no longer guaranteed to be available on it per [this post](https://discourse.julialang.org/t/is-the-linux-armv7l-binary-deprecated/85924/2).**

By default, the latest stable version of Julia will be installed. If you'd like to install a different version, you can specify the version as a tag, from a list of published tags: https://hub.docker.com/r/linuxserver/mods/tags?page=1&name=code-server-julia (ie. `DOCKER_MODS=ghcr.io/linuxserver-playground/mods:code-server-julia-1.8.0`).
