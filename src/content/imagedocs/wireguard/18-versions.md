---
image: "wireguard"
section: "versions"
title: "Versions"
order: 18
---
* **2026-07-05:** - Rebase to Alpine 3.24.
* **2026-01-24:** - Rebase to Alpine 3.23 again as openresolv alpine 3.23 package has now been updated.
* **2026-01-22:** - Revert to Alpine 3.22 due to resolvconf bug.
* **2026-01-04:** - Rebase to Alpine 3.23.
* **2025-07-15:** - Rebase to Alpine 3.22. Remove iptables-legacy shim.
* **2025-01-01:** - Deprecate legacy branch.
* **2024-12-20:** - Rebase to Alpine 3.21.
* **2024-08-13:** - Add `errors` plugin to default Corefile.
* **2024-07-23:** - Install kmod from alpine repository.
* **2024-05-24:** - Rebase to Alpine 3.20, install wireguard-tools from Alpine repo.
* **2024-03-10:** - Use iptables-legacy on Alpine 3.19.
* **2024-03-05:** - Rebase master to Alpine 3.19.
* **2023-10-03:** - **Potentially Breaking Change:** Support for multiple interfaces added. Wireguard confs moved to `/config/wg_confs/`. Any file with a `.conf` extension in that folder will be treated as a live tunnel config and will be attempted to start. If any of the tunnels fail, all tunnels will be stopped. Tunnels are started in alphabetical order. Managed server conf will continue to be hardcoded to `wg0.conf`.
* **2023-06-28:** - Rebase master to Alpine 3.18 again.
* **2023-06-26:** - Revert master to Alpine 3.17, due to issue with openresolv.
* **2023-06-24:** - Rebase master to Alpine 3.18, deprecate armhf as per [https://www.linuxserver.io/armhf](https://www.linuxserver.io/armhf).
* **2023-04-26:** - Rework branches. Swap alpine and ubuntu builds.
* **2023-01-29:** - Rebase to alpine 3.17.
* **2023-01-10:** - Add new var to add `PersistentKeepalive` to server config for select peers to survive server IP changes when domain name is used.
* **2022-10-26:** - Better handle unsupported peer names. Improve logging.
* **2022-10-12:** - Add Alpine branch. Optimize wg and coredns services.
* **2022-10-04:** - Rebase to Jammy. Upgrade to s6v3.
* **2022-05-16:** - Improve NAT handling in server mode when multiple ethernet devices are present.
* **2022-04-23:** - Add pre-shared key support. Automatically added to all new peer confs generated, existing ones are left without to ensure no breaking changes.
* **2022-04-10:** - Rebase to Ubuntu Focal. Add `LOG_CONFS` env var. Remove deprecated `add-peer` command.
* **2021-10-28:** - Add site-to-site vpn support.
* **2021-02-11:** - Fix bug related to changing internal subnet and named peer confs not updating.
* **2020-10-06:** - Disable CoreDNS in client mode, or if port 53 is already in use in server mode.
* **2020-10-04:** - Allow to specify a list of names as PEERS and add ALLOWEDIPS environment variable. Also, add peer name/id to each one of the peer sections in wg0.conf. Important: Existing users need to delete `/config/templates/peer.conf` and restart
* **2020-09-27:** - Cleaning service binding example to have accurate PreDown script.
* **2020-08-06:** - Replace resolvconf with openresolv due to dns issues when a client based on this image is connected to a server also based on this image. Add IPv6 info to readme. Display kernel version in logs.
* **2020-07-29:** - Update Coredns config to detect dns loops (existing users need to delete `/config/coredns/Corefile` and restart).
* **2020-07-27:** - Update Coredns config to prevent issues with non-user-defined bridge networks (existing users need to delete `/config/coredns/Corefile` and restart).
* **2020-07-05:** - Add Debian updates and security repos for headers.
* **2020-06-25:** - Simplify module tests, prevent iptables issues from resulting in false negatives.
* **2020-06-19:** - Add support for Ubuntu Focal (20.04) kernels. Compile wireguard tools and kernel module instead of using the ubuntu packages. Make module install optional. Improve verbosity in logs.
* **2020-05-29:** - Add support for 64bit raspbian.
* **2020-04-28:** - Add Buster/Stretch backports repos for Debian. Tested with OMV 5 and OMV 4 (on kernel 4.19.0-0.bpo.8-amd64).
* **2020-04-20:** - Fix typo in client mode conf existence check.
* **2020-04-13:** - Fix bug that forced conf recreation on every start.
* **2020-04-08:** - Add arm32/64 builds and enable multi-arch (rpi4 with ubuntu and raspbian buster tested). Add CoreDNS for `PEERDNS=auto` setting. Update the `add-peer`/`show-peer` scripts to utilize the templates and the `INTERNAL_SUBNET` var (previously missed, oops).
* **2020-04-05:** - Add `INTERNAL_SUBNET` variable to prevent subnet clashes. Add templates for server and peer confs.
* **2020-04-01:** - Add `show-peer` script and include info on host installed headers.
* **2020-03-31:** - Initial Release.
