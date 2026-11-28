---
image: "kavita"
section: "application-setup"
title: "Application Setup"
order: 1
---
Access the webui at `<your-ip>:5000`. Follow the setup wizard on initial install.

The docker cli and compose yml samples provided list a single `/data` folder for the media, however, you can set up multiple mount points if you wish. For instance, you can set up 3 separate mountpoints named `/manga`, `/comics` and `/books`, each mapped to separate folders on host.
