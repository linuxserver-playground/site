---
image: "planka"
section: "application-setup"
title: "Application Setup"
order: 1
---
Web UI is accessible at http://SERVERIP:PORT. An external postgres database is required.

Once you've run your first time setup you can safely remove the DEFAULT_ environment variables. They will overwrite any changes made to the default user in the web UI (passwords, display names, etc.) on startup if left in place.

### Migration from Official Image

Copy your `user-avatars`, `background-images`, and `attachments` folders to your new `/config` mount so that it looks like:

```text
/config
├── attachments
└── images
    ├── background-images
    └── user-avatars
```
