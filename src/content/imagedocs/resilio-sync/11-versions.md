---
image: "resilio-sync"
section: "versions"
title: "Versions"
order: 11
---
* **2024-08-21:** - Rebase to Noble.
* **2023-07-03:** - Deprecate armhf. As announced [here](https://www.linuxserver.io/blog/a-farewell-to-arm-hf)
* **2022-12-14:** - Rebase to Jammy, migrate to s6v3.
* **2021-10-03:** - Use upstream apt repo to install. Rebase to focal.
* **2021-01-20:** - Deprecate `UMASK_SET` in favor of UMASK in baseimage, see above for more information.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2019-02-11:** - Rebase to bionic, add pipeline logic and multi arch.
* **2018-02-05:** - Add downloads volume mount.
* **2018-01-28:** - Add /sync to dir whitelist.
* **2018-01-26:** - Use variable for arch to bring in line with armhf arch repo.
* **2017-12-15:** - Fix continuation lines.
* **2017-06-02:** - Rebase to ubuntu xenial, alpine linux no longer works with resilio.
* **2017-05-22:** - Add variable for user defined umask.
* **2017-05-14:** - Use fixed version instead of latest, while 2.5.0 is broken on non glibc (alpine).
* **2017-02-08:** - Rebase to alpine 3.5.
* **2016-11-02:** - Initial Release.
