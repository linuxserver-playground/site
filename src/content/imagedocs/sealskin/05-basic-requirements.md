---
image: "sealskin"
section: "basic-requirements"
title: "Basic Requirements"
order: 5
---
* **The container must be named `sealskin`.** The server inspects its own container to learn the host paths behind `/config` and `/storage`, the externally mapped ports, and the Docker network. The name is also the server's identity in its own records, so a container recreated under another name is another node. If you cannot keep the name, set `hostname: sealskin` or `SEALSKIN_NODE_NAME`.
* **The Docker socket is required.** Every session is a container the server starts through it. If launches fail with a permission error, make the socket group writable on the host with `sudo chmod g+rw /var/run/docker.sock`.
* **`PUID` and `PGID` own everything.** The server, its files and every session container run as that user, so `/config` and `/storage` on the host must be writable by it.
* **Ports.** 8443 carries the web app, the API and the streamed sessions. 8000 is only needed for the Chrome self-signed fallback. 8444 is the peer listener, only publish it to join several servers into a [cluster](https://selkies-project.github.io/sealskin/cluster).

The server can be exposed directly to the internet, its own Caddy instance terminates TLS and authenticates every request to a session. It can also run [behind a reverse proxy](https://selkies-project.github.io/sealskin/reverse-proxy) by setting `SEALSKIN_PUBLIC_URL` and `SEALSKIN_TRUSTED_PROXIES`, plus `SEALSKIN_HTTP_PORT` for a proxy that terminates TLS, with guides for SWAG, Traefik, Nginx Proxy Manager and Caddy. Every environment variable the server reads is listed in the [Settings Reference](https://selkies-project.github.io/sealskin/settings). The same image also runs on [Kubernetes](https://selkies-project.github.io/sealskin/kubernetes) from the upstream manifest, with sessions as pods.

### NVIDIA Support

NVIDIA support requires the proprietary driver 580 or newer (no MIT/GPL kernel modules) with the `nvidia-drm.modeset=1` kernel parameter set, and the NVIDIA Container Toolkit v1.20.1 or higher registered with Docker. The toolkit's refresh service creates the modeset device at boot so headless hosts need nothing more.
