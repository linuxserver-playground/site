---
image: "lychee"
section: "versions"
title: "Versions"
order: 11
---
* **2026-07-05:** - Rebase to Alpine 3.24.
* **2025-07-09:** - Add php84-ldap as dependency.
* **2025-07-09:** - Rebase to Alpine 3.22.
* **2024-12-03:** - Verify build artifacts with cosign.
* **2024-05-27:** - Rebase to Alpine 3.20. Existing users should update their nginx confs to avoid http2 deprecation warnings.
* **2024-01-18:** - Add php-sodium.
* **2024-01-13:** - Rebase to Alpine 3.19 with php 8.3.
* **2023-12-27:** - Update image to support v5.
* **2023-12-25:** - Existing users should update: site-confs/default.conf - Cleanup default site conf. Build npm dependencies into image.
* **2023-05-25:** - Rebase to Alpine 3.18, deprecate armhf.
* **2023-04-13:** - Move ssl.conf include to default.conf.
* **2023-01-11:** - Rebasing to alpine 3.17 with php8.1. Restructure nginx configs ([see changes announcement](https://info.linuxserver.io/issues/2022-08-20-nginx-base)). Switch to git clone as builds fail with the release artifact.
* **2021-05-13:** - Make readme clearer.
* **2021-04-18:** - Add php-intl for v4.3.
* **2021-01-31:** - Add jpegoptim.
* **2021-01-15:** - Rebase to alpine 3.13, add php7-ctype.
* **2020-07-10:** - Upgrade to Lychee v4 and rebased to alpine 3.12.
* **2019-12-19:** - Rebasing to alpine 3.11.
* **2019-10-23:** - Increase fastcgi timeouts (existing users need to manually update).
* **2019-09-19:** - Update project website url.
* **2019-06-28:** - Rebasing to alpine 3.10.
* **2019-05-05:** - Rebase to alpine 3.9, use new armv7 image format.
* **2019-01-25:** - Added ffmpeg for video thumbnail creation, switched to installing zip release instead of source tarball, created small thumbnails folder, switched to dynamic readme.
* **2019-01-14:** - Adding pipeline logic and multi arch..
* **2018-09-04:** - Rebase to alpine 3.8, switch to LycheeOrg repository.
* **2018-01-08:** - Rebase to alpine 3.7.
* **2017-05-25:** - Rebase to alpine 3.6.
* **2017-05-03:** - Use repo pinning to better solve dependencies, use repo version of php7-imagick.
* **2017-02-12:** - Initial Release.
