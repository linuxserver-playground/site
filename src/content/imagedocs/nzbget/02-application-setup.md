---
image: "nzbget"
section: "application-setup"
title: "Application Setup"
order: 2
---
Webui can be found at `<your-ip>:6789` and the default login details (change ASAP) are

`login:nzbget, password:tegbzn6789`

To allow scheduling, from the webui set the time correction value in settings/logging.

You can add an additional mount point for intermediate unpacking folder with:-

`-v /path/to/nzbget/intermediate:/intermediate`

for example, and changing the setting for InterDir in the PATHS tab of settings to `/intermediate`

### Media folders

We have set `/downloads` as optional path, this is because it is the easiest way to get started. While easy to use, it has some drawbacks. Mainly losing the ability to hardlink (TL;DR a way for a file to exist in multiple places on the same file system while only consuming one file worth of space), or atomic move (TL;DR instant file moves, rather than copy+delete) files while processing content.

Use the optional path if you don't understand, or don't want hardlinks/atomic moves.

<details>
<summary>Well planned paths</summary>

The folks over at servarr.com wrote a good [write-up](https://wiki.servarr.com/docker-guide#consistent-and-well-planned-paths) on how to get started with this.
</details>
