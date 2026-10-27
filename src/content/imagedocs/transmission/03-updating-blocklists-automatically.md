---
image: "transmission"
section: "updating-blocklists-automatically"
title: "Updating Blocklists Automatically"
order: 3
---
This requires `"blocklist-enabled": true,` to be set. By setting this to true, it is assumed you have also populated `blocklist-url` with a valid block list.

The automatic update is a shell script that downloads a blocklist from the url stored in the settings.json, gunzips it, and restarts the transmission daemon.

The automatic update will run once a day at 3am local server time.
