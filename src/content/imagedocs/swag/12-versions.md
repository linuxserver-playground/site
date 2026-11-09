---
image: "swag"
section: "versions"
title: "Versions"
order: 12
---
* **2026-10-20:** - [Existing users should update:](https://github.com/linuxserver/docker-swag/blob/master/README.md#updating-configs) proxy.conf, authelia-server.conf, authentik-server.conf, tinyauth-server.conf - Update Nginx configuration to replace $http_host with $host$is_request_port$request_port for better compatibility.
* **2026-09-09:** - Use new X-Tinyauth-Location header in Tinyauth locations and remove duplicate auth module headers.
* **2026-07-19:** - Rebase to Alpine 3.24 with PHP 8.5.
* **2026-07-10:** - Add support for Let's Encrypt cert profiles. Run certbot twice daily with a random delay.
* **2026-06-19:** - Add support for mijn.host dns validation.
* **2026-06-01:** - Remove obsolete old cert check logic.
* **2026-01-23:** - Reorder init to fix proxy conf version checks.
* **2025-12-21:** - Add support for hetzner-cloud dns validation.
* **2025-11-04:** - Switch default Gandi credentials from API Key to Token, allow DNS propagation time for Azure DNS plugin.
* **2025-07-18:** - Rebase to Alpine 3.22 with PHP 8.4. Add QUIC support. Drop PHP bindings for mcrypt as it is no longer maintained.
* **2025-05-05:** - Disable Certbot's built in log rotation.
* **2025-01-19:** - Add [Auto Reload](https://github.com/linuxserver/docker-mods/tree/swag-auto-reload) functionality to SWAG.
* **2024-12-17:** - Rebase to Alpine 3.21.
* **2024-10-21:** - Fix naming issue with Dynu plugin. If you are using Dynu, please make sure your credentials are set in /config/dns-conf/dynu.ini and your DNSPLUGIN variable is set to dynu (not dynudns).
* **2024-08-30:** - Fix zerossl cert revocation.
* **2024-07-24:** - Rebase to Alpine 3.20. Remove deprecated Google Domains certbot plugin. Existing users should update their nginx confs to avoid http2 deprecation warnings.
* **2024-07-01:** - Fall back to iptables-legacy if iptables doesn't work.
* **2024-03-23:** - Fix perms on the generated `priv-fullchain-bundle.pem`.
* **2024-03-14:** - [Existing users should update:](https://github.com/linuxserver/docker-swag/blob/master/README.md#updating-configs) authelia-location.conf, authelia-server.conf - Update Authelia conf samples with support for 4.38.
* **2024-03-11:** - Restore support for DynuDNS using `certbot-dns-dynudns`.
* **2024-03-06:** - [Existing users should update:](https://github.com/linuxserver/docker-swag/blob/master/README.md#updating-configs) site-confs/default.conf - Cleanup default site conf.
* **2024-03-04:** - Remove `stream.conf` inside the container to allow users to include their own block in `nginx.conf`.
* **2024-01-23:** - Rebase to Alpine 3.19 with php 8.3, add root periodic crontabs for logrotate.
* **2024-01-01:** - Add GleSYS DNS plugin.
* **2023-12-11:** - Deprecate certbot-dns-dynu to resolve dependency conflicts with other plugins.
* **2023-11-30:** - [Existing users should update:](https://github.com/linuxserver/docker-swag/blob/master/README.md#updating-configs) site-confs/default.conf - Fix index.php being downloaded on 404.
* **2023-11-23:** - Run certbot as root to allow fix http validation.
* **2023-10-01:** - Fix "unrecognized arguments" issue in DirectAdmin DNS plugin.
* **2023-08-28:** - Add Namecheap DNS plugin.
* **2023-08-12:** - Add FreeDNS plugin. Detect certbot DNS authenticators using CLI.
* **2023-08-07:** - Add Bunny DNS Configuration.
* **2023-07-27:** - Added support for dreamhost validation.
* **2023-05-25:** - Rebase to Alpine 3.18, deprecate armhf.
* **2023-04-27:** - [Existing users should update:](https://github.com/linuxserver/docker-swag/blob/master/README.md#updating-configs) authelia-location.conf, authelia-server.conf, authentik-location.conf, authentik-server.conf - Simplify auth configs and fix Set-Cookie header bug.
* **2023-04-13:** - [Existing users should update:](https://github.com/linuxserver/docker-swag/blob/master/README.md#updating-configs) nginx.conf, authelia-location.conf, authentik-location.conf, and site-confs/default.conf - Move ssl.conf include to default.conf. Remove Authorization headers in authelia. Sort proxy_set_header in authelia and authentik.
* **2023-03-25:** - Fix renewal post hook.
* **2023-03-10:** - Cleanup unused csr and keys folders. See [certbot 2.3.0 release notes](https://github.com/certbot/certbot/releases/tag/v2.3.0).
* **2023-03-09:** - Add Google Domains DNS support, `google-domains`.
* **2023-03-02:** - Set permissions on crontabs during init.
* **2023-02-09:** - [Existing users should update:](https://github.com/linuxserver/docker-swag/blob/master/README.md#updating-configs) proxy.conf, authelia-location.conf and authelia-server.conf - Add Authentik configs, update Authelia configs.
* **2023-02-06:** - Add porkbun support back in.
* **2023-01-21:** - Unpin certbot version (allow certbot 2.x). !!BREAKING CHANGE!! We are temporarily removing the certbot porkbun plugin until a new version is released that is compatible with certbot 2.x.
* **2023-01-20:** - Rebase to alpine 3.17 with php8.1.
* **2023-01-16:** - Remove nchan module because it keeps causing crashes.
* **2022-12-08:** - Revamp certbot init.
* **2022-12-03:** - Remove defunct cloudxns plugin.
* **2022-11-22:** - Pin acme to the same version as certbot.
* **2022-11-22:** - Pin certbot to 1.32.0 until plugin compatibility improves.
* **2022-11-05:** - Update acmedns plugin handling.
* **2022-10-06:** - Switch to certbot-dns-duckdns. Update cpanel and gandi dns plugin handling. Minor adjustments to init logic.
* **2022-10-05:** - Use certbot file hooks instead of command line hooks
* **2022-10-04:** - Add godaddy and porkbun dns plugins.
* **2022-10-03:** - Add default_server back to default site conf's https listen.
* **2022-09-22:** - Added support for DO DNS validation.
* **2022-09-22:** - Added certbot-dns-acmedns for DNS01 validation.
* **2022-08-20:** - [Existing users should update:](https://github.com/linuxserver/docker-swag/blob/master/README.md#updating-configs) nginx.conf - Rebasing to alpine 3.15 with php8. Restructure nginx configs ([see changes announcement](https://info.linuxserver.io/issues/2022-08-20-nginx-base)).
* **2022-08-10:** - Added support for Dynu DNS validation.
* **2022-05-18:** - Added support for Azure DNS validation.
* **2022-04-09:** - Added certbot-dns-loopia for DNS01 validation.
* **2022-04-05:** - Added support for standalone DNS validation.
* **2022-03-28:** - created a logfile for fail2ban nginx-unauthorized in /etc/cont-init.d/50-config
* **2022-01-09:** - Added a fail2ban jail for nginx unauthorized
* **2021-12-21:** - Fixed issue with iptables not working as expected
* **2021-11-30:** - Move maxmind to a [new mod](https://github.com/linuxserver/docker-mods/tree/swag-maxmind)
* **2021-11-22:** - Added support for Infomaniak DNS for certificate generation.
* **2021-11-20:** - Added support for dnspod validation.
* **2021-11-15:** - Added support for deSEC DNS for wildcard certificate generation.
* **2021-10-26:** - [Existing users should update:](https://github.com/linuxserver/docker-swag/blob/master/README.md#updating-configs) proxy.conf - Mitigate <https://httpoxy.org/> vulnerabilities. Ref: <https://www.nginx.com/blog/mitigating-the-httpoxy-vulnerability-with-nginx#Defeating-the-Attack-using-NGINX-and-NGINX-Plus>
* **2021-10-23:** - Fix Hurricane Electric (HE) DNS validation.
* **2021-10-12:** - Fix deprecated LE root cert check to fix failures when using `STAGING=true`, and failures in revoking.
* **2021-10-06:** - Added support for Hurricane Electric (HE) DNS validation. Added lxml build deps.
* **2021-10-01:** - Check if the cert uses the old LE root cert, revoke and regenerate if necessary. [Here's more info](https://twitter.com/letsencrypt/status/1443621997288767491) on LE root cert expiration
* **2021-09-19:** - Add an optional header to opt out of Google FLoC in `ssl.conf`.
* **2021-09-17:** - Mark `SUBDOMAINS` var as optional.
* **2021-08-01:** - Add support for ionos dns validation.
* **2021-07-15:** - Fix libmaxminddb issue due to upstream change.
* **2021-07-07:** - Rebase to alpine 3.14.
* **2021-06-24:** - Update default nginx conf folder.
* **2021-05-28:** - [Existing users should update:](https://github.com/linuxserver/docker-swag/blob/master/README.md#updating-configs) authelia-server.conf - Use `resolver.conf` and patch for `CVE-2021-32637`.
* **2021-05-20:** - Modify resolver.conf generation to detect and ignore ipv6.
* **2021-05-14:** - [Existing users should update:](https://github.com/linuxserver/docker-swag/blob/master/README.md#updating-configs) nginx.conf, ssl.conf, proxy.conf, and the default site-conf - Rework nginx.conf to be inline with alpine upstream and relocate lines from other files. Use linuxserver.io wheel index for pip packages. Switch to using [ffdhe4096](https://ssl-config.mozilla.org/ffdhe4096.txt) for `dhparams.pem` per [RFC7919](https://datatracker.ietf.org/doc/html/rfc7919). Added `worker_processes.conf`, which sets the number of nginx workers, and `resolver.conf`, which sets the dns resolver. Both conf files are auto-generated only on first start and can be user modified later.
* **2021-04-21:** - [Existing users should update:](https://github.com/linuxserver/docker-swag/blob/master/README.md#updating-configs) authelia-server.conf and authelia-location.conf - Add remote name/email headers and pass http method.
* **2021-04-12:** - Add php7-gmp and php7-pecl-mailparse.
* **2021-04-12:** - Add support for vultr dns validation.
* **2021-03-14:** - Add support for directadmin dns validation.
* **2021-02-12:** - Clean up rust/cargo cache, which ballooned the image size in the last couple of builds.
* **2021-02-10:** - Fix aliyun, domeneshop, inwx and transip dns confs for existing users.
* **2021-02-09:** - Rebasing to alpine 3.13. Add nginx mods brotli and dav-ext. Remove nginx mods lua and lua-upstream (due to regression over the last couple of years).
* **2021-01-26:** - Add support for hetzner dns validation.
* **2021-01-20:** - Add check for ZeroSSL EAB retrieval.
* **2021-01-08:** - Add support for getting certs from [ZeroSSL](https://zerossl.com/) via optional `CERTPROVIDER` env var. Update aliyun, domeneshop, inwx and transip dns plugins with the new plugin names. Hide `donoteditthisfile.conf` because users were editing it despite its name. Suppress harmless error when no proxy confs are enabled.
* **2021-01-03:** - [Existing users should update:](https://github.com/linuxserver/docker-swag/blob/master/README.md#updating-configs) /config/nginx/site-confs/default.conf - Add helper pages to aid troubleshooting
* **2020-12-10:** - Add support for njalla dns validation
* **2020-12-09:** - Check for template/conf updates and notify in the log. Add support for gehirn and sakuracloud dns validation.
* **2020-11-01:** - Add support for netcup dns validation
* **2020-10-29:** - [Existing users should update:](https://github.com/linuxserver/docker-swag/blob/master/README.md#updating-configs) ssl.conf - Add frame-ancestors to Content-Security-Policy.
* **2020-10-04:** - [Existing users should update:](https://github.com/linuxserver/docker-swag/blob/master/README.md#updating-configs) nginx.conf, proxy.conf, and ssl.conf - Minor cleanups and reordering.
* **2020-09-20:** - [Existing users should update:](https://github.com/linuxserver/docker-swag/blob/master/README.md#updating-configs) nginx.conf - Added geoip2 configs. Added MAXMINDDB_LICENSE_KEY variable to readme.
* **2020-09-08:** - Add php7-xsl.
* **2020-09-01:** - [Existing users should update:](https://github.com/linuxserver/docker-swag/blob/master/README.md#updating-configs) nginx.conf, proxy.conf, and various proxy samples - Global websockets across all configs.
* **2020-08-03:** - Initial release.
