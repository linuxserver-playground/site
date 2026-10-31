---
image: "hedgedoc"
section: "versions"
title: "Versions"
order: 11
---
* **2026-07-29:** - Rebase to Alpine 3.24.
* **2025-10-14:** - Rebase to Alpine 3.22.
* **2025-02-24:** - Add missing icu-data-full to fix bug with TextDecoder and image uploads.
* **2024-06-21:** - Allow using `CMD_DB_DIALECT` to set up the `CMD_DB_URL`.
* **2024-06-06:** - Rebase to Alpine 3.20.
* **2023-12-23:** - Rebase to Alpine 3.19.
* **2023-06-18:** - Rebase to Alpine 3.18, deprecate armhf as per [https://www.linuxserver.io/armhf](https://www.linuxserver.io/armhf).
* **2022-11-02:** - Rebase to Alpine 3.16, migrate to s6v3.
* **2022-04-10:** - Use python3 to build node sqlite3.
* **2022-02-10:** - Rebase to Alpine 3.15.
* **2022-02-09:** - Add optional var `CMD_PORT` that is needed for accessing at port other than 80, 443 and 3000.
* **2021-12-09:** - Add optional var `CMD_PROTOCOL_USESSL` that is needed for reverse proxy.
* **2021-12-07:** - Rebase to ubuntu focal. Update to node 16. Make sure uploads are persistent.
* **2021-10-15:** - Add required env var `CMD_DOMAIN`.
* **2021-05-05:** - Remove symlinking some folders from config to /opt/hedgedoc/public.
* **2021-05-03:** - Remove deprecated sequalizerc step.
* **2020-12-22:** - Initial release
