---
image: "pydio-cells"
section: "application-setup"
title: "Application Setup"
order: 1
---
You must first create a mysql database for Pydio Cells. Using our [mariadb image](https://hub.docker.com/r/linuxserver/mariadb) is recommended.

Then access the web gui setup wizard at `https://SERVER_IP:8080` if accessing locally (must set `SERVER_IP` env var), or at `https://pydio-cells.domain.com` if reverse proxying.

### Strict reverse proxies

This image uses a self-signed certificate by default. This naturally means the scheme is `https`.
If you are using a reverse proxy which validates certificates, you need to [disable this check for the container](https://linuxserver-playground.github.io/site/docs/faq#strict-proxy).
