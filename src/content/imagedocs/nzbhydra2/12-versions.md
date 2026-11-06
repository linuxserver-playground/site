---
image: "nzbhydra2"
section: "versions"
title: "Versions"
order: 12
---
* **2024-07-18:** - Rebase to Ubuntu Noble. Remove standalone JRE ([#46](https://github.com/linuxserver/docker-nzbhydra2/pull/46)).
* **2023-07-04:** - Deprecate armhf. As announced [here](https://www.linuxserver.io/blog/a-farewell-to-arm-hf)
* **2023-01-22:** - Update release URL for arch-specific packages.
* **2023-01-20:** - Update dependencies for v5.
* **2022-12-10:** - Bump master JRE to v17. Default mapIpToHost to false.
* **2022-09-11:** - Migrate to s6v3.
* **2022-05-03:** - Rebase to Jammy.
* **2022-04-18:** - Rebase to Alpine 3.15.
* **2020-05-01:** - Reorganize container, Relocate app to /app/nzbhydra2/bin, Create /app/nzbhydra2/package_info, Use nzbhydra2wrapperPy3.py from zip.
* **2020-04-14:** - Correct Name, Hydra2 -> NZBHydra2.
* **2020-01-08:** - Switch to python3.
* **2020-01-05:** - Add dev tag for prereleases.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2019-02-11:** - Add pipeline logic and multi arch.
* **2018-08-18:** - Bump java version to 10, (bionic currently refers to it as version 11).
* **2018-08-10:** - Rebase to ubuntu bionic.
* **2018-04-15:** - Change to port 5076 in the Dockerfile.
* **2018-01-11:** - Initial Release.
