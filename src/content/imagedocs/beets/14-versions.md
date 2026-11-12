---
image: "beets"
section: "versions"
title: "Versions"
order: 14
---
* **2026-02-01:** - Rebase to Alpine 3.23.
* **2025-01-27:** - Rebase to Alpine 3.21.
* **2024-10-01:** - Add packages required for Discogs plugin.
* **2024-08-28:** - Rebase to Alpine 3.20, switch from Pillow to Imagemagick.
* **2023-12-23:** - Rebase to Alpine 3.19.
* **2023-08-25:** - Rebase to Alpine 3.18, pin Pillow to 9.5.0.
* **2023-07-07:** - Deprecate armhf. As announced [here](https://www.linuxserver.io/blog/a-farewell-to-arm-hf)
* **2023-03-25:** - Add requests_oauthlib required for [beatport plugin](https://beets.readthedocs.io/en/stable/plugins/beatport.html).
* **2023-02-24:** - Rebase to Alpine 3.17, migrate to s6v3, install chromaprint from Alpine repos, add beetcamp plugin.
* **2022-01-15:** - Rebasing to alpine 3.15.
* **2019-12-19:** - Rebasing to alpine 3.11.
* **2019-06-28:** - Rebasing to alpine 3.10.
* **2019-05-12:** - Add flac and mp3val binaries required for badfiles plugin.
* **2019-04-12:** - Rebase to Alpine 3.9.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2019-03-11:** - Swap copyartifacts for extrafiles, update endpoints with nightly tag.
* **2019-03-01:** - Switch to python3.
* **2019-02-07:** - Add fftw-dev build dependency for chromaprint.
* **2019-01-28:** - Add pipeline logic and multi arch.
* **2018-08-15:** - Rebase to alpine 3.8, use alpine repo version of pylast.
* **2018-08-12:** - Add requests pip package.
* **2018-03-04:** - Upgrade mp3gain to 1.6.1.
* **2018-01-02:** - Deprecate cpu_core routine lack of scaling.
* **2017-12-27:** - Add beautifulsoup4 pip package.
* **2017-12-06:** - Rebase to alpine linux 3.7.
* **2017-05-25:** - Rebase to alpine linux 3.6.
* **2017-02-06:** - Rebase to alpine linux 3.5.
* **2017-01-16:** - Add packages required for replaygain.
* **2016-12-24:** - Add [beets-copyartifacts](https://github.com/sbarakat/beets-copyartifacts) plugin.
* **2016-12-07:** - Edit cmake options for chromaprint, should now build and install fpcalc, add gstreamer lib
* **2016-10-14:** - Add version layer information.
* **2016-10-01:** - Add nano and editor variable to allow editing of the config from the container command line.
* **2016-09-30:** - Fix umask.
* **2016-09-24:** - Rebase to alpine linux.
* **2016-09-10:** - Add layer badges to README.
* **2016-01-05:** - Change ffpmeg repository, other version crashes container
* **2015-11-29:** - Take out term setting, causing issues with key entry for some users
* **2015-11-06:** - Initial Release
