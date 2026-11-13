---
image: "sealskin"
section: "upgrading-from-0-3"
title: "Upgrading from 0.3"
order: 7
---
Nothing on disk needs changing, existing users, groups, installed apps, templates and sessions load as before and key files keep working. On the first start after the upgrade the server writes `/config/root_key` for the web app, sign in with it then copy and delete the file. Keep the container name `sealskin` or set `SEALSKIN_NODE_NAME` so the server keeps its identity. Collaboration rooms need application images with a Selkies release after 2.0.0, and NVIDIA hosts need the Container Toolkit v1.20.1 or higher.
