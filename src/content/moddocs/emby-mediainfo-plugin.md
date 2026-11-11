---
branch: "emby-mediainfo-plugin"
---
Supports the Ubuntu version of the Emby container.  This mod will only work on amd64 because the Roku BIF file creation tool is compiled only for Linux x86 64-bit machines.  See https://developer.roku.com/en-gb/docs/developer-program/media-playback/trick-mode/bif-file-creation.md for more information.

In Emby Docker arguments, set an environment variable `DOCKER_MODS=ghcr.io/linuxserver-playground/mods:emby-mediaserver`, such as:
- docker-compose:
  ```yaml
  environment:
    - DOCKER_MODS=ghcr.io/linuxserver-playground/mods:emby-mediainfo-plugin
  ```
- docker cli:
  ```sh
  -e DOCKER_MODS=ghcr.io/linuxserver-playground/mods:emby-mediainfo-plugin
  ```

# Settings in Emby
Configure the Media Toolbox plugin, applications installed will be located as follows:
- MediaInfoCL in `/usr/bin/mediainfo`
- MKVPropEdit in `/usr/bin/mkvpropedit`
- BifTool in `/usr/bin/biftool`
