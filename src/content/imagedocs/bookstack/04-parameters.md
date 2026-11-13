---
image: "bookstack"
section: "parameters"
title: "Parameters"
order: 4
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 6875:80` | http/s web interface. |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e APP_URL=` | The protocol, IP/URL, and port that your application will be accessed on (ie. `http://192.168.1.1:6875` or `https://bookstack.mydomain.com` |
| `-e APP_KEY=` | Session encryption key. You will need to generate this with `docker run -it --rm --entrypoint /bin/bash lscr.io/linuxserver/bookstack:latest appkey` |
| `-e DB_HOST=` | The database instance hostname |
| `-e DB_PORT=3306` | Database port |
| `-e DB_USERNAME=` | Database user |
| `-e DB_PASSWORD=` | Database password (minimum 4 characters & non-alphanumeric passwords must be properly escaped.) |
| `-e DB_DATABASE=` | Database name |
| `-e QUEUE_CONNECTION=` | Set to `database` to enable async actions like sending email or triggering webhooks. See [documentation](https://www.bookstackapp.com/docs/admin/email-webhooks/#async-action-handling). |
| `-v /config` | Persistent config files |
| `--read-only=true` | Run container with a read-only filesystem. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/read-only/). |
