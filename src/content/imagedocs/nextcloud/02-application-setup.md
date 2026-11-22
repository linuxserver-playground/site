---
image: "nextcloud"
section: "application-setup"
title: "Application Setup"
order: 2
---
Access the webui at `https://<your-ip>:443`, for more information check out [Nextcloud](https://nextcloud.com/).

Note: `occ` should be run without prepending with `sudo -u abc php` or `sudo -u www-data php` ie; `docker exec -it nextcloud occ maintenance:mode --off`

### Updating Nextcloud

Updating Nextcloud is done by pulling the new image, and recreating the container with it.

It is only possible to upgrade one major version at a time. For example, if you want to upgrade from version 14 to 16, you will have to upgrade from version 14 to 15, then from 15 to 16.

Since all data is stored in the `/config` and `/data` volumes, nothing gets lost. The startup script will check for the version in your volume and the installed docker version. If it finds a mismatch, it automatically starts the upgrade process.

### Collaborative Editing

Nextcloud's built-in collaborative editing packages (Collabora/CODE and OnlyOffice) only work on x86_64 systems with glibc, and therefore they are not compatible with our images. You should create separate containers for them and set them up in Nextcloud with their respective connector addons.

If (auto) installed, those built-in packages may cause instability and should be removed.

### HEIC Image Previews

In order to enable HEIC image preview generation you will need to add the following to your `config.php` file in your `config/www/nextcloud/config' directory;

```
  'enable_previews' => true,
  'enabledPreviewProviders' =>
  array (
    'OC\Preview\PNG',
    'OC\Preview\JPEG',
    'OC\Preview\GIF',
    'OC\Preview\BMP',
    'OC\Preview\XBitmap',
    'OC\Preview\MP3',
    'OC\Preview\TXT',
    'OC\Preview\MarkDown',
    'OC\Preview\OpenDocument',
    'OC\Preview\Krita',
    'OC\Preview\HEIC',
  ),
```

You may need to log out and back in for the changes to come in to effect.

This fix was sourced from [Nextcloud Documentation](https://docs.nextcloud.com/server/latest/admin_manual/configuration_server/config_sample_php_parameters.html#enabledpreviewproviders)

Nextcloud state that HEIC preview is disabled by default due to performance or privacy concerns, so enable this at your own risk.

### Custom App Directories

If you are [using custom app directories](https://docs.nextcloud.com/server/latest/admin_manual/apps_management.html#using-custom-app-directories) you will need to make the custom folder(s) you are using available to the web server. The recommended way to do this with our container is to add a volume. Ex:

```yaml
    volumes:
      - /path/to/your_custom_apps_folder:/app/www/public/your_custom_apps_folder
```

Afterwards, you can set `"path" => OC::$SERVERROOT . "/your_custom_apps_folder",` in your `config.php` file, per the [official documentation](https://docs.nextcloud.com/server/latest/admin_manual/apps_management.html#using-custom-app-directories).

### Strict reverse proxies

This image uses a self-signed certificate by default. This naturally means the scheme is `https`.
If you are using a reverse proxy which validates certificates, you need to [disable this check for the container](https://linuxserver-playground.github.io/site/docs/faq#strict-proxy).
