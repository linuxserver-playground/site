---
image: "radarr"
section: "versions"
title: "Versions"
order: 14
---
* **2026-10-19:** - Add krb5-libs for better postgresql support.
* **2026-07-04:** - Rebase to Alpine 3.24.
* **2026-01-15:** - Rebase to Alpine 3.23.
* **2025-07-05:** - Rebase to Alpine 3.22.
* **2024-12-23:** - Rebase Alpine 3.21.
* **2024-05-31:** - Rebase Alpine 3.20.
* **2024-03-20:** - Rebase to Alpine 3.19.
* **2023-06-06:** - Rebase master to Alpine 3.18, deprecate armhf as per [https://www.linuxserver.io/armhf](https://www.linuxserver.io/armhf).
* **2023-01-17:** - Rebase master branch to Alpine 3.17, migrate to s6v3.
* **2022-06-06:** - Rebase master branch to Alpine 3.15.
* **2022-02-20:** - Rebase develop branch to Alpine.
* **2022-02-04:** - Rebase nightly branch to Alpine and deprecate nightly-alpine branch.
* **2021-12-27:** - Add nightly-alpine branch.
* **2021-10-17:** - Remove `UMASK_SET`.
* **2021-05-08:** - Make the paths clearer to the user
* **2021-01-17:** - Deprecate `UMASK_SET` in favor of UMASK in baseimage, see above for more information.
* **2020-11-30:** - Publish `develop` tag.
* **2020-11-28:** - Switch to v3 .NET CORE builds (no more mono, `5.14` tag is deprecated). Rebase to Focal (for issues on arm32v7, [see here](https://docs.linuxserver.io/faq#my-host-is-incompatible-with-images-based-on-ubuntu-focal)).
* **2020-04-05:** - Move app to /app.
* **2019-08-01:** - Rebase to Linuxserver LTS mono version.
* **2019-06-13:** - Add env variable for setting umask.
* **2019-05-10:** - Rebase to Bionic.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2018-09-09:** - Add pipeline build process.
* **2018-02-24:** - Add nightly branch.
* **2018-02-06:** - Radarr repo changed owner.
* **2017-12-15:** - Fix continuation lines.
* **2017-04-17:** - Switch to using inhouse mono baseimage, adds python also.
* **2017-04-13:** - Switch to official mono repository.
* **2017-01-10:** - Initial Release.
