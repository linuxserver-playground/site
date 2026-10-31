---
image: "netbox"
section: "versions"
title: "Versions"
order: 11
---
* **2026-01-05:** - Rebase to Alpine 3.23. Add CSRF_TRUSTED_ORIGINS env settings. Drop support for environments with explicitly disabled IPv6.
* **2024-08-26:** - Restructure init to allow for plugins as mods.
* **2024-07-16:** - Add required packages for LDAP support.
* **2024-06-01:** - Rebase to Alpine 3.20.
* **2023-12-23:** - Rebase to Alpine 3.19.
* **2023-06-11:** - Rebase to Alpine 3.18, deprecate armhf.
* **2023-05-14:** - Build local docs on first run.
* **2023-03-05:** - Rebase to Alpine 3.17.
* **2022-11-02:** - Rebase to Alpine 3.16, migrate to s6v3.
* **2022-08-01:** - Remove py3-pillow, add tiff to fix deps.
* **2022-07-26:** - Add py3-pillow package back on arm to fix build issue.
* **2021-12-10:** - Remove py3-pillow package to fix dependency issue with 3.2.0.
* **2021-12-10:** - Rebase to Alpine 3.15.
* **2021-04-26:** - Added Redis database environment variables.
* **2021-02-03:** - Added remote authentication environment variables.
* **2021-01-02:** - Added BASE_PATH environment variable.
* **2020-08-23:** - Initial Release.
