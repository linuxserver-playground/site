---
image: "cops"
section: "application-setup"
title: "Application Setup"
order: 2
---
Access the webui at `http://<docker host ip>:80`. For connecting via OPDS on a mobile device use `http://<docker host ip>:80/index.php/feed` or `http://<docker host ip>:80/feed`. It is strongly suggested that you reverse proxy this prior to exposing to the internet. For more information, such as requiring credentials, check the COPS Wiki (linked above).

The linuxserver version gives you access to `config/local.php` in `/config` to customise your install to suit your needs, it also includes the dependencies required to directly view epub books in your browser.
