---
image: "transmission"
section: "versions"
title: "Versions"
order: 17
---
* **2026-05-31:** - Bind RPC to IPv6 interface by default, fall back to IPv4 if unavailable.
* **2024-11-29:** - Fix PEERPORT setting.
* **2023-10-07:** - Install unrar from [linuxserver repo](https://github.com/linuxserver/docker-unrar).
* **2023-08-10:** - Bump unrar to 6.2.10.
* **2023-06-10:** - Bump unrar to 6.2.8, install transmission-extra.
* **2023-05-25:** - Deprecate armhf.
* **2023-05-14:** - Explicitly install transmission-remote.
* **2023-03-02:** - Add cron init to allow user customizable crontabs.
* **2023-02-08:** - Rebase to Alpine Edge to get access to most up to date builds of Transmission. Remove bundled 3rd party UI packages.
* **2023-01-05:** - Rebase to Alpine 3.17, restore GNU findutils package.
* **2022-11-02:** - Rebase to Alpine 3.16, migrate to s6v3.
* **2022-08-12:** - Bump unrar to 6.1.7.
* **2022-04-03:** - Add Transmissionic as a UI option.
* **2022-02-21:** - Build unrar from source, rebase to Alpine 3.15, add symlinks neeeded for TWC. Credit @alexbelgium
* **2021-07-09:** - Wait for the transmission-daemon termination after a caught sigterm.
* **2021-03-06:** - Add Flood for Transmission as a UI option.
* **2021-01-23:** - Rebasing to alpine 3.13.
* **2020-11-02:** - Add ca-certificates package to allow connecting to https trackers.
* **2020-06-02:** - Rebase to alpine 3.12, update to transmission 3.0, remove python2, add python3.
* **2020-05-11:** - Remove unnecessary chmod (remnant of previous change).
* **2020-04-28:** - Use transmission-remote to update blocklist.
* **2020-03-30:** - Internalize blocklist-update.sh.
* **2020-03-29:** - Update auth info in readme.
* **2019-12-19:** - Rebasing to alpine 3.11.
* **2019-10-04:** - Update package label.
* **2019-08-21:** - Add optional user/pass environment variables, fix transmission shut down if user/pass are set.
* **2019-07-19:** - Send SIGTERM in blocklist update to properly close pid.
* **2019-06-28:** - Rebasing to alpine 3.10.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2019-02-22:** - Rebase to Alpine 3.9, add themes to baseimage, add python and findutils.
* **2019-02-22:** - Catch term and clean exit.
* **2019-02-07:** - Add pipeline logic and multi arch.
* **2018-08-15:** - Rebase to alpine linux 3.8.
* **2018-02-12:** - Pull transmission from edge repo.
* **2018-01-10:** - Rebase to alpine linux 3.7.
* **2017-07-25:** - Add rsync package.
* **2017-05-27:** - Rebase to alpine linux 3.6.
* **2017-02-06:** - Rebase to alpine linux 3.5.
* **2017-01-15:** - Add p7zip, tar, unrar, and unzip packages.
* **2016-10-16:** - Blocklist autoupdate with optional authentication.
* **2016-10-14:** - Add version layer informationE.
* **2016-09-23:** - Add information about securing the webui to README.
* **2016-09-21:** - Add curl package.
* **2016-09-09:** - Add layer badges to README.
* **2016-08-28:** - Add badges to README.
* **2016-08-09:** - Rebase to alpine linux.
* **2015-12-06:** - Separate mapping for watch folder.
* **2015-11-16:** - Initial Release.
