---
branch: "swag-dbip"
---
This mod downloads the `dbip-country-lite.mmdb` database under `/config/geoip2db` and updates it weekly
through the container's periodic cron. On first run it copies a default `/config/nginx/dbip.conf`.

**This mod should not be enabled together with the swag-maxmind or swag-ipinfo mods.**

Follow these steps to enable the dbip mod:

1. Set `DOCKER_MODS=ghcr.io/linuxserver-playground/mods:swag-dbip` on the container and recreate it.
2. Add the following line to `/config/nginx/nginx.conf` under the `http` section:

   ```nginx
   include /config/nginx/dbip.conf;
   ```
3. Edit `/config/nginx/dbip.conf` and add countries to the blocklist / whitelist according to the comments,
   for example:

   ```nginx
   map $geoip2_data_country_iso_code $geo-whitelist {
       default no;
       UK yes;
   }

   map $geoip2_data_country_iso_code $geo-blacklist {
       default yes;
       US no;
   }
   ```
4. Use the definitions in your server blocks:

   ```nginx
   server {
       listen 443 ssl;
       listen [::]:443 ssl;

       server_name some-app.*;
       include /config/nginx/ssl.conf;
       client_max_body_size 0;

       if ($lan-ip = yes) { set $geo-whitelist yes; }
       if ($geo-whitelist = no) { return 404; }

       location / {
   ```

   Or, for a blacklist with both some countries and continents:

   ```nginx
       if ($lan-ip = yes) { set $geo-blacklist yes; }
       if ($geo-blacklist = no) { return 404; }
       if ($continent-blacklist = no) { return 404; }
   ```
5. Restart the container to apply the changes.
