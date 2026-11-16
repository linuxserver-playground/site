---
image: "radarr"
section: "application-setup"
title: "Application Setup"
order: 2
---
Access the webui at `<your-ip>:7878`, for more information check out [Radarr](https://github.com/Radarr/Radarr).

### Media folders

We have set `/movies` and `/downloads` as optional paths, this is because it is the easiest way to get started. While easy to use, it has some drawbacks. Mainly losing the ability to hardlink (TL;DR a way for a file to exist in multiple places on the same file system while only consuming one file worth of space), or atomic move (TL;DR instant file moves, rather than copy+delete) files while processing content.

Use the optional paths if you don't understand, or don't want hardlinks/atomic moves.

<details>
<summary>Well planned paths</summary>

The folks over at servarr.com wrote a good [write-up](https://wiki.servarr.com/docker-guide#consistent-and-well-planned-paths) on how to get started with this.
</details>
