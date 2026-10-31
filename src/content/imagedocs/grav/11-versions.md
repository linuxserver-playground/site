---
image: "grav"
section: "versions"
title: "Versions"
order: 11
---
* **2026-06-27:** - Rebase to Alpine 3.24.
* **2025-10-11:** - Add php83-pdo and php83-pdo_sqlite
* **2024-06-19:** - Rebase to Alpine 3.20. Symlink robots.txt to /config. Existing users should update their nginx confs to avoid http2 deprecation warnings.
* **2024-03-06:** - Add brotli to nginx.
* **2024-03-06:** - Existing users should update: site-confs/default.conf - Cleanup default site conf.
* **2023-12-23:** - Rebase to Alpine 3.19 with php 8.3.
* **2023-05-25:** - Rebase to Alpine 3.18, deprecate armhf.
* **2023-05-06:** - Add php-ldap for LDAP support.
* **2023-04-13:** - Move ssl.conf include to default.conf.
* **2022-12-11:** - Rebase to Alpine 3.17, PHP 8.1.
* **2022-09-05:** - All php to read envs passed to container.
* **2022-08-20:** - Rebasing to alpine 3.15 with php8. Restructure nginx configs ([see changes announcement](https://info.linuxserver.io/issues/2022-08-20-nginx-base)).
* **2021-09-03:** - Added support for Redis caching.
* **2021-07-01:** - Rebase to Alpine 3.14.
* **2021-04-09:** - Initial Release.
