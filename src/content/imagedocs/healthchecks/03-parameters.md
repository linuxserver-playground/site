---
image: "healthchecks"
section: "parameters"
title: "Parameters"
order: 3
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 8000:8000` | Healthchecks Web UI |
| `-p 2525:2525` | Port for inbound SMTP pings |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e SECRET_KEY=` | A secret key used for cryptographic signing. Will generate a random value if one is not supplied and save it to `/config/local_settings.py`. |
| `-e SITE_ROOT=` | The site's top-level URL and the port it listens to if different than 80 or 443 (e.g., https://healthchecks.example.com:8000). |
| `-e SITE_NAME=` | The site's name (e.g., "Example Corp HealthChecks"). |
| `-e SUPERUSER_EMAIL=` | Superuser email. |
| `-e SUPERUSER_PASSWORD=` | Superuser password. |
| `-e ALLOWED_HOSTS=` | A comma-separated list of valid hostnames for the server. Default is the domain portion of `SITE_ROOT`. |
| `-e APPRISE_ENABLED=False` | Set to `True` to enable the Apprise integration (https://github.com/caronc/apprise). |
| `-e CSRF_TRUSTED_ORIGINS=` | A [list](https://docs.python.org/3/tutorial/introduction.html#lists) of trusted origins for unsafe requests (e.g. POST). Defaults to the value of `SITE_ROOT`. |
| `-e DEBUG=True` | Set to `False` to disable. Debug mode relaxes CSRF protections and increases logging verbosity but should be disabled for production instances as it will impact performance and security. |
| `-e DEFAULT_FROM_EMAIL=` | From email for alerts. |
| `-e EMAIL_HOST=` | SMTP host. |
| `-e EMAIL_PORT=` | SMTP port. |
| `-e EMAIL_HOST_USER=` | SMTP user. |
| `-e EMAIL_HOST_PASSWORD=` | SMTP password. |
| `-e EMAIL_USE_TLS=` | Use TLS for SMTP (`True` or `False`). |
| `-e INTEGRATIONS_ALLOW_PRIVATE_IPS=` | Defaults to False. Set to True to allow integrations to connect to private IP addresses. |
| `-e PING_EMAIL_DOMAIN=` | The domain to use for generating ping email addresses. Defaults to `localhost`. |
| `-e RP_ID=` | If using webauthn for 2FA set this to match your Healthchecks domain. Webauthn will only work over https. |
| `-e SITE_LOGO_URL=` | Full URL to custom site logo. |
| `-v /config` | Persistent config files. |
