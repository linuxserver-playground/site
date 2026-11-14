---
image: "bookstack"
section: "versions"
title: "Versions"
order: 12
---
* **2026-08-05:** - Run the async queue worker as the PUID/PGID-managed abc user.
* **2026-07-05:** - Rebase to Alpine 3.24.
* **2026-04-29:** - Switch to pulling releases from [Codeberg](https://codeberg.org/bookstack/bookstack).
* **2025-12-28:** - Rebase to Alpine 3.23.
* **2025-07-05:** - Rebase to Alpine 3.22.
* **2025-01-04:** - Add php-opcache.
* **2024-12-17:** - Rebase to Alpine 3.21.
* **2024-10-11:** - Default to environment config over .env file config.
* **2024-09-06:** - Add php-exif for reading image EXIF data.
* **2024-05-27:** - Rebase to Alpine 3.20. Existing users should update their nginx confs to avoid http2 deprecation warnings.
* **2024-01-25:** - Existing users should update: site-confs/default.conf - Cleanup default site conf.
* **2023-12-23:** - Rebase to Alpine 3.19 with php 8.3.
* **2023-10-31:** - Further sanitize sed replace.
* **2023-06-07:** - Add mariadb-client for bookstack-system-cli support.
* **2023-05-25:** - Rebase to Alpine 3.18, deprecate armhf.
* **2023-04-13:** - Move ssl.conf include to default.conf.
* **2023-03-01:** - Add php iconv.
* **2023-01-19:** - Rebase to alpine 3.17 with php8.1.
* **2023-01-16:** - Wrap `.env` values in quotes.
* **2023-01-05:** - Fix db password setting (sed escape `&`).
* **2022-12-21:** - Update db info in .env file when env vars are updated.
* **2022-10-10:** - Remove password escape logic which caused problems for a small subset of users.
* **2022-08-20:** - Rebasing to alpine 3.15 with php8. Restructure nginx configs ([see changes announcement](https://info.linuxserver.io/issues/2022-08-20-nginx-base)).
* **2022-03-14:** - Add symlinks for theme support.
* **2021-07-11:** - Rebase to Alpine 3.14.
* **2021-01-12:** - Remove unused requirement, as of release 0.31.0.
* **2020-12-17:** - Make APP_URL var required (upstream changes).
* **2020-09-17:** - Rebase to alpine 3.12. Fix APP_URL setting. Bump php post max and upload max filesizes to 100MB by default.
* **2019-12-19:** - Rebasing to alpine 3.11.
* **2019-07-26:** - Use old version of tidyhtml pending upstream fixes.
* **2019-06-28:** - Rebasing to alpine 3.10.
* **2019-06-14:** - Add wkhtmltopdf to image for PDF rendering.
* **2019-04-20:** - Rebase to Alpine 3.9, add MySQL init logic.
* **2019-03-22:** - Switching to new Base images, shift to arm32v7 tag.
* **2019-01-20:** - Added php7-curl
* **2018-11-04:** - Added php7-ldap
* **2018-10-15:** - Changed functionality for advanced users
* **2018-10-08:** - Advanced mode, symlink changes, sed fixing, docs updated, added some composer files
* **2018-09-23:** - Updates pre-release
* **2018-07-02:** - Initial Release.
