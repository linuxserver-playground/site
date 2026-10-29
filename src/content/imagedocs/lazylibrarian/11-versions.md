---
image: "lazylibrarian"
section: "versions"
title: "Versions"
order: 11
---
* **2024-08-14:** - Rebase to Ubuntu Noble.
* **2023-10-07:** - Install unrar from [linuxserver repo](https://github.com/linuxserver/docker-unrar). Switch to Python virtual environment. Add Levenshtein.
* **2023-08-10:** - Bump unrar to 6.2.10.
* **2023-07-01:** - Deprecate armhf. As announced [here](https://www.linuxserver.io/blog/a-farewell-to-arm-hf)
* **2022-12-07:** - Rebase to Ubuntu Jammy, migrate to s6v3. Use pyproject.toml for deps. Build unrar from source.
* **2022-09-27:** - Switch to `Levenshtein`, add cmake as build dep on armhf.
* **2022-05-07:** - Rebase to Ubuntu Focal.
* **2021-05-22:** - Make the paths clearer to the user, remove optional volume.
* **2021-05-17:** - Add linuxserver wheel index.
* **2019-10-23:** - Changed gitlab download link.
* **2019-10-23:** - Add python module Pillow.
* **2019-07-31:** - Add pyopenssl, remove git dependency during build time.
* **2019-07-09:** - Rebase to Ubuntu Bionic, enables Calibre docker mod.
* **2019-06-28:** - Rebasing to alpine 3.10.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2019-03-05:** - Added apprise python package.
* **2019-02-22:** - Rebasing to alpine 3.9.
* **2018-12-10:** - Moved to Pipeline Building
* **2018-08-16:** - Rebase to alpine 3.8
* **2018-01-05:** - Deprecate cpu_core routine lack of scaling
* **2017-12-12:** - Rebase to alpine 3.7
* **2017-07-21:** - Internal git pull instead of at runtime
* **2017-05-25:** - Rebase to alpine 3.6
* **2017-02-07:** - Rebase to alpine 3.5
* **2017-01-30:** - Compile libunrar.so to allow reading of .cbr format files
* **2017-01-12:** - Add ghostscript package, allows magazine covers to be created etc
* **2016-10-14:** - Add version layer information
* **2016-10-03:** - Fix non-persistent settings and make log folder
* **2016-09-28:** - Inital Release
