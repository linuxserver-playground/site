---
image: "wireguard"
section: "server-mode"
title: "Server Mode"
order: 3
---
If the environment variable `PEERS` is set to a number or a list of strings separated by comma, the container will run in server mode and the necessary server and peer/client confs will be generated. The peer/client config qr codes will be output in the docker log if `LOG_CONFS` is set to `true`. They will also be saved in text and png format under `/config/peerX` in case `PEERS` is a variable and an integer or `/config/peer_X` in case a list of names was provided instead of an integer.

Variables `SERVERURL`, `SERVERPORT`, `INTERNAL_SUBNET`, `PEERDNS`, `INTERFACE`, `ALLOWEDIPS` and `PERSISTENTKEEPALIVE_PEERS` are optional variables used for server mode. Any changes to these environment variables will trigger regeneration of server and peer confs. Peer/client confs will be recreated with existing private/public keys. Delete the peer folders for the keys to be recreated along with the confs.

To add more peers/clients later on, you increment the `PEERS` environment variable or add more elements to the list and recreate the container.

To display the QR codes of active peers again, you can use the following command and list the peer numbers as arguments: `docker exec -it wireguard /app/show-peer 1 4 5` or `docker exec -it wireguard /app/show-peer myPC myPhone myTablet` (Keep in mind that the QR codes are also stored as PNGs in the config folder).

The templates used for server and peer confs are saved under `/config/templates`. Advanced users can modify these templates and force conf generation by deleting `/config/wg_confs/wg0.conf` and restarting the container.

The container managed server conf is hardcoded to `wg0.conf`. However, the users can add additional tunnel config files with `.conf` extensions into `/config/wg_confs/` and the container will attempt to start them all in alphabetical order. If any one of the tunnels fail, they will all be stopped and the default route will be deleted, requiring user intervention to fix the invalid conf and a container restart.
