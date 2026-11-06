---
image: "jellyfin"
section: "optional-parameters"
title: "Optional Parameters"
order: 7
---
The [official documentation for ports](https://jellyfin.org/docs/general/networking/index.html) has additional ports that can provide auto discovery.

Service Discovery (`1900/udp`) - Since client auto-discover would break if this option were configurable, you cannot change this in the settings at this time. DLNA also uses this port and is required to be in the local subnet.

Client Discovery (`7359/udp`) - Allows clients to discover Jellyfin on the local network. A broadcast message to this port with "Who is Jellyfin Server?" will get a JSON response that includes the server address, ID, and name.

```
  -p 7359:7359/udp \
  -p 1900:1900/udp \
```

The [official documentation for environmentals](https://jellyfin.org/docs/general/administration/configuration.html) has additional environmentals that can provide additional configurability such as migrating to the native Jellyfin image.
