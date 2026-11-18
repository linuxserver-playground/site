---
image: "sealskin"
section: "clients"
title: "Clients"
order: 2
---
| Client | Where | Notes |
| --- | --- | --- |
| Chrome, Edge, Brave and other Chromium browsers | [Chrome Web Store](https://chromewebstore.google.com/detail/sealskin-isolation/lclgfmnljgacfdpmmmjmfpdelndbbfhk) | Full feature set, works with the self-signed certificate. |
| Firefox | [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/sealskin-isolation/) | Requires a trusted certificate. |
| iOS | [App Store](https://apps.apple.com/us/app/sealskin/id6758210210) | Requires a trusted certificate. |
| Android | [Google Play](https://play.google.com/store/apps/details?id=io.linuxserver.sealskin) | Requires a trusted certificate. |
| Any browser | `https://<server>:8443/` | The web app: launcher, sessions, files and dashboard with nothing installed. Requires a trusted certificate. |

>[!NOTE]
>If you are not using a trusted SSL certificate (the default is self signed in `/config/ssl`) then only the Chrome extension can be used, and whatever port is mapped to 8000 must also be reachable so it can fall back to E2EE over HTTP. Firefox, the mobile apps and the web app enforce HTTPS.
