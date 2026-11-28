---
image: "freshrss"
section: "versions"
title: "Versions"
order: 11
---
* **2026-07-21:** - Rebase to Alpine 3.24.
* **2025-07-27:** - Rebase to Alpine 3.22.
* **2024-06-19:** - Rebase to Alpine 3.20. Existing users should update their nginx confs to avoid http2 deprecation warnings.
* **2024-04-10:** - Added php-exif module to resolve issue with fever api.
* **2024-03-06:** - Existing users should update: site-confs/default.conf - Cleanup default site conf.
* **2023-12-23:** - Rebase to Alpine 3.19 with php 8.3.
* **2023-05-25:** - Rebase to Alpine 3.18, deprecate armhf.
* **2023-04-13:** - Move ssl.conf include to default.conf.
* **2023-03-02:** - Split cron into separate init step and set crontab permissions.
* **2023-01-19:** - Rebase to alpine 3.17 with php8.1.
* **2022-10-21:** - Fix cron init to properly migrate existing installations to new app location.
* **2022-08-20:** - Rebasing to alpine 3.15 with php8. Restructure nginx configs ([see changes announcement](https://info.linuxserver.io/issues/2022-08-20-nginx-base)).
* **2021-01-23:** - Rebasing to alpine 3.13.
* **2020-06-01:** - Rebasing to alpine 3.12.
* **2020-03-31:** - Internalize app and enable updates for existing users, allow user customized crontab.
* **2019-12-19:** - Rebasing to alpine 3.11.
* **2019-06-28:** - Rebasing to alpine 3.10.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2019-02-22:** - Rebasing to alpine 3.9.
* **2019-01-14:** - Add multi arch and pipeline logic.
* **2018-09-05:** - Rebase to alpine linux 3.8.
* **2018-03-17:** - Update nginx config to resolve api not working.
* **2018-01-08:** - Rebase to alpine linux 3.7.
* **2017-05-25:** - Rebase to alpine linux 3.6.
* **2017-02-23:** - Rebase to alpine linux 3.5 and nginx.
* **2016-10-14:** - Add version layer information.
* **2016-10-08:** - Add Sqlite support for standalone operation.
* **2016-09-27:** - Fix for cron job.
* **2016-09-11:** - Add layer badges to README.
* **2015-11-23:** - Update dependencies to latest requirements.
* **2015-08-21:** - Initial Release.
