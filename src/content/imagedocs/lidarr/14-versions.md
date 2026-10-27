---
image: "lidarr"
section: "versions"
title: "Versions"
order: 14
---
* **2026-10-19:** - Add krb5-libs for better postgresql support.
* **2026-07-04:** - Rebase to Alpine 3.24.
* **2026-01-15:** - Rebase to Alpine 3.23.
* **2025-07-05:** - Rebase to Alpine 3.22.
* **2024-12-23:** - Rebase to Alpine 3.21.
* **2024-05-31:** - Rebase to Alpine 3.20.
* **2024-03-20:** - Rebase to Alpine 3.19.
* **2023-06-06:** - Rebase master to Alpine 3.18, deprecate armhf as per [https://www.linuxserver.io/armhf](https://www.linuxserver.io/armhf).
* **2023-01-17:** - Rebase master branch to Alpine 3.17, migrate to s6v3.
* **2022-06-06:** - Rebase master branch to Alpine 3.15.
* **2022-05-06:** - Rebase master branch to Focal.
* **2022-05-06:** - Rebase develop branch to Alpine.
* **2022-02-04:** - Rebase nightly branch to Alpine, deprecate nightly-alpine branch.
* **2021-12-30:** - Add nightly-alpine branch.
* **2021-08-01:** - Add libchromaprint-tools.
* **2021-07-11:** - Make the paths clearer to the user.
* **2021-04-18:** - Switch `latest` tag to net core.
* **2021-01-25:** - Publish `develop` tag.
* **2021-01-20:** - Deprecate `UMASK_SET` in favor of UMASK in baseimage, see above for more information.
* **2020-04-18:** - Removed /downloads and /music volumes from Dockerfiles.
* **2020-04-05:** - Move app to /app.
* **2019-08-01:** - Rebase to Linuxserver LTS mono version.
* **2019-06-13:** - Add env variable for setting umask.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2019-03-08:** - Rebase to Bionic, use proposed endpoint for libchromaprint.
* **2019-01-26:** - Add pipeline logic and multi arch.
* **2018-04-22:** - Switch to beta builds.
* **2018-03-17:** - Add ENV XDG_CONFIG_HOME="/config/xdg" to Dockerfile for signalr fix.
* **2018-02-27:** - Use json to query for new version.
* **2018-02-23:** - Initial Release.
