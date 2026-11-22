---
image: "swag"
section: "parameters"
title: "Parameters"
order: 4
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 443:443` | HTTPS port |
| `-p 80:80` | HTTP port (required for HTTP validation and HTTP -> HTTPS redirect) |
| `-p 443:443/udp` | QUIC (HTTP/3) port. Must be enabled in the default and proxy confs. |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e URL=example.com` | Top url you have control over (e.g. `example.com` if you own it, or `customsubdomain.example.com` if dynamic dns). |
| `-e VALIDATION=http` | Certbot validation method to use, options are `http` or `dns` (`dns` method also requires `DNSPLUGIN` variable set). |
| `-e SUBDOMAINS=www,` | Subdomains you'd like the cert to cover (comma separated, no spaces) ie. `www,ftp,cloud`. For a wildcard cert, set this *exactly* to `wildcard` (wildcard cert is available via `dns` validation only) |
| `-e CERTPROVIDER=` | Optionally define the cert provider. Set to `zerossl` for ZeroSSL certs (requires existing [ZeroSSL account](https://app.zerossl.com/signup) and the e-mail address entered in `EMAIL` env var). Otherwise defaults to Let's Encrypt. |
| `-e CERT_PROFILE=` | Optionally define a cert profile to use for cert generation. This is useful if you want to use a custom cert profile instead of the default one. Currently only supported for Let's Encrypt. See https://letsencrypt.org/docs/profiles/  |
| `-e DNSPLUGIN=cloudflare` | Required if `VALIDATION` is set to `dns`. Options are `acmedns`, `aliyun`, `azure`, `bunny`, `cloudflare`, `cpanel`, `desec`, `digitalocean`, `directadmin`, `dnsimple`, `dnsmadeeasy`, `dnspod`, `do`, `domeneshop`, `dreamhost`, `duckdns`, `dynu`, `freedns`, `gandi`, `gehirn`, `glesys`, `godaddy`, `google`, `he`, `hetzner`, `hetzner-cloud`, `infomaniak`, `inwx`, `ionos`, `linode`, `loopia`, `luadns`, `mijn-host`, `namecheap`, `netcup`, `njalla`, `nsone`, `ovh`, `porkbun`, `rfc2136`, `route53`, `sakuracloud`, `standalone`, `transip`, and `vultr`. Also need to enter the credentials into the corresponding ini (or json for some plugins) file under `/config/dns-conf`. |
| `-e PROPAGATION=` | Optionally override (in seconds) the default propagation time for the dns plugins. |
| `-e EMAIL=` | Optional e-mail address used for cert expiration notifications (Required for ZeroSSL). |
| `-e ONLY_SUBDOMAINS=false` | If you wish to get certs only for certain subdomains, but not the main domain (main domain may be hosted on another machine and cannot be validated), set this to `true` |
| `-e EXTRA_DOMAINS=` | Additional fully qualified domain names (comma separated, no spaces) ie. `example.net,subdomain.example.net,*.example.org` |
| `-e STAGING=false` | Set to `true` to retrieve certs in staging mode. Rate limits will be much higher, but the resulting cert will not pass the browser's security test. Only to be used for testing purposes. |
| `-e DISABLE_F2B=` | Set to `true` to disable the Fail2ban service in the container, if you're already running it elsewhere or using a different IPS. |
| `-e SWAG_AUTORELOAD=` | Set to `true` to enable automatic reloading of confs on change without stopping/restarting nginx. Your filesystem must support inotify. This functionality was previously offered [via mod](https://github.com/linuxserver/docker-mods/tree/swag-auto-reload). |
| `-e SWAG_AUTORELOAD_WATCHLIST=` | A [pipe](https://en.wikipedia.org/wiki/Vertical_bar)-separated list of additional folders for auto reload to watch in addition to `/config/nginx` |
| `-v /config` | Persistent config files |
| `--read-only=true` | Run container with a read-only filesystem. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/read-only/). |
| `--cap-add=NET_ADMIN` | Required for fail2Ban to be able to modify iptables rules. |

### Portainer notice

This image utilises `cap_add` or `sysctl` to work properly. This is not implemented properly in some versions of Portainer, thus this image may not work if deployed through Portainer.
