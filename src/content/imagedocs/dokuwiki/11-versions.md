---
image: "dokuwiki"
section: "versions"
title: "Versions"
order: 11
---
* **2026-07-14:** - Rebase to Alpine 3.24, add php-tokenizer.
* **2025-07-05:** - Rebase to Alpine 3.22.
* **2025-05-10:** - Rebase to Alpine 3.21.
* **2024-05-31:** - Rebase to Alpine 3.20. Existing users should update their nginx confs to avoid http2 deprecation warnings.
* **2024-01-23:** - Rebase to Alpine 3.19 with php 8.3.
* **2023-12-25:** - Existing users should update: site-confs/default.conf - Cleanup default site conf.
* **2023-07-21:** - Update built-in plugins on container update.
* **2023-05-25:** - Rebase to Alpine 3.18, deprecate armhf.
* **2023-04-13:** - Move ssl.conf include to default.conf.
* **2022-12-28:** - Rebase to Alpine 3.17, migrate to s6v3.
* **2022-11-13:** - Move lib/images/smileys/local and lib/images/interwiki outside of the container for user defined smiley and interwiki icon support.
* **2022-08-20:** - Rebasing to alpine 3.15 with php8. Restructure nginx configs ([see changes announcement](https://info.linuxserver.io/issues/2022-08-20-nginx-base)).
* **2021-07-20:** - Add php7-dom, fixes minor issues in sprintdoc template.
* **2021-04-15:** - Add `vendor` folder to deny list.
* **2021-02-21:** - Store search index outside of container, set absolute (default) path for `savedir`.
* **2021-01-23:** - Rebasing to alpine 3.13.
* **2020-09-28:** - Add php7-pdo_sqlite and php7-sqlite3.
* **2020-09-23:** - Fix php-local.ini bug introduced in the prior PR.
* **2020-09-14:** - Rebase to alpine 3.12. Add php7-ctype, php7-curl, php7-pdo_mysql, php7-pdo_pgsql, php7-pecl-imagick and php7-iconv. Bump upload max filesize and post max size to 100MB. Remove deprecated APP_URL env var. Fix breaking addons.
* **2019-12-19:** - Rebasing to alpine 3.11.
* **2019-12-01:** - Add php7-ldap package to support LDAP authentication.
* **2019-05-28:** - Initial Release.
