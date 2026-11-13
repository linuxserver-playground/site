---
image: "d2-builder"
section: "running-against-local-project"
title: "Running against local project"
order: 0
---
If you need to test functionality just run:

```bash
docker pull lscr.io/linuxserver/d2-builder:latest && \
docker run -d --rm -v /tmp/d2:/output -e PUID=1000 -e PGID=1000 lscr.io/linuxserver/d2-builder:latest mastodon:latest
```

Generated svg files will be created in `/output`.
