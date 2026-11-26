---
image: "speedtest-tracker"
section: "parameters"
title: "Parameters"
order: 3
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 80:80` | Web UI |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e APP_KEY=` | App key used for encrypting stored data. You can generate a key as per [https://speedtest-tracker.dev](https://docs.speedtest-tracker.dev/getting-started/installation/using-docker-compose#install-with-docker-compose) |
| `-e APP_URL=` | The IP:port or URL your application will be accessed on (ie. `http://192.168.1.1:6875` or `https://bookstack.mydomain.com` |
| `-e DB_CONNECTION=sqlite` | Set the database type to use. `sqlite`, `pgsql`, or `mysql` |
| `-e SPEEDTEST_SCHEDULE=` | Set the test schedule in cron format. e.g. `0 */6 * * *` |
| `-e SPEEDTEST_SERVERS=` | A comma-separated list of server IDs to test against. Run `docker run -it --rm --entrypoint /bin/bash lscr.io/linuxserver/speedtest-tracker:latest list-servers` to get a list of nearby servers. |
| `-e DB_HOST=` | Database hostname (postgres/mysql). |
| `-e DB_PORT=` | Database port (postgres/mysql). |
| `-e DB_DATABASE=` | Database name (postgres/mysql). |
| `-e DB_USERNAME=` | Database username (postgres/mysql). |
| `-e DB_PASSWORD=` | Database password (postgres/mysql). |
| `-e DISPLAY_TIMEZONE=Etc/UTC` | Timezone for the UI. |
| `-e PRUNE_RESULTS_OLDER_THAN=0` | Days to keep test results. |
| `-v /config` | Contains speedtest-tracker config and database, if using sqlite. |
