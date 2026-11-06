---
branch: "homeassistant-hacs"
---
To enable in Home Assistant, add integration `HACS` in the gui and go through the wizard (need to set up Github Oauth).

## Notes:
- The developer of HACS only supports official Home Assistant installs (Linuxserver image is not official), therefore they will not support this method of installation. Please see here for support info: https://www.linuxserver.io/support
- HACS does not contain add-ons, as add-ons are docker container based and are only supported in Home Assistant OS/Supervised.
