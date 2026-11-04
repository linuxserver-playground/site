---
image: "wireguard"
section: "client-mode"
title: "Client Mode"
order: 4
---
Do not set the `PEERS` environment variable. Drop your client conf(s) into the config folder as `/config/wg_confs/<tunnel name>.conf` and start the container. If there are multiple tunnel configs, the container will attempt to start them all in alphabetical order. If any one of the tunnels fail, they will all be stopped and the default route will be deleted, requiring user intervention to fix the invalid conf and a container restart.

If you get IPv6 related errors in the log and connection cannot be established, edit the `AllowedIPs` line in your peer/client wg0.conf to include only `0.0.0.0/0` and not `::/0`; and restart the container.
