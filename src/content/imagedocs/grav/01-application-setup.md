---
image: "grav"
section: "application-setup"
title: "Application Setup"
order: 1
---
For more information check out the [Grav documentation](https://learn.getgrav.org/). Our image includes the [grav-admin](https://github.com/getgrav/grav-plugin-admin) plugin.

To use the CLI tools you need to pass the working directory as part of your exec command (or use an interactive shell), e.g. `docker exec -it -w /app/www/public grav bin/gpm`
