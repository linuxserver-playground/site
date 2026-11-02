---
image: "jellyfin"
section: "versions"
title: "Versions"
order: 13
---
* **2026-07-14:** - Rebase to Ubuntu Resolute.
* **2026-03-02:** - Add support for IPv6 OOTB.
* **2025-10-20:** - Add libjemalloc2 as runtime dep.
* **2024-10-06:** - Fix fontconfig cache path.
* **2024-08-13:** - Rebase to Ubuntu Noble.
* **2024-05-01:** - Increase verbosity of device permissions fixing.
* **2024-02-12:** - Use universal hardware acceleration blurb.
* **2023-09-12:** - Take ownership of plugin directories.
* **2023-07-04:** - Deprecate armhf. As announced [here](https://www.linuxserver.io/blog/a-farewell-to-arm-hf)
* **2022-12-07:** - Rebase master to Jammy, migrate to s6v3.
* **2022-06-11:** - Switch to upstream repo's ffmpeg5 build.
* **2022-01-05:** - Specify Intel iHD driver versions to avoid mismatched libva errors.
* **2021-12-25:** - Fix video device group perms error message.
* **2021-12-10:** - Rework readme, disable template sync.
* **2021-09-22:** - Pull only the server, web and ffmpeg packages instead of the wrapper.
* **2021-06-23:** - Add log message if device permissions are incorrect. Pin jellyfin dependency versions to prevent upstream apt repo issues. Deprecate the `bionic` tag.
* **2021-05-21:** - Add nvidia.icd file to fix missing tonemapping using Nvidia HW.
* **2021-01-20:** - Add Jellyfin Binary Environmentals
* **2021-01-20:** - Deprecate `UMASK_SET` in favor of UMASK in baseimage, see above for more information.
* **2020-11-23:** - Rebase to Focal, branch off Bionic.
* **2020-07-22:** - Ingest releases from Jellyfin repo.
* **2020-04-28:** - Replace MMAL/OMX dependency device `/dev/vc-mem` with `/dev/vcsm` as the former was not sufficient for raspbian.
* **2020-04-11:** - Enable hw decode (mmal) on Raspberry Pi, update readme instructions, add donation info, create missing default transcodes folder.
* **2020-03-11:** - Add Pi V4L2 support, remove optional transcode mapping (location is selected in the gui, defaults to path under `/config`).
* **2020-01-30:** - Add nightly tag.
* **2020-01-09:** - Add Pi OpenMax support.
* **2019-10-02:** - Improve permission fixing for render & dvb devices.
* **2019-07-31:** - Add AMD drivers for vaapi support on x86.
* **2019-06-13:** - Add Intel drivers for vaapi support on x86.
* **2019-06-07:** - Initial release.
