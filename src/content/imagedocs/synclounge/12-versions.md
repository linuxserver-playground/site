---
image: "synclounge"
section: "versions"
title: "Versions"
order: 12
---
* **2026-07-15:** - Rebase to Alpine 3.24.
* **2024-12-19:** - Add support for read-only and non-root operation.
* **2024-12-05:** - Rebase to Alpine 3.21.
* **2024-06-04:** - Rebase to Alpine 3.20.
* **2023-08-26:** - Rebase to Alpine 3.19. Remove deprecated `AUTOJOIN_ENABLED` & `AUTOJOIN_ROOM` options.
* **2023-08-26:** - Rebase to Alpine 3.18.
* **2023-07-04:** - Deprecate armhf. As announced [here](https://www.linuxserver.io/blog/a-farewell-to-arm-hf)
* **2022-11-29:** - Rebase to alpine 3.17, upgrade to s6v3.
* **2022-09-19:** - Rebase to alpine 3.15.
* **2021-02-12:** - Fix optional dependency builds in aarch64 image.
* **2021-02-12:** - Rebasing to alpine 3.13.
* **2020-10-28:** - Update to v4. Env vars `EXTERNAL_URL`, `EXTERNAL_SERVER_PORT` and `AUTOJOIN_PASSWORD` are deprecated and no longer have any effect. Env vars `AUTOJOIN_ENABLED` and `AUTOJOIN_ROOM` are still working but will be removed in the future in favor of synclounge's built-in var `autojoin__room`. If you are reverse proxying, do not forget to update your proxy settings ([here](https://github.com/linuxserver/reverse-proxy-confs/blob/master/synclounge.subdomain.conf.sample) and [here](https://github.com/linuxserver/reverse-proxy-confs/blob/master/synclounge.subfolder.conf.sample)) as the server port and addresses are changed.
* **2020-10-11:** - Pin builds to upstream commit `6aecc9bd` while evaluating the breaking changes upstream.
* **2020-09-27:** - Updating the external repo endpoint.
* **2020-06-01:** - Rebasing to alpine 3.12.
* **2020-05-11:** - Initial Release.
