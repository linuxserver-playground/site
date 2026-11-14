---
image: "plex"
section: "versions"
title: "Versions"
order: 14
---
* **2026-07-06:** - Rebase to Ubuntu Resolute.
* **2026-03-15:** - Allow TMPDIR to be changed to better support read-only containers
* **2026-03-15:** - Fix initial claim setup on non-root containers
* **2024-11-04:** - Add Nvidia capability needed for h265
* **2024-07-18:** - Rebase to Ubuntu Noble.
* **2024-02-12:** - Use universal hardware acceleration blurb
* **2024-01-09:** - Set ownership on TranscoderTempDirectory when it's been saved in Preferences.
* **2023-08-16:** - Install unrar from [linuxserver repo](https://github.com/linuxserver/docker-unrar).
* **2023-07-03:** - Deprecate armhf. As announced [here](https://www.linuxserver.io/blog/a-farewell-to-arm-hf)
* **2022-10-16:** - Rebase to jammy. Update to s6v3. Remove opencl packages (bundled with plex).
* **2022-07-18:** - Pin all opencl related driver packages.
* **2022-05-16:** - Pin opencl version.
* **2022-03-04:** - Increase verbosity of video device permissions fix, attempt to fix missing group rw.
* **2021-12-25:** - Install Intel drivers from the official repo.
* **2021-01-20:** - Deprecate `UMASK_SET` in favor of UMASK in baseimage, see above for more information.
* **2020-12-10:** - Add latest Intel Compute packages from github repo for opencl support on latest gen igpu.
* **2020-11-23:** - Add Bionic branch make Focal default.
* **2020-05-03:** - Update exposed ports and example docs for bridge mode.
* **2020-03-23:** - Remove udev hack (no longer needed), suppress uuid error in log during first start.
* **2019-12-04:** - Add variable for setting PLEX_CLAIM. Remove `/transcode` volume mapping as it is now set via plex gui and defaults to a location under `/config`.
* **2019-08-06:** - Add variable for setting UMASK.
* **2019-07-10:** - Fix permissions for tuner (/dev/dvb) devices.
* **2019-05-20:** - Bugfix do not allow Root group for Intel QuickSync ownership rules.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2019-03-22:** - Fix update logic for `VERSION=public`.
* **2019-03-14:** - Switch to new api endpoints, enable beta (plex pass) updates for armhf and aarch64.
* **2019-02-15:** - Clean up plex pid after unclean stop.
* **2019-02-11:** - Fix nvidia variables, add device variables.
* **2019-01-16:** - Add pipeline logic, multi arch, and HW transcoding configuration; remove avahi service.
* **2018-09-07:** - Rebase to ubuntu bionic, add udev package.
* **2017-12-09:** - Fix continuation lines.
* **2017-07-12:** - Add inspect commands to README, move to jenkins build and push.
* **2017-05-28:** - Add unrar package as per requests, for subzero plugin.
* **2017-01-11:** - Use Plex environment variables from pms docker, change abc home folder to /app to alleviate usermod chowning library
* **2017-01-03:** - Use case insensitive version variable matching rather than export and make lowercase.
* **2016-10-17:** - Allow use of uppercase version variable
* **2016-10-01:** - Add TZ info to README.
* **2016-09-09:** - Add layer badges to README.
* **2016-08-27:** - Add badges to README.
* **2016-08-22:** - Rebased to xenial and s6 overlay
* **2016-04-07:** - removed `/transcode` volume support (upstream Plex change) and modified PlexPass download method to prevent unauthorised usage of paid PMS
* **2015-09-24:** - added optional support for volume transcoding (/transcode), and various typo fixes.
* **2015-09-19:** - Plex updated their download servers from http to https
* **2015-09-17:** - Changed to run chmod only once
* **2015-08-28:** - Removed plexpass from routine, and now uses VERSION as a combination fix.
* **2015-07-18:** - Moved autoupdate to be hosted by linuxserver.io and implemented bugfix thanks to ljm42.
* **2015-07-09:** - Now with ability to pick static version number.
* **2015-07-08:** - Now with autoupdates. (Hosted by fanart.tv)
* **2015-07-03:** - Fixed a mistake that allowed plex to run as user plex rather than abc (99:100). Thanks to double16 for spotting this.
