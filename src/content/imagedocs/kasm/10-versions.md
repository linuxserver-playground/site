---
image: "kasm"
section: "versions"
title: "Versions"
order: 10
---
* **2026-08-07:** - Fix NVIDIA passthrough to Workspace containers by generating a CDI specification inside the DinD layer.
* **2026-08-04:** - Give kasm_manager a healthcheck start period so a cold start does not leave kasm_proxy created but never started.
* **2026-04-16:** - Update for 1.18.1 release. Use rolling service images. Bump docker to v29.
* **2025-11-13:** - Pin docker to v28 to avoid API deprecation issues.
* **2025-10-22:** - Update for 1.18.0 release.
* **2025-06-08:** - Deprecate develop branch.
* **2025-06-03:** - Rebase to Ubuntu Noble. Update for 1.17.0 release.
* **2024-11-09:** - Update base image for 1.16.1 release.
* **2024-09-24:** - Add base users in docker build logic to survive container upgrades.
* **2024-09-17:** - Update base image for 1.16.0 release and fix Nvidia support.
* **2024-02-16:** - Update base image for 1.15.0 release.
* **2023-08-22:** - Update base image for 1.14.0 release.
* **2023-04-07:** - Add mod layer for ingesting LSIO images for 1.13.0 release.
* **2023-03-28:** - Pin compose to 2.5.0 to be in sync with upstream requirements.
* **2022-11-05:** - Rebase to Jammy, add support for GPUs, add support for Gamepads.
* **2022-09-23:** - Migrate to s6v3.
* **2022-07-02:** - Initial Release.
