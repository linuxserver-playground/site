---
image: "wireguard"
section: "application-setup"
title: "Application Setup"
order: 1
---
During container start, it will first check if the wireguard module is already installed and loaded. All currently supported kernels should have the wireguard module built-in (along with some older custom kernels). However, the module may not be enabled. Make sure it is enabled prior to starting the container.

This can be run as a server or a client, based on the parameters used.
