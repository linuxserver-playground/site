---
image: "smokeping"
section: "versions"
title: "Versions"
order: 11
---
* **2025-12-17:** - Replace busybox traceroute with APK version.
* **2025-09-26:** - Add IO::Socket::INET6 perl module to improve IPv6 abilities.
* **2025-06-05:** - Update TCPPing to 2.7 to fix traceroute incompatibility.
* **2025-06-03:** - Rebase to Alpine 3.22. Update TCPPing. Add curl probe.
* **2024-07-27:** - Add additional dependency packages for InfluxDB.
* **2024-06-25:** - Rebase to Alpine 3.20.
* **2024-04-12:** - Added perl InfluxDB HTTP module for InfluxDB HTTP support.
* **2024-03-22:** - Adding ability to run as a slave.
* **2023-12-23:** - Rebase to Alpine 3.19.
* **2023-11-29:** - Bump tcpping to 1.8.
* **2023-11-21:** - Add support for IRTT Probes.
* **2023-07-23:** - Add Authen::TacacsPlus for Tacacs+ support.
* **2023-05-16:** - Add perl-authen-radius for Radius support.
* **2023-05-16:** - Rebase to Alpine 3.18. Deprecate armhf.
* **2023-05-11:** - Add perl-lwp-protocol-https for master/slave support over https.
* **2023-01-22:** - Revert to using Apache due to latency issues with nginx and fcgiwrap.
* **2022-12-12:** - Rebase to Alpine 3.17, migrate to s6v3, switch to nginx and fcgiwrap.
* **2021-03-29:** - Dockerfile: Install curl before we call it
* **2021-01-23:** - Rebasing to alpine 3.13.
* **2020-06-01:** - Rebasing to alpine 3.12.
* **2019-12-19:** - Rebasing to alpine 3.11.
* **2019-06-28:** - Rebasing to alpine 3.10.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2019-02-22:** - Rebasing to alpine 3.9.
* **2018-11-14:** - Allow access without /smokeping in URL.
* **2018-04-28:** - Rebase to alpine 3.8.
* **2018-04-09:** - Add bc package.
* **2018-04-08:** - Add tccping script and tcptraceroute package (thanks rcarmo).
* **2017-12-13:** - Expose httpd_conf to /config.
* **2017-12-13:** - Rebase to alpine 3.7.
* **2017-07-24:** - Add :unraid tag for hosts without ipv6.
* **2017-07-12:** - Add inspect commands to README, move to jenkins build and push.
* **2017-05-28:** - Rebase to alpine 3.6.
* **2017-05-07:** - Expose smokeping.conf in /config/site-confs to allow user customisations
* **2017-04-12:** - Fix cropper.js path, thanks nibbledeez.
* **2017-02-09:** - Rebase to alpine 3.5.
* **2016-10-17:** - Add ttf-dejavu package as per [LT forum](http://lime-technology.com/forum/index.php?topic=43602.msg507875#msg507875).
* **2016-09-10:** - Add layer badges to README.
* **2016-09-05:** - Add curl package.
* **2016-08-28:** - Add badges to README.
* **2016-07-25:** - Rebase to alpine linux.
* **2016-07-23:** - Fix apt script confusion.
* **2015-06-29:** - This is the first release, it is mostly stable, but may contain minor defects. (thus a beta tag)
