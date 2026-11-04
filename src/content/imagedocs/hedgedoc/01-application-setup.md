---
image: "hedgedoc"
section: "application-setup"
title: "Application Setup"
order: 1
---
HedgeDoc web interface can be accessed `http://${IP}:3000/`, if you want to use a custom domain or anything besides port 3000 you will need to leverage their env settings for callbacks: (specifically for CMD_DOMAIN, CMD_PORT and CMD_URL_ADDPORT)

[Full list of HedgeDoc options](https://docs.hedgedoc.org/configuration/)

For convenience we provide a working example using Mariadb as a backend in this document.

To run behind a reverse proxy we have a [preconfigured config](https://github.com/linuxserver/reverse-proxy-confs/blob/master/hedgedoc.subdomain.conf.sample) using docker networking included in our [SWAG](https://github.com/linuxserver/docker-swag) image and you can read how to use this in the [Reverse Proxy Confs repository](https://github.com/linuxserver/reverse-proxy-confs/#how-to-use-these-reverse-proxy-configs)
