---
image: "emby"
section: "versions"
title: "Versions"
order: 12
---
* **2026-09-11:** - Update lib paths to fix hw transcoding.
* **2026-07-14:** - Rebase to Ubuntu Resolute.
* **2026-01-12:** - Set home to /config.
* **2024-08-13:** - Rebase to Ubuntu Noble.
* **2024-02-12:** - Use universal hardware acceleration blurb
* **2024-01-19:** - Fix tonemapping so it's done with hw acceleration.
* **2023-07-06:** - Deprecate armhf. As announced [here](https://www.linuxserver.io/blog/a-farewell-to-arm-hf)
* **2023-06-08:** - Fix package extraction so it doesn't change /tmp perms.
* **2023-05-31:** - Use upstream deb packages instead of rpm.
* **2022-09-26:** - Update chown behavior.
* **2022-09-18:** - Migrate to s6v3, rebase to Ubuntu Jammy.
* **2021-05-19:** - Structural changes upstream.
* **2021-01-17:** - Deprecate `UMASK_SET` in favor of UMASK in baseimage, see above for more information. Remove no longer used mapping for /transcode.
* **2020-12-21:** - Rebase to Focal, see [here](https://docs.linuxserver.io/faq#my-host-is-incompatible-with-images-based-on-ubuntu-focal) for troubleshooting armhf.
* **2020-12-03:** - Fix issue with missing samba folder.
* **2020-11-13:** - Fix issue with samba and ffmpeg.
* **2020-07-03:** - Add support for amd vaapi hw transcode.
* **2020-02-29:** - Add v4l2 support on Raspberry Pi.
* **2020-02-26:** - Add openmax support on Raspberry Pi.
* **2020-02-15:** - Allow restarting emby from the gui (also allows for auto restarts after addon updates).
* **2019-10-02:** - Improve permission fixing for render and dvb devices.
* **2019-08-13:** - Add umask environment variable.
* **2019-06-24:** - Fix typos in readme.
* **2019-05-30:** - Initial release.
