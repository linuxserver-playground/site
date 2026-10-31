---
image: "lsio-api"
section: "usage"
title: "Usage"
order: 1
---
The container can be run locally:

```
docker run -d \
--name=lsioapi \
-e PUID=1000 \
-e PGID=1000 \
-e TZ=Etc/UTC \
-e CI=0 `#optional` \
-e DB_FILE=/config/api.db `#optional` \
-e INVALIDATE_HOURS=24 `#optional` \
-e PAT=token `#optional` \
-e SCARF_TOKEN=token `#optional` \
-e URL=http://localhost:8000 `#optional` \
-p 8000:8000 \
-v /path/to/lsio-api/config:/config \
--restart unless-stopped \
lscr.io/linuxserver/lsio-api:latest
```

The following line is only in this repo for loop testing:

- { date: "01.01.50:", desc: "I am the release message for this internal repo." }
