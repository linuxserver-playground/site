---
image: "modmanager"
section: "application-setup"
title: "Application Setup"
order: 1
---
You can specify mods to download via the `DOCKER_MODS` environment variable like any other container, or allow discovery through docker by mounting the docker socket into the container (or configuring a suitable alternative endpoint via the built-in `DOCKER_HOST` environment variable). Whichever option you choose the appropriate `DOCKER_MODS` environment variable must still be present on the containers that need to install them.

The Modmanager container will download all needed mods on startup and then check for updates every 6 hours; if you're using docker discovery it will automatically pick up any new mods.

You can then mount your `/modcache` path into any other Linuxserver container and they will pull their mods from there rather than downloading them each time.

If a mod requires additional packages to be installed, each container will still need to download them each time it is recreated.

Note that the Modmanager container itself does not support applying mods *or* custom files/services.

**Modmanager is only supported for use with Linuxserver images built after 2025-01-01, while it may work with 3rd party containers using our images as a base we will not provide support for them.**

### Security considerations

Mapping `docker.sock` is a potential security liability because docker has root access on the host and any process that has full access to `docker.sock` would therefore also have root access on the host. The docker API has no built-in way to set limitations on access, however, you can use a proxy for `docker.sock` via a solution like [our docker socket proxy](https://github.com/linuxserver/docker-socket-proxy), which adds the ability to limit API access to specific endpoints.

### Multiple Hosts

>[!NOTE]
>Make sure you fully understand what you're doing before you try and set this up as there are lots of ways it can go wrong if you're just guessing.

Modmanager can query & download mods for remote hosts, as well as the one on which it is installed. At a very basic level if you're just using the `DOCKER_MODS` env and not docker discovery, simply mount the `/modcache` folder on your remote host(s), ensuring it is mapped for all participating containers.

If you are using docker discovery, our only supported means for connecting to remote hosts is [our socket proxy container](https://github.com/linuxserver/docker-socket-proxy/). Run an instance on each remote host:

>[!WARNING]
>DO NOT expose a socket proxy to your LAN if it allows any write operations (`POST=1`, `ALLOW_RESTART=1`, etc) or exposes any API elements that are not absolutely necessary. NEVER expose a socket proxy to your WAN.

```yml
  modmanager-dockerproxy:
    image: lscr.io/linuxserver/socket-proxy:latest
    container_name: modmanager-dockerproxy
    environment:
      - CONTAINERS=1
      - POST=0
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    tmpfs:
      - /run
    ports:
      - 2375:2375
    restart: unless-stopped
    read_only: true
```

And then add it to the `DOCKER_MODS_EXTRA_HOSTS` env using the full protocol and port, separating multiple servers with a pipe (`|`), e.g.

```yaml
  - DOCKER_MODS_EXTRA_HOSTS=tcp://host1.example.com:2375|tcp://host2.example.com:2375|tcp://192.168.0.5:2375
```

As above you will need to mount the `/modcache` folder on your remote host(s), ensuring it is mapped for all participating containers.
