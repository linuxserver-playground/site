---
image: "dokuwiki"
section: "application-setup"
title: "Application Setup"
order: 1
---
Upon first install go to `http://$IP:$PORT/install.php` once you have completed the setup, restart the container, login as admin and set "Use nice URLs" in the `admin/Configuration Settings` panel to `.htaccess` and tick `Use slash as namespace separator in URLs` to enable [nice URLs](https://www.dokuwiki.org/rewrite) you will find the webui at `http://$IP:$PORT/`, for more info see [Dokuwiki](https://www.dokuwiki.org/dokuwiki/)
