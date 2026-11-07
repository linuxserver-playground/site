---
image: "sealskin"
section: "scripted-installation"
title: "Scripted installation"
order: 4
---
Included in this repository is a helper script to spin up SealSkin with a trusted certificate using Duck DNS. Before using this script please navigate to [https://www.duckdns.org/](https://www.duckdns.org/), log in, make a sub domain, and get your token.

```bash
mkdir sealskin
cd sealskin
bash <(curl -sSL https://raw.githubusercontent.com/linuxserver/docker-sealskin/refs/heads/master/install.sh)
```

This will set up pathing, ownership, the compose file, and a trusted wildcard SSL certificate for Duck DNS.

You can also renew your wildcard SSL certificate by running the same script again in the same directory.

```bash
cd sealskin
bash <(curl -sSL https://raw.githubusercontent.com/linuxserver/docker-sealskin/refs/heads/master/install.sh)
```
