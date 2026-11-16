---
image: "mylar3"
section: "versions"
title: "Versions"
order: 12
---
* **2026-04-06:** - Switch upstream to maintained fork at https://github.com/MylarComics/mylar3. Drop `unstable` tag.
* **2026-02-19:** - Rebase `latest` tag based on commits to upstream `python3-dev` branch. `nightly` will build commits to upstream `1000papercuts` branch. `unstable` tag will also build commits to upstream `1000papercuts` branch, but on alpine 3.23 with python 3.12.
* **2026-02-05:** - Release `unstable` tag based on commits to upstream `1000papercuts` branch.
* **2025-11-21:** - Rebase to Ubuntu Jammy.
* **2023-12-23:** - Rebase to Alpine 3.19.
* **2023-08-16:** - Install unrar from [linuxserver repo](https://github.com/linuxserver/docker-unrar).
* **2023-08-10:** - Bump unrar to 6.2.10.
* **2023-07-11:** - Rebase to Alpine 3.18
* **2023-07-07:** - Deprecate armhf. As announced [here](https://www.linuxserver.io/blog/a-farewell-to-arm-hf)
* **2023-03-05:** - Rebase to Alpine 3.17.
* **2022-10-12:** - Rebase to alpine 3.16 and upgrade to s6v3.
* **2022-02-01:** - Rebase to alpine 3.15.
* **2021-11-02:** - Rebase to alpine 3.14. Remove `pathlib.py`.
* **2021-05-25:** - Add `libwebp` support.
* **2021-05-17:** - Add linuxserver wheel index.
* **2021-01-23:** - Rebasing to alpine 3.13.
* **2021-01-03:** - Output mylar log to docker log.
* **2020-12-21:** - Release `nightly` tag based on commits to upstream `python3-dev` branch.
* **2020-09-28:** - Initial release.
