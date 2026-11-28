---
image: "mariadb"
section: "versions"
title: "Versions"
order: 13
---
* **2026-07-05:** - Rebase to Alpine 3.24.
* **2026-02-14:** - Rebase to Alpine 3.23. Add ability to pass CLI options to mariadbd.
* **2025-07-09:** - Rebase to Alpine 3.22.
* **2025-01-11:** - Add log rotation, follow the instructions in the container log.
* **2025-01-06:** - Rebase to Alpine 3.21.
* **2024-05-31:** - Rebase to Alpine 3.20.
* **2023-12-23:** - Rebase to Alpine 3.19.
* **2023-06-09:** - Update lc_messages path in shipped custom.cnf to match upstream.
* **2023-05-25:** - Rebase to Alpine 3.18, deprecate armhf.
* **2023-02-04:** - Minor updates to defaults in custom.cnf.
* **2023-01-31:** - Rebase to 3.17.
* **2022-12-09:** - Add upgrade check warning.
* **2022-10-11:** - Rebase master to Alpine 3.16, migrate to s6v3, remove password escape logic which caused problems for a small subset of users.
* **2021-07-06:** - Rebase master to alpine.
* **2021-07-03:** - Rebase to 3.14.
* **2021-02-08:** - Fix new installs.
* **2021-02-08:** - Rebase to alpine. Add mariadb-backup.
* **2021-02-08:** - Release alpine tag. The alpine release will replace the latest tag in the near future.
* **2019-10-27:** - Bump to 10.4, ability use custom sql on initial init ,defining root passwords via file.
* **2019-03-23:** - Switching to new Base images, shift to arm32v7 tag.
* **2019-03-07:** - Add ability to setup a database and default user on first spinup.
* **2019-01-26:** - Add pipeline logic and multi arch.
* **2018-09-10:** - Rebase to ubuntu bionic and use 10.3 MariaDB repository.
* **2017-12-09:** - Fix continuation lines.
* **2017-09-12:** - Gracefully shut down MariaDB.
* **2016-10-27:** - Implement linting suggestions on database init script.
* **2016-10-11:** - Rebase to ubuntu xenial, add version labelling.
* **2016-03-09:** - Update to MariaDB 10.1. Change to use custom.cnf over my.cnf in /config. Restructured init files to change config options on startup, rather than in the dockerfile.
* **2016-01-26:** - Change user of mysqld_safe script to abc, better unclean shutdown handling on restart.
* **2015-12-23:** - Remove autoupdating, between some version updates the container breaks.
* **2015-08-12:** - Initial Release.
