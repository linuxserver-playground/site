---
image: "socket-proxy"
section: "versions"
title: "Versions"
order: 8
---
* **18.08.26:** - Add `ALLOW_ARCHIVE`, `ALLOW_CHANGES`, `ALLOW_EXPORT`, `ALLOW_LOGS`, `ALLOW_TOP` options.
* **15.06.26:** - Rebase to Alpine 3.24.
* **13.06.26:** - Add libpod API support for Podman via `LIBPOD_*` environment variables.
* **24.02.26:** - Add `ALLOW_PAUSE` and `ALLOW_UNPAUSE`.
* **26.12.25:** - Rebase to Alpine 3.23.
* **19.08.25:** - Add tzdata for localised logging timestamps.
* **03.06.25:** - Rebase to Alpine 3.22. Add RISCV support.
* **08.04.25:** - Add `LOG_LEVEL` back.
* **06.04.25:** - Switch back to haproxy for better handling of `docker exec` connection hijacking.
* **02.01.25:** - Support custom read timeout values.
* **05.12.24:** - Rebase to Alpine 3.21.
* **26.08.24:** - Change `ALLOW_START`, `ALLOW_STOP`, and `ALLOW_RESTARTS` to work even with `POST=0`.
* **24.05.24:** - Rebase to Alpine 3.20.
* **15.04.24:** - Allow disabling IPv6 support for legacy devices.
* **08.04.24:** - Use nginx due to haproxy's wonky websockets handling.
* **07.04.24:** - Initial Release.
