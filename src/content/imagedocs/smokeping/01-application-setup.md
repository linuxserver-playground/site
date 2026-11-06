---
image: "smokeping"
section: "application-setup"
title: "Application Setup"
order: 1
---
* Once running, the URL will be `http://<host-ip>/smokeping/smokeping.cgi`. For example, a full URL might look like `https://smokeping.yourdomain.com/smokeping/smokeping.cgi`.
* Basic setup: edit the `Targets` file to ping the hosts you're interested in to match the format found there.
* Wait 10 minutes.
* To reload the configuration without restarting the container, run `docker exec smokeping pkill -f -HUP '/usr/bin/perl /usr/s?bin/smokeping(_cgi)?'`, where `smokeping` is the container ID.
* To restart the container, run `docker restart smokeping`, where `smokeping` is the container ID.
* Note that the default `Targets` file includes items that may or may not work. These are simply to provide examples of configuration.
* Slave setup: modify the `Targets`, `Slaves`, and `smokeping_secrets` files on the master host, per [the documentation](https://manpages.ubuntu.com/manpages/trusty/en/man7/smokeping_master_slave.7.html).
