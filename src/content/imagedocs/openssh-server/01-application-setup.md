---
image: "openssh-server"
section: "application-setup"
title: "Application Setup"
order: 1
---
If `PUBLIC_KEY` or `PUBLIC_KEY_FILE`, or `PUBLIC_KEY_DIR` variables are set, the specified keys will automatically be added to `authorized_keys`. If not, the keys can manually be added to `/config/.ssh/authorized_keys` and the container should be restarted.
Removing `PUBLIC_KEY` or `PUBLIC_KEY_FILE` variables from docker run environment variables will not remove the keys from `authorized_keys`. `PUBLIC_KEY_FILE` and `PUBLIC_KEY_DIR` can be used with docker secrets.

We provide the ability to set and allow password based access via the `PASSWORD_ACCESS` and `USER_PASSWORD` variables, though we as an organization discourage using password auth for public facing ssh endpoints.

Connect to server via `ssh -i /path/to/private/key -p PORT USER_NAME@SERVERIP`

Setting `SUDO_ACCESS` to `true` by itself will allow passwordless sudo. `USER_PASSWORD` and `USER_PASSWORD_FILE` allow setting an optional sudo password.

The users only have access to the folders mapped and the processes running inside this container.
Add any volume mappings you like for the users to have access to.
To install packages or services for users to access, use the LinuxServer container customization methods described [in this blog article](https://blog.linuxserver.io/2019/09/14/customizing-our-containers/).

Sample use case is when a server admin would like to have automated incoming backups from a remote server to the local server, but they might not want all the other admins of the remote server to have full access to the local server.
This container can be set up with a mounted folder for incoming backups, and rsync installed via LinuxServer container customization described above, so that the incoming backups can proceed, but remote server and its admins' access would be limited to the backup folder.

It is also possible to run multiple copies of this container with different ports mapped, different folders mounted and access to different private keys for compartmentalized access.

#### TIPS
You can volume map your own text file to `/etc/motd` to override the message displayed upon connection.
You can optionally set the docker argument `hostname`
