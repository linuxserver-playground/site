---
image: "bazarr"
section: "versions"
title: "Versions"
order: 14
---
* **2025-12-28:** - Rebase to Alpine 3.23.
* **2025-07-05:** - Rebase to Alpine 3.22.
* **2024-12-24:** - Rebase to Alpine 3.21.
* **2024-06-24:** - Rebase to Alpine 3.20.
* **2023-12-23:** - Rebase to Alpine 3.19.
* **2023-09-19:** - Install unrar from [linuxserver repo](https://github.com/linuxserver/docker-unrar).
* **2023-08-11:** - Rebase to Alpine 3.18.
* **2023-08-10:** - Bump unrar to 6.2.10.
* **2023-07-04:** - Deprecate armhf. As announced [here](https://www.linuxserver.io/blog/a-farewell-to-arm-hf)
* **2023-02-26:** - Add dependencies for postgres support. Add mediainfo.
* **2023-01-23:** - Rebase master branch to Alpine 3.17.
* **2022-10-11:** - Rebase master branch to Alpine 3.16, migrate to s6v3.
* **2021-11-15:** - Temp fix for lxml, compile from scratch to avoid broken official wheel.
* **2021-10-25:** - Rebase to alpine 3.14. Fix numpy wheel.
* **2021-10-22:** - Added openblas package to prevent numpy error.
* **2021-05-16:** - Use wheel index.
* **2021-04-19:** - Install from release zip.
* **2021-04-07:** - Move app to /app/bazarr/bin, add `package_info`.
* **2021-01-23:** - Rebasing to alpine 3.13.
* **2021-01-23:** - Deprecate `UMASK_SET` in favor of UMASK in baseimage, see above for more information.
* **2020-06-01:** - Rebasing to alpine 3.12.
* **2020-05-13:** - Add donation links for Bazarr to Github sponsors button and container log.
* **2020-04-08:** - Removed /movies and /tv volumes from Dockerfiles.
* **2019-12-28:** - Upgrade to Python 3.
* **2019-12-19:** - Rebasing to alpine 3.11.
* **2019-06-28:** - Rebasing to alpine 3.10.
* **2019-06-13:** - Add env variable for setting umask.
* **2019-06-12:** - Swap to install deps using maintainers requirements.txt, add ffmpeg for ffprobe.
* **2019-04-17:** - Add default UTC timezone if user does not set it.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2019-02-22:** - Rebasing to alpine 3.9.
* **2018-09-11:** - Initial release.
