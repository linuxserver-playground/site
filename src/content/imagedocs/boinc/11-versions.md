---
image: "boinc"
section: "versions"
title: "Versions"
order: 11
---
* **2026-04-19:** - Rebase to resolute, make Wayland default disable with PIXELFLUX_WAYLAND=false.
* **2025-12-28:** - Add Wayland init logic.
* **2025-07-07:** - Rebase to selkies. Breaking change: HTTPS is now required. Use port 8181 with HTTPS for direct access. Reverse proxies can connect to 8080 over http as long as it's served over HTTPS to the user.
* **2024-08-19:** - Rebase to noble.
* **2024-02-10:** - Update Readme with new env vars and ingest proper PWA icon.
* **2023-04-03:** - Rebase to KasmVNC base image. Deprecate armhf build as the new base does not support it. Add bzip2 and xz-utils.
* **2022-11-14:** - Fix opencl driver.
* **2022-09-18:** - Rebase to jammy.
* **2022-02-24:** - Rebase to focal.
* **2022-01-31:** - Improve device permissions setting verbosity.
* **2021-03-23:** - Rebase to rdesktop-web baseimage. Deprecate `GUAC_USER` and `GUAC_PASS` env vars. Existing users can set the new var `PASSWORD` for the user `abc`.
* **2020-04-01:** - Install boinc from ppa.
* **2020-03-17:** - Add armhf and aarch64 builds and switch to multi-arch image.
* **2020-03-16:** - Clean up old pid files.
* **2020-03-15:** - Initial release.
