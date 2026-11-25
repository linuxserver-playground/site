---
image: "healthchecks"
section: "versions"
title: "Versions"
order: 11
---
* **2026-07-05:** - Rebase to Alpine 3.24.
* **2025-12-28:** - Rebase to Alpine 3.23.
* **2025-07-05:** - Rebase to Alpine 3.22.
* **2024-12-20:** - Rebase to Alpine 3.21.
* **2024-08-31:** - Enable IPv6 on uwsgi.
* **2024-05-31:** - Rebase to Alpine 3.20.
* **2024-01-24:** - No longer write envs to local_settings.py. Envs will take precedence over any existing values in config file. Removed `REGENERATE_SETTINGS` as it is now obsolete.
* **2024-01-22:** - Fix CSRF handling.
* **2023-12-23:** - Rebase to Alpine 3.19.
* **2023-05-31:** - Rebase to Alpine 3.18. Deprecate armhf.
* **2022-12-22:** - Rebase to Alpine 3.17. Add extra deps for pycurl. Add INTEGRATIONS_ALLOW_PRIVATE_IPS.
* **2022-10-18:** - Add curl-dev to fix broken pip builds.
* **2022-10-11:** - Rebase to Alpine 3.16, migrate to s6v3.
* **2022-09-27:** - Fix sending of Email Reports
* **2022-01-08:** - Fix CSRF setting for Django 4.0 (introduced in v1.25.0)
* **2021-11-11:** - Add Apprise to Docker as in v1.24.0
* **2021-09-10:** - Fix creation of superuser
* **2021-08-07:** - Update custom logo handling to support changes in v1.22.0
* **2021-07-11:** - Rebase to Alpine 3.14.
* **2021-05-18:** - Add linuxserver wheel index.
* **2021-01-11:** - Add libffi-dev to allow building of python cryptography lib.
* **2020-07-19:** - Rebasing to alpine 3.12, fixed 'ALLOWED_HOSTS' bug, now defaults to wildcard
* **2019-12-19:** - Rebasing to alpine 3.11.
* **2019-10-31:** - Add postgres client and fix config for CSRF.
* **2019-10-23:** - Allow to create superuser
* **2019-06-28:** - Rebasing to alpine 3.10.
* **2019-04-12:** - Rebase to Alpine 3.9.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2019-02-14:** - Adding mysql libs needed for using a database.
* **2018-10-11:** - adding pipeline logic and multi arching release
* **2017-11-15:** - `git pull` is now in Dockerfile so each tagged container contains the same code version
* **2017-10-17:** - Fixed `local_settings.py` output
* **2017-09-27:** - Initial Release.
