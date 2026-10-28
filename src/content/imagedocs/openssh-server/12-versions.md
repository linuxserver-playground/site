---
image: "openssh-server"
section: "versions"
title: "Versions"
order: 12
---
* **2026-07-05:** - Rebase to Alpine 3.24.
* **2025-12-28:** - Rebase to Alpine 3.23.
* **2025-07-05:** - Rebase to Alpine 3.22.
* **2025-02-10:** - Add support for sshd_config.d
* **2025-01-12:** - Rebase to Alpine 3.21.
* **2024-11-24:** - Move sshd_config to /config/sshd/sshd_config.
* **2024-05-31:** - Rebase to Alpine 3.20.
* **2024-05-04:** - Display the SSH host public keys every time the container starts.
* **2024-03-09:** - Rebase to Alpine 3.19.
* **2023-06-12:** - Rebase to Alpine 3.18, deprecate armhf. As announced [here](https://www.linuxserver.io/blog/a-farewell-to-arm-hf)
* **2023-03-05:** - Rebase to Alpine 3.17.
* **2022-10-18:** - Fix wrong behavior of password/passwordless sudo
* **2022-10-11:** - Rebase to Alpine 3.16, migrate to s6v3.
* **2022-09-15:** - add netcat-openbsd with support for proxies.
* **2022-07-18:** - Fix service perms to comply with upgrade to s6 v3.
* **2022-04-16:** - Rebase to alpine 3.15.
* **2021-11-16:** - Add PUBLIC_KEY_URL option
* **2021-06-28:** - Rebasing to alpine 3.14. Add support for PAM.
* **2021-02-10:** - Rebasing to alpine 3.13. Add openssh-client for scp.
* **2020-10-21:** - Implement s6-log for openssh, which adds local timestamps to logs and can be used with a log parser like fail2ban.
* **2020-10-20:** - Set umask for sftp.
* **2020-06-01:** - Rebasing to alpine 3.12.
* **2020-01-18:** - Add key generation script.
* **2020-01-13:** - Add openssh-sftp-server.
* **2019-12-19:** - Rebasing to alpine 3.11.
* **2019-10-17:** - Initial Release.
