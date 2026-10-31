---
image: "syslog-ng"
section: "application-setup"
title: "Application Setup"
order: 1
---
Edit `/config/syslog-ng.conf` to configure your logging sources and destinations.

The application pid, control file, etc. are all kept in /config so when using tools such as `syslog-ng-ctl` you need to specify the path e.g. `syslog-ng-ctl reload -c /config/syslog-ng.ctl`

More info at [syslog-ng](https://www.syslog-ng.com/technical-documents/list/syslog-ng-open-source-edition).
