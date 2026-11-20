---
image: "grocy"
section: "versions"
title: "Versions"
order: 11
---
* **2026-10-21:** - Rebase to Alpine 3.24.
* **2026-03-07:** - Rebase to Alpine 3.23 with php 8.5.
* **2025-05-02:** - Rebase to Alpine 3.21. Add php-opcache package.
* **2024-06-30:** - Rebase to Alpine 3.20. Existing users should update their nginx confs to avoid http2 deprecation warnings.
* **2024-03-29:** - Add `clear_env = no` to `php-fpm` to pass on environment variables to workers threads
* **2024-03-06:** - Existing users should update: site-confs/default.conf - Cleanup default site conf.
* **2024-03-06:** - Rebase to Alpine 3.19 with php 8.3.
* **2023-05-25:** - Rebase to Alpine 3.18, deprecate armhf.
* **2023-04-13:** - Move ssl.conf include to default.conf.
* **2023-01-19:** - Rebase to alpine 3.17 with php8.1.
* **2022-08-20:** - Rebasing to alpine 3.15 with php8. Restructure nginx configs ([see changes announcement](https://info.linuxserver.io/issues/2022-08-20-nginx-base)).
* **2021-08-22:** - Rebase to Alpine 3.14 and PHP 8.
* **2021-07-25:** - Add 'int','json' and 'zlib' PHP extensions.
* **2021-05-10:** - Reduce image size.
* **2021-04-08:** - Update docs to reflect jenkins builder changes.
* **2021-02-17:** - Rebasing to alpine 3.13.
* **2021-01-26:** - Add 'ldap' PHP extension.
* **2020-12-22:** - Add 'ctype' PHP extension.
* **2020-06-01:** - Rebasing to alpine 3.12.
* **2019-12-19:** - Rebasing to alpine 3.11.
* **2019-09-22:** - Add 'gd' PHP extension.
* **2019-06-28:** - Rebasing to alpine 3.10.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2019-02-22:** - Rebasing to alpine 3.9.
* **2018-12-27:** - Initial Release.
