---
image: "heimdall"
section: "versions"
title: "Versions"
order: 12
---
* **2026-07-14:** - Rebase to Alpine 3.24
* **2025-07-20:** - Rebase to Alpine 3.22, enable PHP environment passthrough.
* **2024-06-27:** - Rebase to Alpine 3.20. Existing users should update their nginx confs to avoid http2 deprecation warnings.
* **2024-03-07:** - Enable the opcache and disable file revalidation.
* **2024-03-06:** - Existing users should update: site-confs/default.conf - Cleanup default site conf.
* **2023-12-23:** - Rebase to Alpine 3.19 with php 8.3.
* **2023-05-25:** - Rebase to Alpine 3.18, deprecate armhf.
* **2023-04-13:** - Move ssl.conf include to default.conf.
* **2023-01-20:** - Rebase to alpine 3.17 with php8.1.
* **2022-11-14:** - Rebasing to alpine 3.15 with php8. Restructure nginx configs ([see changes announcement](https://info.linuxserver.io/issues/2022-08-20-nginx-base)).
* **2022-11-04:** - Build commits to upstream branch 2.x for the `development` tag.
* **2021-03-13:** - Make searchproviders.yaml user configurable.
* **2021-02-10:** - Revert to alpine 3.12 as php 7.4 broke laravel.
* **2021-02-10:** - Rebasing to alpine 3.13.
* **2020-08-17:** - Add php7-curl.
* **2020-06-01:** - Rebasing to alpine 3.12.
* **2020-01-17:** - Use nginx from baseimage.
* **2019-12-19:** - Rebasing to alpine 3.11.
* **2019-07-16:** - Save laravel.log to /config/log/heimdall.
* **2019-06-28:** - Rebasing to alpine 3.10.
* **2019-04-01:** - Fix permission detect logic.
* **2019-03-26:** - Install Heimdall during container start to prevent delayed start due to overlayfs bug with recursive chown.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2019-03-15:** - Clarify docker image tags in readme.
* **2019-02-22:** - Rebasing to alpine 3.9.
* **2019-01-16:** - Generate random app key in .env for new installs.
* **2018-11-20:** - Upgrade baseimage packages during build.
* **2018-11-04:** - Add php7-zip.
* **2018-10-31:** - Add queue service.
* **2018-10-17:** - Symlink avatars folder.
* **2018-10-16:** - Updated fastcgi_params for user login support.
* **2018-10-07:** - Symlink `.env` rather than copy. It now resides under `/config/www`
* **2018-09-30:** - Multi-arch image. Move `.env` to `/config`.
* **2018-09-05:** - Rebase to alpine linux 3.8.
* **2018-03-06:** - Use password protection if htpasswd is set. Existing users can delete their default site config at /config/nginx/site-confs/default.conf and restart the container, a new default site config with htpasswd support will be created in its place
* **2018-02-12:** - Initial Release.
