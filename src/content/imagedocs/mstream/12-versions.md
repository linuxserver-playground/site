---
image: "mstream"
section: "versions"
title: "Versions"
order: 12
---
* **2026-08-31:** - Bake the p2p discovery sidecar into the image at build time (manifest-pinned, sha256-verified) so discovery works without runtime egress to GitHub.
* **2026-07-08:** - Rebase to Alpine 3.24. Use the distro onnxruntime so the discovery/recommendation features work on musl.
* **2026-04-24:** - Make waveform data persistent.
* **2026-04-20:** - Fix perms on rust binaries.
* **2026-04-07:** - Add ffmpeg and yt-dlp.
* **2026-04-06:** - Rebase to Alpine 3.23.
* **2024-06-27:** - Rebase to Alpine 3.20.
* **2023-12-12:** - Rebase to Alpine 3.19, move binaries to /app.
* **2023-07-05:** - Deprecate armhf. As announced [here](https://www.linuxserver.io/blog/a-farewell-to-arm-hf)
* **2023-02-13:** - Rebase to Alpine 3.17, migrate to s6v3.
* **2022-04-05:** - Move `sync` folder to `/config`.
* **2022-04-02:** - Rebase to alpine 3.15. Fix ffmpeg download.
* **2021-05-17:** - Deprecating the env vars `USER`, `PASSWORD` and `USE_JSON` as mStream v5 requires the use of `config.json`.
* **2021-01-23:** - Rebasing to alpine 3.13.
* **2020-06-01:** - Rebasing to alpine 3.12.
* **2019-12-19:** - Rebasing to alpine 3.11.
* **2019-06-28:** - Rebasing to alpine 3.10.
* **2019-05-18:** - Inital Release
