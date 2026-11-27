---
image: "mstream"
section: "important-notice"
title: "IMPORTANT NOTICE:"
order: 2
---
mStream v5 no longer accepts cli arguments for setting the user and password and requires the use of `config.json`. Therefore, the environment variables `USER`, `PASSWORD` and `USE_JSON` are deprecated.

v4's `config.json` is not compatible with v5. Existing `config.json` will be renamed to `config.json.v4-bak` for your reference and a new default `config.json` will be created upon upgrade from v4 to v5.
