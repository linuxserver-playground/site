---
image: "cops"
section: "versions"
title: "Versions"
order: 12
---
* **2026-07-21:** - Rebase to Alpine 3.24.
* **2026-06-10:** - Existing users should verify: site-confs/default.conf and config/local.php - Update redirect location and use front controller.
* **2026-02-08:** - Existing users should update: site-confs/default.conf - Deny access to all dotfiles.
* **2026-02-08:** - Adding missing php-tokenizer package.
* **2025-10-10:** - Adding missing icu-data-full package.
* **2025-07-10:** - Rebase to Alpine 3.22.
* **2025-05-14:** - Existing users should verify: site-confs/default.conf and config/local.php - Clean-up default site conf and local.php.
* **2024-12-16:** - Rebase to Alpine 3.21.
* **2024-09-24:** - Existing users should verify: site-confs/default.conf - Update rewriting rules default site conf.
* **2024-09-14:** - Ensure user config files have the right permissions.
* **2024-09-09:** - In COPS 3.x, the config_local.php is being moved over to config/local.php and this container will automatically migrate it. Existing users should verify: config_local.php and/or config/local.php - define $config['cops_kepubify_path'] if they want to use it
* **2024-08-28:** - Add kepubify tool to update metadata for Kobo - see mikespub-org/seblucas-cops#77
* **2024-06-24:** - Rebase to Alpine 3.20. Existing users should update their nginx confs to avoid http2 deprecation warnings.
* **2024-05-07:** - Existing users should verify: site-confs/default.conf - Fix rewriting rules default site conf.
* **2024-03-20:** - Rebase to Alpine 3.19.
* **2023-12-25:** - Existing users should update: site-confs/default.conf - Cleanup default site conf.
* **2023-08-11:** - Undeprecate and add new branch with mikespub fork which is actively maintained.
* **2023-05-15:** - Deprecate due to upstream dev abandonment of project.
* **2023-04-13:** - Move ssl.conf include to default.conf.
* **2023-01-19:** - Rebase to alpine 3.17 with php8.1.
* **2022-08-20:** - Rebasing to alpine 3.15 with php8. Restructure nginx configs ([see changes announcement](https://info.linuxserver.io/issues/2022-08-20-nginx-base)).
* **2020-11-22:** - Pin composer version to 1.10.17.
* **2020-06-01:** - Rebasing to alpine 3.12.
* **2019-12-19:** - Rebasing to alpine 3.11.
* **2019-06-28:** - Rebasing to alpine 3.10.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2019-02-27:** - Upgrade packages during install to prevent mismatch with baseimage.
* **2019-02-22:** - Rebasing to alpine 3.9.
* **2019-01-14:** - Add multiarch and pipeline logic.
* **2018-08-21:** - Rebase to alpine 3.8.
* **2018-07-02:** - Add php7-ctype dependency.
* **2018-01-08:** - Rebase to alpine 3.7.
* **2017-05-25:** - Rebase to alpine 3.6.
* **2017-04-03:** - Add composer packages, reduce layers.
* **2017-04-02:** - Updated to version 1.1.0.
* **2017-02-05:** - Updated to Alpine 3.5 & PHP7.
* **2016-10-24:** - Updated to implement user based config.
* **2016-10-24:** - Updated to version 1.0.1.
* **2016-10-14:** - Add version layer information.
* **2016-09-28:** - Add php5-zlib.
* **2016-09-11:** - Add layer badges to README.
* **2016-08-29:** - Add php5-opcache.
* **2016-08-28:** - Add badges to README.
* **2016-08-12:** - Initial Release.
