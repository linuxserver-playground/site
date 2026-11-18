---
image: "xbackbone"
section: "versions"
title: "Versions"
order: 11
---
* **2026-07-05:** - Rebase to Alpine 3.24.
* **2025-07-09:** - Rebase to Alpine 3.22.
* **2024-05-27:** - Rebase to Alpine 3.20. Existing users should update their nginx confs to avoid http2 deprecation warnings.
* **2023-12-28:** - Rebase to Alpine 3.19 with php 8.3.
* **2023-12-25:** - Existing users should update: site-confs/default.conf - Cleanup default site conf.
* **2023-05-25:** - Rebase to Alpine 3.18, deprecate armhf.
* **2023-04-13:** - Move ssl.conf include to default.conf.
* **2023-01-19:** - Rebase to alpine 3.17 with php8.1.
* **2022-11-04:** - Rebase to Alpine 3.16, migrate to s6v3.
* **2022-11-01:** - Move application install to /app/www/public, add migration notices for existing users. Container updates should now update the application correctly
* **2022-08-20:** - Rebasing to alpine 3.15 with php8. Restructure nginx configs ([see changes announcement](https://info.linuxserver.io/issues/2022-08-20-nginx-base)).
* **2022-08-02:** - Added note about updating.
* **2021-06-06:** - Initial Release.
