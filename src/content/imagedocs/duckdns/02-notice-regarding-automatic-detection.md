---
image: "duckdns"
section: "notice-regarding-automatic-detection"
title: "Notice regarding automatic detection"
order: 2
---
Using the `UPDATE_IP` variable whatever its value (`ipv4`, `ipv6` or `both`) uses external *Cloudflare whoami* service to detect public IP addresses.
**Be aware that using this variable will query a third-party service other than DuckDNS.**

Omitting the `UPDATE_IP` variable uses DuckDNS for detection and only supports IPv4.
