---
image: "ddclient"
section: "application-setup"
title: "Application Setup"
order: 1
---
Edit the `ddclient.conf` file found in your `/config` volume (also see official [ddclient documentation](https://ddclient.net)). This config file has many providers to choose from and you basically just have to uncomment your provider and add username/password where requested. If you modify ddclient.conf, ddclient will automaticcaly restart and read the config.

### Get dynamic IP from Fritz.Box
If ddclient shall fetch the dynamic (public) IP-address from a fritz.box (AVM) add the following line to `/config/ddclient.conf`:
````
use=cmd, cmd=/etc/ddclient/get-ip-from-fritzbox
````
