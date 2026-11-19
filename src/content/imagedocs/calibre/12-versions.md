---
image: "calibre"
section: "versions"
title: "Versions"
order: 12
---
* **2026-04-19:** - Rebase to resolute.
* **2026-04-03:** - Make Wayland default disable with PIXELFLUX_WAYLAND=false.
* **2025-12-28:** - Add Wayland init logic.
* **2025-07-26:** - Rebase to selkies. Breaking Change: HTTPS is now required. Either use a reverse proxy with SSL cert or direct connect to port 8181 with HTTPS.
* **2024-08-19:** - Rebase to noble.
* **2024-02-10:** - Update Readme with new env vars and ingest proper PWA icon.
* **2024-01-31:** - Fix fullscreen on start.
* **2023-11-17:** - Install libxcb-cursor0 for v7 support.
* **2023-03-18:** - Rebase to KasmVNC base image.
* **2022-10-19:** - Set the window title to `Calibre`. Remove websocat as it is now handled properly in the baseimage.
* **2022-10-18:** - Deprecate Arch branch.
* **2022-10-07:** - Start calibre window maximized.
* **2022-09-16:** - Rebase to jammy.
* **2022-07-24:** - Add arm64 build for master branch.
* **2022-07-11:** - Update dependencies for Calibre 6.
* **2022-05-28:** - Rebase to focal.
* **2022-03-31:** - Fix umask.
* **2022-02-28:** - Add speech support to bionic image.
* **2022-01-05:** - Add arch branch for arm platforms.
* **2021-04-20:** - Fix the HOME folder.
* **2021-04-19:** - Add libnss3 back in. Make sure Calibre can access environment variables.
* **2021-04-18:** - Start calibre on container start rather than gui connect.
* **2021-04-15:** - Rebase to rdesktop-web baseimage. Deprecate `GUAC_USER` and `GUAC_PASS` env vars. Existing users can set the new var `PASSWORD` for the user `abc`.
* **2020-09-25:** - Switch to python3, add various new dependencies for calibre 5.0.
* **2019-10-23:** - Remove reccomended deps and zenity for character compatibility.
* **2019-10-18:** - Add python-xdg.
* **2019-10-08:** - Add fonts-wqy-microhei ttf-wqy-zenhei fcitx-rime dependency to resolve issue with Chinese encoding.
* **2019-10-04:** - Add libxkbcommon-x11-0 dependency to resolve issue with Calibre 4.
* **2019-08-08:** - Add zenity for international character support in dialog boxes.
* **2019-07-12:** - Download binary from calibre website instead of github.
* **2019-05-10:** - Add new env var `CLI_ARGS` to pass start arguments to calibre.
* **2019-04-29:** - Initial release.
* **2019-03-18:** - Let Calibre access environment variables, add optional umask setting.
