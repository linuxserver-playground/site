---
image: "limnoria"
section: "application-setup"
title: "Application Setup"
order: 1
---
### New Configuration

If you do not have an existing config you will need to start the container and then run the following wizard command:

`docker exec -it -w /config -u abc limnoria limnoria-wizard`

### Existing Configuration

If you have an existing config, adjust the directory settings in your conf file as follows:

```conf
supybot.directories.backup: /config/backup
supybot.directories.conf: /config/conf
supybot.directories.data: /config/data
supybot.directories.data.tmp: /config/data/tmp
supybot.directories.data.web: /config/web
supybot.directories.log: /config/logs
supybot.directories.plugins: /config/plugins
```

NOTE: These are not grouped together in the file. You will need to search your conf file for the variables.

Then place your conf file and any of your existing directories in /config and start up the container.

### Plugin Requirements

The container will pip install any requirements.txt it finds in the /config/plugins folder on startup.

If you install a plugin using the PluginDownloader that includes a requirements.txt you can
execute a shell into the container and then use `pip install /config/plugins/ThePlugin/requirements.txt`
or restart the container and the requirements will be installed.
