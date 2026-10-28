---
image: "kimai"
section: "application-setup"
title: "Application Setup"
order: 1
---
### Configure your database connection

You have to replace the following values with your defaults:

* the database username "your_db_user"
* the database password "your_db_pass"
* the database schema name "your_db_name"
* the database host or IP "your_db_host"
* the database character set "your_db_charset" (usually "utf8")
* the database version "your_db_version"
  * run `SELECT VERSION();` in your MariaDB/MySQL database to get the version
  * example for [MariaDB](https://www.doctrine-project.org/projects/doctrine-dbal/en/current/reference/configuration.html#mariadb) use "10.11.4-MariaDB-log"
  * example for [MySQL](https://www.doctrine-project.org/projects/doctrine-dbal/en/current/reference/configuration.html#mysql) use "8.0.32"
* you might have to adapt port "3306" as well

```env
DATABASE_URL=mysql://your_db_user:your_db_pass@your_db_host:3306/your_db_name?charset=your_db_charset&serverVersion=your_db_version
````

### Create your first user

```shell
docker exec -it kimai console kimai:user:create your_username admin@example.com ROLE_SUPER_ADMIN
```

### Initial setup

Access the web gui at `http://<your-ip>:80`, for more information check out [Kimai Initial setup](https://www.kimai.org/documentation/initial-setup.html).
