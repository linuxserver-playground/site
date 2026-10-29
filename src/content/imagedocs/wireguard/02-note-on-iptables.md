---
image: "wireguard"
section: "note-on-iptables"
title: "Note on iptables"
order: 2
---
Some hosts may not load the iptables kernel modules by default. In order for the container to be able to load them, you need to assign the `SYS_MODULE` capability and add the optional `/lib/modules` volume mount. Alternatively you can `modprobe` them from the host before starting the container.
