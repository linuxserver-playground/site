---
image: "sealskin"
section: "first-run"
title: "First run"
order: 3
---
On the first start with an empty `/config` the container generates a self-signed certificate for the proxy and the server's RSA key, then the server finds no administrator and writes two credentials for the built-in `admin` account:

* `/config/root_key` is an application key for the **web app**. Open `https://<server>:8443/` and paste it in to sign in.
* `/config/admin.json` is the key file for the **browser extension and mobile apps**. If `HOST_URL` was set it can be imported as is, otherwise edit it and replace the string `HOST_URL` with your server's IP or hostname.

>[!NOTE]
>Copy both files somewhere safe and delete them from the server. They are the only copy of that private key, the server keeps just the public half.

Once signed in you can install applications from the App Store, create users and groups, and make application keys for other devices from the dashboard.

On the web the root key is the only sign-in the server handles itself. Everyone else signs in through an identity provider (OpenID Connect or SAML) or a reverse proxy that signs users in, whose groups make administrators and carry limits. See [Signing in](https://selkies-project.github.io/sealskin/signin) before inviting a second person. Extension and mobile users can also be given key files from the Users panel.
