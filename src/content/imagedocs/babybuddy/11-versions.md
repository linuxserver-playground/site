---
image: "babybuddy"
section: "versions"
title: "Versions"
order: 11
---
* **2026-07-21:** - Rebase to Alpine 3.24.
* **2025-07-27:** - Rebase to Alpine 3.22.
* **2024-06-30:** - Rebase to Alpine 3.20. Existing users should update their nginx confs to avoid http2 deprecation warnings.
* **2023-12-23:** - Rebase to Alpine 3.19 with php 8.3.
* **2023-07-05:** - Add standard HTTP/HTTPS listen ports 80 and 443, keeping 8000 for backwards compatibility.
* **2023-05-25:** - Rebase to Alpine 3.18, deprecate armhf.
* **2023-01-16:** - Rebase to Alpine 3.17.
* **2022-11-23:** - Rebase to Alpine 3.16, migrate to s6v3. Restructure nginx configs ([see changes announcement](https://info.linuxserver.io/issues/2022-08-20-nginx-base)).
* **2022-05-28:** - Add missing PUID/PGID vars to readme.
* **2022-04-03:** - Rebase to alpine-nginx baseimage. Add `CSRF_TRUSTED_ORIGINS` env var.
* **2021-12-11:** - Add py3-mysqlclient for mysql/mariadb.
* **2021-11-14:** - Add lxml dependencies (temp fix for amd64 by force compiling lxml).
* **2021-07-25:** - Add libpq for postgresql.
* **2021-07-08:** - Fix pip install issue.
* **2021-07-05:** - Update Gunicorn parameters to prevent `WORKER_TIMEOUT` issue.
* **2021-06-22:** - Initial release.
