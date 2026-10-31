---
image: "sabnzbd"
section: "versions"
title: "Versions"
order: 14
---
* **2026-07-04:** - Rebase to Alpine 3.24
* **2025-12-28:** - Rebase to Alpine 3.23. Add RISCV build.
* **2025-07-05:** - Rebase to Alpine 3.22.
* **2024-12-23:** - Rebase to Alpine 3.21.
* **2024-05-31:** - Rebase to Alpine 3.20. Remove nzbnotify as apprise is now included with SABnzbd.
* **2023-12-23:** - Rebase to Alpine 3.19.
* **2023-11-23:** - Build translations.
* **2023-09-13:** - Use par2cmdline-turbo in place of par2cmdline.
* **2023-08-16:** - Install unrar from [linuxserver repo](https://github.com/linuxserver/docker-unrar).
* **2023-08-10:** - Bump unrar to 6.2.10.
* **2023-05-16:** - Rebase stable to Alpine 3.18, deprecate armhf.
* **2023-03-15:** - Switch from p7zip to 7zip, bump unrar to 6.2.6.
* **2023-03-05:** - Rebase master branch to Alpine 3.17.
* **2022-10-03:** - Rebase master branch to Alpine 3.16, migrate to s6v3.
* **2022-08-12:** - Bump unrar to 6.1.7.
* **2022-07-31:** - Add nightly tag.
* **2022-03-10:** - Add nzb-notify.
* **2022-02-22:** - Rebase master branch to Alpine, build unrar from source, deprecate Alpine branch.
* **2022-01-25:** - Rebase Unstable branch to Alpine.
* **2022-01-13:** - Add alpine branch
* **2021-08-08:** - Bump to focal, dont enforce binding to ipv4 port 8080
* **2021-07-24:** - Add python3-setuptools.
* **2021-05-14:** - Use linuxserver.io wheel index for pip packages.
* **2021-02-12:** - Clean up rust/cargo and pip cache.
* **2020-08-17:** - Run from source with python3 instead of ppa, remove python2 completely, symlink `python` to `python3`.
* **2020-01-02:** - Add python3 on top of python2 to image during transition.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2019-02-25:** - Rebase to Bionic, add python deps for scripts.
* **2019-01-26:** - Add pipeline logic and multi arch.
* **2017-12-13:** - Fix continuation lines.
* **2017-07-12:** - Add inspect commands to README, move to jenkins build and push.
* **2017-04-10:** - Bump to 2.0 Release.
* **2017-02-25:** - Switch to nobetas repo for master/latest branch and add unstable branch.
* **2017-02-08:** - Add pythonioenconding=utf8 as env.
* **2016-09-15:** - Compile par2 multicore as per latest info sabnzbd git [readme](https://github.com/sabnzbd/sabnzbd#resolving-dependencies).
* **2016-09-11:** - Bump to release of 1.10.
* **2016-09-09:** - Rebase back to xenial, issues with alpine version of python and 1.10 branch of sab.
* **2016-08-28:** - Rebase to alpine, using git version of sab.
* **2016-03-17:** - Bump to install 1.0 final at startup.
* **2016-03-14:** - Refresh image to pick up latest RC.
* **2016-01-23:** - Refresh image.
* **2015-12-14:** - Refresh image to pick up latest beta.
* **2015-08-21:** - Initial Release.
