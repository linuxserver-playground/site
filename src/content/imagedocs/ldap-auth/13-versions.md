---
image: "ldap-auth"
section: "versions"
title: "Versions"
order: 13
---
* **2026-07-17:** - Rebase to Alpine 3.24.
* **2024-12-25:** - Add `legacy-cgi`. Fix fernet key storage.
* **2024-12-22:** - Rebase to Alpine 3.21. Add support for read-only and non-root.
* **2024-06-30:** - Rebase to Alpine 3.20.
* **2023-12-23:** - Rebase to Alpine 3.19.
* **2023-06-20:** - Sync upstream changes, including the ability to disable referrals with `X-Ldap-DisableReferrals`.
* **2023-05-25:** - Rebase to Alpine 3.18, deprecate armhf.
* **2022-12-30:** - Rebase to alpine 3.17.
* **2022-09-19:** - Rebase to alpine 3.15.
* **2021-05-14:** - Add linuxserver wheel index.
* **2021-02-12:** - Clean up cargo/rust cache.
* **2021-02-10:** - Rebasing to alpine 3.13.
* **2020-09-08:** - Set form action correctly.
* **2020-07-30:** - Fix bug related to unset optional `CERTFILE` and `KEYFILE` vars.
* **2020-07-27:** - Add support for HTTP over SSL (HTTPS).
* **2020-07-21:** - Add support for optional user defined fernet key.
* **2020-06-02:** - Rebasing to alpine 3.12, serve login page at `/ldaplogin` as well as `/login`, to prevent clashes with reverese proxied apps.
* **2020-05-17:** - Add support for self-signed CA certs.
* **2020-02-20:** - Switch to python3.
* **2019-12-19:** - Rebasing to alpine 3.11.
* **2019-07-01:** - Fall back to base64 encoding when basic http auth is used.
* **2019-06-28:** - Rebasing to alpine 3.10.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2019-02-22:** - Rebasing to alpine 3.9.
* **2018-09-18:** - Update pip
* **2018-09-14:** - Add TZ parameter, remove unnecessary PUID/PGID params
* **2018-08-11:** - Initial release.
