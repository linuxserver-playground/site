---
image: "jackett"
section: "versions"
title: "Versions"
order: 13
---
* **2026-07-14:** - Rebase to Alpine 3.24.
* **2025-07-09:** - Rebase to Alpine 3.22.
* **2025-01-12:** - Rebase to Alpine 3.21.
* **2024-05-31:** - Rebase to Alpine 3.20.
* **2024-03-11:** - Rebase to Alpine 3.19. Deprecate development tag as upstream is publishing nightly stable releases.
* **2023-07-11:** - Rebase to Alpine 3.18.
* **2023-07-01:** - Deprecate armhf. As announced [here](https://www.linuxserver.io/blog/a-farewell-to-arm-hf)
* **2023-02-13:** - Add icu-data-full to address [ICU issue](https://github.com/Jackett/Jackett/issues/14008) with Cyrillic character sets.
* **2023-02-11:** - Rebase to Alpine 3.17, migrate to s6v3.
* **2022-05-10:** - Rebase to Ubuntu Focal.
* **2020-05-24:** - Allow user to optionally enable auto updates.
* **2019-12-31:** - Remove agressive startup chowning.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2019-03-10:** - Switch to net-core builds of jackett, not dependant on mono and smaller images.
* **2019-02-11:** - Add pipeline logic and multi arch.
* **2018-06-11:** - Ensure root ownership of Jackett files.
* **2017-12-13:** - Fix continuation lines.
* **2017-04-17:** - Switch to using inhouse mono baseimage, ubuntu xenial based.
* **2017-02-09:** - Rebase to alpine 3.5.
* **2016-10-29:** - Call python2 from edge main to satisfy new mono dependency.
* **2016-10-14:** - Add version layer information.
* **2016-09-22:** - Remove autoupdate, tidy up Dockerfile.
* **2016-09-10:** - Add layer badges to README.
* **2016-08-28:** - Add badges to README.
* **2016-08-06:** - Rebase to alpine linux for smaller image.
* **2016-01-25:** - Initial Release.
