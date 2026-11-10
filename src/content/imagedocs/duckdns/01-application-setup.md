---
image: "duckdns"
section: "application-setup"
title: "Application Setup"
order: 1
---
- Go to the [duckdns website](https://duckdns.org/), register your subdomain(s) and retrieve your token.
- Create a container with your subdomain(s) and token. If you own `user.duckdns.org`, you set `SUBDOMAINS=user`. You would NOT set a sub subdomain like `overseerr` from `overseerr.user.ducksdns.org`.
- It will update your IP with the DuckDNS service every 5 minutes (with a random jitter).
