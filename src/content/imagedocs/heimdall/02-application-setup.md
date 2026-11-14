---
image: "heimdall"
section: "application-setup"
title: "Application Setup"
order: 2
---
Access the web gui at http://SERVERIP:PORT

### Adding password protection

This image now supports password protection through htpasswd. Run the following command on your host to generate the htpasswd file `docker exec -it heimdall htpasswd -c /config/nginx/.htpasswd <username>`. Replace <username> with a username of your choice and you will be asked to enter a password. Uncomment the `basic auth` lines in `/config/nginx/site-confs/default.conf` and restart the container.
