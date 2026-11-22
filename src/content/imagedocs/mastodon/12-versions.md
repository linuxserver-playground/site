---
image: "mastodon"
section: "versions"
title: "Versions"
order: 12
---
* **2026-07-05:** - Rebase to Alpine 3.24.
* **2025-10-21:** - Add prometheus exporter support.
* **2025-10-20:** - Add vips-heif.
* **2025-07-08:** - Rebase to Alpine 3.22.
* **2025-06-06:** - Rebase to Alpine 3.21, replace deprecated imagemagick with vips.
* **2024-10-08:** - Rebase to Alpine 3.20, enable [Active Record Encryption](https://github.com/mastodon/mastodon/pull/29831/files). Existing users should update their nginx confs to avoid http2 deprecation warnings.
* **2023-09-21:** - Rebase to Alpine 3.18, migrate to s6v3.
* **2023-05-25:** - Adjust apk flags.
* **2023-02-09:** - Add Glitch branch.
* **2023-01-09:** - Updated nginx conf to fix bring inline with Mastodon configuration (fixes Elk integration).
* **2022-12-19:** - Support separate sidekiq queue instances.
* **2022-11-05:** - Initial Release.
