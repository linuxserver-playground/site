---
image: "deluge"
section: "versions"
title: "Versions"
order: 14
---
* **2026-09-27:** - Pin libtorrent to 2.0.13 due to deprecated function. Fix cron for GeoIP updates.
* **2026-04-02:** - Install from pypi due to Alpine geoip package deprecation.
* **2025-12-29:** - Fix some issues with GeoIP updates.
* **2025-08-23:** - Update GeoIP provider, add weekly cronjob to update.
* **2025-01-12:** - Rebase libtorrentv1 branch to Alpine 3.21.
* **2024-09-19:** - Prevent race condition related delay during container stop.
* **2024-08-26:** - Add libtorrentv1 tag.
* **2023-12-26:** - Replace source for GeoIP database.
* **2023-12-07:** - Add optional port 58846 to readme for thin client connectivity.
* **2023-10-07:** - Install unrar from [linuxserver repo](https://github.com/linuxserver/docker-unrar).
* **2023-08-10:** - Bump unrar to 6.2.10.
* **2023-06-30:** - Bump unrar to 6.2.8, deprecate armhf as per [https://www.linuxserver.io/armhf](https://www.linuxserver.io/armhf).
* **2022-11-29:** - Restore geoip using py3-geoip as an interim measure.
* **2022-11-24:** - Remove GeoIP packages as geoip will not build under Py 3.11 and Deluge still doesn't support geoip2.
* **2022-11-22:** - Update GeoIP URL for new IPFS domain.
* **2022-08-29:** - Rebase to Alpine Edge again to follow latest releases.
* **2022-08-12:** - Bump unrar to 6.1.7.
* **2022-06-16:** - Rebase to Alpine 3.16 from edge.
* **2022-02-22:** - Rebase to Alpine, config on first startup, add GeoIP.
* **2022-01-15:** - Rebase to Focal.
* **2021-06-07:** - Remove host networking from readme examples
* **2021-01-23:** - Deprecate `UMASK_SET` in favor of UMASK in baseimage, see above for more information.
* **2020-05-09:** - Add python3 requests and future modules.
* **2019-08-24:** - Add ability to set LogLevel for Deluge.
* **2019-06-09:** - Update to 2.x using deluge ppa.
* **2019-05-02:** - Install full version of 7zip.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2018-11-15:** - Add deluge-console.
* **2018-11-11:** - Rebase to Ubuntu Bionic, add pipeline multiarch logic.
* **2018-04-09:** - update to libressl2.7-libssl.
* **2018-03-29:** - Rebase to alpine edge.
* **2017-12-07:** - Rebase to alpine 3.7.
* **2017-11-20:** - Change libressl2.6-libssl repo.
* **2017-07-01:** - Add curl package.
* **2017-05-26:** - Rebase to alpine 3.6.
* **2017-04-29:** - Add variable for user defined umask.
* **2017-04-28:** - update to libressl2.5-libssl.
* **2016-12-28:** - Rebase to alpine 3.5 baseimage.
* **2016-11-17:** - Rebase to edge baseimage.
* **2016-10-13:** - Switch to libressl as openssl deprecated from alpine linux and deluge dependency no longer installs
* **2016-09-30:** - Fix umask.
* **2016-09-09:** - Add layer badges to README.
* **2016-08-30:** - Use pip packages for some critical dependencies.
* **2016-08-28:** - Add badges to README.
* **2016-08-15:** - Rebase to alpine linux.
* **2015-11-09:** - Add unrar and unzip
* **2015-10-15:** - Initial Release.
