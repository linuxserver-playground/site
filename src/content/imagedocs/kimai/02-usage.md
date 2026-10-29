---
image: "kimai"
section: "usage"
title: "Usage"
order: 2
---
To help you get started creating a container from this image you can either use docker-compose or the docker cli.

> [!NOTE]
> Unless a parameter is flagged as 'optional', it is *mandatory* and a value must be provided.

### docker-compose (recommended, [click here for more info](https://linuxserver-playground.github.io/site/docs/general/docker-compose))

```yaml
---
services:
  kimai:
    image: ghcr.io/linuxserver-playground/kimai:latest
    container_name: kimai
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - APP_SECRET=
      - DATABASE_URL=mysql://your_db_user:your_db_pass@your_db_host:3306/your_db_name?charset=your_db_charset&serverVersion=your_db_version
      - TRUSTED_HOSTS=kimai.example.com
      - TRUSTED_PROXIES=127.0.0.1/32 #optional
    volumes:
      - /path/to/kimai/config:/config
    ports:
      - 80:80
      - 443:443
    restart: unless-stopped

# This container requires an external application to be run separately.
# MariaDB
  mariadb:
    image: lscr.io/linuxserver/mariadb:latest
    container_name: mariadb
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Etc/UTC
      - MYSQL_ROOT_PASSWORD=ROOT_ACCESS_PASSWORD
      - MYSQL_DATABASE=your_db_name #optional
      - MYSQL_USER=your_db_user #optional
      - MYSQL_PASSWORD=your_db_pass #optional
    volumes:
      - path_to_data:/config
    ports:
      - 3306:3306
    restart: unless-stopped
```

### docker cli ([click here for more info](https://docs.docker.com/engine/reference/commandline/cli/))

```bash
docker run -d \
  --name=kimai \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e APP_SECRET= \
  -e DATABASE_URL=mysql://your_db_user:your_db_pass@your_db_host:3306/your_db_name?charset=your_db_charset&serverVersion=your_db_version \
  -e TRUSTED_HOSTS=kimai.example.com \
  -e TRUSTED_PROXIES=127.0.0.1/32 `#optional` \
  -p 80:80 \
  -p 443:443 \
  -v /path/to/kimai/config:/config \
  --restart unless-stopped \
  ghcr.io/linuxserver-playground/kimai:latest

# This container requires an external application to be run separately.
docker run -d \
  --name=mariadb \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e MYSQL_ROOT_PASSWORD=ROOT_ACCESS_PASSWORD \
  -e MYSQL_DATABASE=your_db_name `#optional` \
  -e MYSQL_USER=your_db_user `#optional` \
  -e MYSQL_PASSWORD=your_db_pass `#optional` \
  -p 3306:3306 \
  -v path_to_data:/config \
  --restart unless-stopped \
  lscr.io/linuxserver/mariadb:latest
```
