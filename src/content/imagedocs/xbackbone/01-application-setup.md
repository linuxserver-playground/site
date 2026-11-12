---
image: "xbackbone"
section: "application-setup"
title: "Application Setup"
order: 1
---
Access the WebUI at \<your-ip>:80/443. Follow the installation wizard. For more information, check out [XBackBone](https://github.com/SergiX44/XBackBone).

If you want to change the PHP max upload size you can override the php.ini file by adding options in `/config/php/php-local.ini`

Example:

```ini
  upload_max_filesize = 25M
  post_max_size = 25M
```

For reverse proxying, remember to change the `base_url` in `/config/www/xbackbone/config.php` to your domain if you initially set up the application with a local url. E.g. `'base_url' => 'https://images.yourdomain.com',`
