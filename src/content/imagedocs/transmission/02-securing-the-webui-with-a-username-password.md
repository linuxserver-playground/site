---
image: "transmission"
section: "securing-the-webui-with-a-username-password"
title: "Securing the webui with a username/password."
order: 2
---
Use the `USER` and `PASS` variables in docker run/create/compose to set authentication. Do not manually edit the `settings.json` to input user/pass, otherwise transmission cannot be stopped cleanly by the s6 supervisor.
