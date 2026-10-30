---
image: "freshrss"
section: "application-setup"
title: "Application Setup"
order: 1
---
Access the webui set up wizard at `http://serverIP:port`

For external databases, create a user and database in your mysql/mariadb server (not root) and then follow the setup wizard in the webui. Use the IP address for "host" of your database server.

Additional extensions can be dropped into `/config/www/freshrss/extensions` and will be active after container restart.
