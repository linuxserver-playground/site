---
image: "yq"
section: "support-info"
title: "Support Info"
order: 3
---
* image version number
  * `docker inspect -f '{{ index .Config.Labels "build_version" }}' linuxserver/yq`
