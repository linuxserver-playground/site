---
branch: "swag-auto-reload"
---
## DEPRECATION NOTICE

### This mod is deprecated. We will not offer support for this mod and it will not be updated. This mod's functionality is now included in the SWAG image

If you'd like for Nginx to be reloaded when other files or folders are modified (not included in our default list above), set a new environment variable, `WATCHLIST`, and set it to a list of container relative paths separated by `|` like the below example:

`WATCHLIST="/config/nginx/custom.conf|/config/nginx/customfolder"`
