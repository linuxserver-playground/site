---
image: "diskover"
section: "versions"
title: "Versions"
order: 11
---
* **2024-09-06:** - Rebase to Alpine 3.20. Existing users should update their nginx confs to avoid http2 deprecation warnings.
* **2024-03-06:** - Existing users should update: site-confs/default.conf - Cleanup default site conf.
* **2024-03-06:** - Rebase to Alpine 3.19 with php 8.3.
* **2023-05-25:** - Rebase to Alpine 3.18, deprecate armhf.
* **2023-04-13:** - Move ssl.conf include to default.conf.
* **2023-03-02:** - Set permissions on crontabs during init.
* **2022-08-20:** - Rebasing to alpine 3.17 with php8.1. Restructure nginx configs ([see changes announcement](https://info.linuxserver.io/issues/2022-08-20-nginx-base)).
* **2022-02-25:** - Add php7-sqlite3 to support rc4 release.
* **2021-11-03:** - Added more support for potential config files.
* **2021-10-31:** - Added xpack.security variable to ElasticSearch; added instructions to edit Constants.php in diskover; corrected command needed to manually generate an index in diskover
* **2021-10-11:** - Updated to diskover-community v2.
* **2020-11-19:** - Fix pip packages.
* **2019-12-19:** - Rebasing to alpine 3.11.
* **2019-06-28:** - Rebasing to alpine 3.10.
* **2019-04-12:** - Rebase to Alpine 3.9.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2018-11-01:** - Initial Release.
