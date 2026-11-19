---
image: "code-server"
section: "versions"
title: "Versions"
order: 13
---
* **2026-09-20:** - Add fallback for legacy or misconfigured systems without IPv6 support.
* **2026-05-17:** - Fix container only listening on IPv6 when running non-root.
* **2025-08-10:** - Let server listen on both ipv4 and ipv6.
* **2025-06-03:** - Allow setting PWA name using env var `PWA_APPNAME`.
* **2024-10-13:** - Only chown config folder when change to ownership or new install is detected.
* **2024-10-09:** - Manage permissions in /config/.ssh according to file type
* **2024-08-19:** - Rebase to Ubuntu Noble.
* **2023-07-01:** - Deprecate armhf. As announced [here](https://www.linuxserver.io/blog/a-farewell-to-arm-hf)
* **2022-10-05:** - Install recommended deps to maintain parity with the older images.
* **2022-09-29:** - Rebase to jammy, switch to s6v3. Fix chown logic to skip `/config/workspace` contents.
* **2022-02-20:** - Install using the official tarballs.
* **2021-12-29:** - Add `install-extension` as a helper for mods to install extensions.
* **2021-12-06:** - Add `DEFAULT_WORKSPACE` env var.
* **2021-11-29:** - Rebase to Ubuntu focal.
* **2021-09-16:** - Fix slow `chown` on large workspace (contents of workspace folder no longer chowned).
* **2021-07-11:** - Bump node to 14 to fix builds
* **2021-05-08:** - Fix doc link
* **2021-02-04:** - Allow setting gui password via hash using env var `HASHED_PASSWORD`.
* **2020-12-23:** - Allow setting sudo password via hash using env var `SUDO_PASSWORD_HASH`.
* **2020-05-29:** - Add --domain-proxy support.
* **2020-05-21:** - Shrink images, install via yarn, fix arm32v7 build.
* **2020-05-18:** - Switch to multi-arch images, install via npm.
* **2020-04-29:** - Update start arguments.
* **2020-04-01:** - Structural changes required for v3.
* **2020-01-17:** - Fix artifact url retrieval from github.
* **2019-10-24:** - Upgrade to v2 builds.
* **2019-09-28:** - Update project logo.
* **2019-09-21:** - Add development builds/tag.
* **2019-07-09:** - Add optional sudo access.
* **2019-07-01:** - Add nano.
* **2019-06-24:** - Initial Release.
