---
image: "piwigo"
section: "versions"
title: "Versions"
order: 11
---
* **2026-10-21:** - Rebase to Alpine 3.24.
* **2026-01-04:** - Rebase to Alpine 3.22, always update default theme on startup.
* **2025-08-05:** - Revert to Alpine 3.21 due to incorrectly stated upstream support for PHP 8.4.
* **2025-07-27:** - Rebase to Alpine 3.22.
* **2024-05-31:** - Rebase to Alpine 3.20. Existing users should update their nginx confs to avoid http2 deprecation warnings.
* **2024-04-07:** - Increase php workers to fix Android uploading in bulk
* **2024-03-02:** - Fix HEIC file format support.
* **2023-12-23:** - Rebase to Alpine 3.19 with php 8.3.
* **2023-12-12:** - Rebase to Alpine 3.18.
* **2023-06-03:** - Revert to Alpine 3.17 due to compatibility issues with php 8.2.
* **2023-05-25:** - Rebase to Alpine 3.18, deprecate armhf.
* **2023-01-20:** - Rebase to alpine 3.17 with php8.1.
* **2023-01-16:** - Fix broken custom template persistence.
* **2022-11-08:** - Rebase to Alpine 3.16, migrate to s6v3. Move application install to /app/www/public, add migration for existing users. Container updates should now update the application correctly.
* **2022-08-20:** - Rebasing to alpine 3.15 with php8. Restructure nginx configs ([see changes announcement](https://info.linuxserver.io/issues/2022-08-20-nginx-base)).
* **2021-06-29:** - Rebase to 3.14, Add php7-zip package
* **2021-05-20:** - Create separate volume for image data
* **2021-01-23:** - Rebasing to alpine 3.13.
* **2020-12-12:** - Increased upload_max_filesize in php.ini
* **2020-06-01:** - Rebasing to alpine 3.12.
* **2019-12-19:** - Rebasing to alpine 3.11.
* **2019-06-28:** - Rebasing to alpine 3.10.
* **2019-06-12:** - Add ffmpeg and other deps as needed by popular plugins.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2019-03-01:** - Add php-ctype & php-curl.
* **2019-02-22:** - Rebasing to alpine 3.9, add php-ldap.
* **2019-01-28:** - Rebase to alpine linux 3.8 , add pipeline logic and multi arch.
* **2018-01-25:** - Rebase to alpine linux 3.7.
* **2017-05-25:** - Rebase to alpine linux 3.6.
* **2017-05-03:** - Use repo pinning to better solve dependencies, use repo version of php7-imagick.
* **2017-04-20:** - Add php7-exif package, thanks iiska
* **2017-02-23:** - Rebase to alpine linux 3.5 and nginx.
* **2016-10-14:** - Add version layer information.
* **2016-09-10:** - Add layer badges to README.
* **2015-08-29:** - Initial Release.
