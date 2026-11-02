---
image: "projectsend"
section: "application-setup"
title: "Application Setup"
order: 1
---
Requires a user and database in either mysql or mariadb.

crontab for scheduled tasks should be added to /config/crontabs/abc and the container restarted to enable.

To set PHP options like max upload size please edit /config/php/projectsend.ini

To use translations, follow the instructions [here](https://www.projectsend.org/how-to-use-translation-files/). The necessary paths are symlinked under `/config/translations` (note that the "templates" paths don't need `lang` subdirectories).

More info at [ProjectSend](http://www.projectsend.org).
