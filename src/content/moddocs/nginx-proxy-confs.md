---
branch: "nginx-proxy-confs"
---
This mod does some reshuffling to the files that originally ships with our Nginx image. You have to track changes to these files yourself. If you are adding this mod to an existing install you have to modify, or replace these files yourself.

| File | Change |
| --- | --- |
| site-confs/default | Added include directives to load the files from proxy-confs/ |
| nginx.conf | Moved some directives to proxy.conf. Added the required map for websockets |
| proxy.conf | Direct copy from SWAG |
| ssl.conf | Based on the same file from SWAG, but changed certificate location |
