---
image: "homeassistant"
section: "versions"
title: "Versions"
order: 11
---
* **2026-07-02:** - Rebase to alpine 3.24.
* **2026-03-05:** - Remove pycups as there are no python 3.14 wheels for it.
* **2025-10-02:** - Rebase to alpine 3.22, rely on baseimage service for usb device permission fixing.
* **2025-09-19:** - Add the necessary capabilities in the container to allow the unprivileged user access to bluetooth stack.
* **2025-01-03:** - Rebase to alpine 3.21.
* **2024-12-04:** - Make setcap target dynamic.
* **2024-11-07:** - Add go2rtc binary.
* **2024-10-12:** - Allow uv to modify system python packages.
* **2024-10-07:** - Switch to `uv` instead of `pip`.
* **2024-07-03:** - Rebase to alpine 3.20.
* **2024-03-05:** - Add mime.types to help with detection of certain media files.
* **2024-02-13:** - Rebase to alpine 3.19, upgrade to python 3.12. Restructure python packages so all packages are internal (no more venv in /config). Use upstream project's wheels. Due to an upstream issue, on first start of the newly updated container, some custom integrations may be disabled in HA due to missing dependencies. A subsequent container restart should fix that and the integrations should be re-enabled.
* **2023-12-18:** - Add Bluetooth instructions to readme.
* **2023-07-05:** - Deprecate armhf. As announced [here](https://www.linuxserver.io/blog/a-farewell-to-arm-hf)
* **2023-06-21:** - Pin pycups version.
* **2023-06-14:** - Create secondary venv in `/config` for pip installs.
* **2023-06-07:** - Rebase to alpine 3.18, switch to cp311 wheels.
* **2023-05-03:** - Deprecate arm32v7. Latest HA version with an arm32v7 build is `2023.4.6`.
* **2022-11-16:** - Fix the dep conflict for google calendar.
* **2022-09-23:** - Migrate to s6v3.
* **2022-07-29:** - Improve usb device permission fix.
* **2022-07-07:** - Rebase to alpine 3.16, switch to cp310 wheels.
* **2022-05-07:** - Build matplotlib with the same Numpy version as HA req.
* **2022-03-31:** - Install pycups.
* **2022-03-07:** - Install PySwitchbot.
* **2022-03-02:** - Update pip and use legacy resolver, clean up temp python files, reduce image size.
* **2022-02-04:** - Always compile grpcio on arm32v7 due to pypi pushing a glibc only wheel.
* **2021-12-12:** - Use the new `build.yaml` to determine HA base version.
* **2021-09-25:** - Use the new lsio homeassistant wheel repo, instead of the HA wheels.
* **2021-09-13:** - Build psycopg locally as the HA provided wheel does not seem to work properly.
* **2021-09-13:** - Fix setcap in service. Build CISO8601 locally as the HA provided wheel does not seem to work properly.
* **2021-09-12:** - Rebase to alpine 3.14. Build on native armhf.
* **2021-08-09:** - Fixed broken build caused by missing dependency.
* **2021-07-01:** - Remove HACS dependencies as it caused a crash in Home-assistant.
* **2021-02-25:** - Add python dependencies from homeassistant base image.
* **2021-02-07:** - Fix building from the wrong requirement file. Add ssh client & external DB libs.
* **2021-02-06:** - Add iputils so ping works as non root user.
* **2021-01-30:** - Initial Release.
