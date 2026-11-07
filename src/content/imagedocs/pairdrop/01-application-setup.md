---
image: "pairdrop"
section: "application-setup"
title: "Application Setup"
order: 1
---
Web UI is accessible at http://SERVERIP:PORT. It is strongly recommended to run PairDrop via a reverse proxy, served over HTTPS, if you are making it publicly available. In this configuration you must ensure that the `X-Forwarded-For` header is being set correctly, otherwise all clients will be mutually visible.

Most proxies will set this header automatically but may require additional configuration if you are using something like Cloudflare Proxy.

### Custom STUN/TURN Servers

To specify custom STUN/TURN servers for PairDrop clients to use, create a JSON config file in a mounted path and use the RTC_CONFIG environment variable to point to it.

You can use https://raw.githubusercontent.com/schlagmichdoch/PairDrop/master/rtc_config_example.json as a starting point.

### Note on Websocket fallback

Enabling WS_FALLBACK provides a fallback if the peer to peer WebRTC connection is not available to the client.

This is especially useful if you connect to your instance via a VPN as most VPN services block WebRTC completely in order to hide your real IP address.

*Warning*: All traffic sent between devices using this fallback is routed through the server and therefore not peer to peer! Traffic routed via this fallback is readable by the server and uses the server's bandwidth.
