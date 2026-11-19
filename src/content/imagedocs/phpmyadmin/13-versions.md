---
image: "phpmyadmin"
section: "versions"
title: "Versions"
order: 13
---
* **2026-07-05:** - Rebase to Alpine 3.24.
* **2025-12-28:** - Rebase to Alpine 3.23.
* **2025-08-23:** - Add support for mTLS. Existing users will need to delete their config.inc.php and restart the container.
* **2025-07-05:** - Rebase to Alpine 3.22.
* **2024-12-19:** - Rebase to Alpine 3.21.
* **2024-05-27:** - Existing users should update their nginx confs to avoid http2 deprecation warnings.
* **2024-05-24:** - Rebase to Alpine 3.20.
* **2023-12-28:** - Rebase to Alpine 3.19 with php 8.3.
* **2023-12-25:** - Existing users should update: site-confs/default.conf - Cleanup default site conf.
* **2023-09-06:** - Add support for custom themes.
* **2023-05-25:** - Rebase to Alpine 3.18, deprecate armhf.
* **2023-04-13:** - Move ssl.conf include to default.conf.
* **2023-01-20:** - Rebase to alpine 3.17 with php8.1.
* **2022-11-18:** - Rebasing to Alpine 3.16, migrate to s6v3.
* **2022-08-20:** - Rebasing to Alpine 3.15 with php8. Restructure nginx configs ([see changes announcement](https://info.linuxserver.io/issues/2022-08-20-nginx-base)).
* **2022-01-23:** - Pin versions to 5.x.x.
* **2021-06-14:** - Initial Release.
