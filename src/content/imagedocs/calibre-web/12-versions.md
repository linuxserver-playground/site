---
image: "calibre-web"
section: "versions"
title: "Versions"
order: 12
---
* **2025-10-28:** - Add libxfixes3 and libasound2t64 to support epub to pdf conversion; also set --no-sandbox for qtwebengine.
* **2025-01-07:** - Set kepubify path by default.
* **2024-12-05:** - Rebase to noble.
* **2024-08-26:** - Add new dep, xdg-utils.
* **2024-07-07:** - Add new dep, libmagic1.
* **2023-10-17:** - Remove some packages that are required by the calibre mod but not the base container.
* **2023-10-07:** - Install unrar from [linuxserver repo](https://github.com/linuxserver/docker-unrar). Switch to Python virtual environment.
* **2023-04-13:** - Deprecate armhf.
* **2023-03-27:** - Add cmake as build dep for Levenshtein.
* **2022-12-27:** - Add ghostscript, libxtst6, libxkbfile-dev.
* **2022-12-20:** - Improve init script and prevent harmless error.
* **2022-10-19:** - Rebase to jammy. Upgrade to s6v3. Clean up build dependencies.
* **2021-11-04:** - Update pip arguments to ignore distro installed packages.
* **2021-06-24:** - Add note on optional OAUTHLIB_RELAX_TOKEN_SCOPE for Google OAUTH support.
* **2021-05-17:** - Add linuxserver wheel index.
* **2021-02-10:** - Add libxrandr2
* **2021-01-25:** - Add nightly tag
* **2021-01-19:** - Add python3-pkg-resources
* **2021-01-13:** - Rebase to Ubuntu Focal, see [here](https://docs.linuxserver.io/faq#my-host-is-incompatible-with-images-based-on-ubuntu-focal) for troubleshooting armhf.
* **2020-10-12:** - Add libxi6
* **2020-07-12:** - Add kepubify for arm64v8
* **2020-06-05:** - Add kepubify for x86-64 and arm32v7
* **2020-05-06:** - Add libxslt1.1 and update ImageMagick policy
* **2020-01-19:** - Adding LDAP libs.
* **2019-10-13:** - Migrate to Python3.
* **2019-08-01:** - Add libxcomposite1.
* **2019-06-13:** - Add docker mod to enable optional ebook conversion on x86-64.  Add unrar.
* **2019-06-02:** - Rebase to Ubuntu Bionic & add Gdrive support.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2019-02-23:** - Rebase to alpine 3.9, use repo version of imagemagick.
* **2019-02-11:** - Add pipeline logic and multi arch.
* **2019-01-03:** - Remove guest user from default app.db.
* **2018-08-16:** - Rebase to alpine 3.8.
* **2018-07-03:** - New build pushed, all versions below `67` have [vulnerability](https://github.com/janeczku/calibre-web/issues/534).
* **2018-01-05:** - Deprecate cpu_core routine lack of scaling.
* **2017-12-06:** - Rebase to alpine 3.7.
* **2017-11-27:** - Use cpu core counting routine to speed up build time.
* **2017-07-24:** - Curl version for imagemagick.
* **2017-07-17:** - Initial release.
