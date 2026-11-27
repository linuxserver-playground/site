---
image: "unifi-network-application"
section: "versions"
title: "Versions"
order: 11
---
* **2026-07-14:** - Rebase to Ubuntu Resolute.
* **2026-04-20:** - Bump JRE to v25 to support v10.3+ of the application.
* **2025-10-20:** - Switch to using FW API endpoint for version checks.
* **2025-05-08:** - Update sample `init-mongo.sh` for compatibility with 9.1.120 (only affects new installs).
* **2025-02-13:** - Revert JRE to 17.
* **2025-02-12:** - Bump JRE to 21.
* **2024-08-11:** - **Important**: The mongodb init instructions have been updated to enable auth ([RBAC](https://www.mongodb.com/docs/manual/core/authorization/#role-based-access-control)). We have been notified that if RBAC is not enabled, the official mongodb container allows remote access to the db contents over port 27017 without credentials. If you set up the mongodb container with the old instructions we provided, you should not map or expose port 27017. If you would like to enable auth, the easiest way is to create new instances of both unifi and mongodb with the new instructions and restore unifi from a backup.
* **2024-08-11:** - Rebase to Ubuntu Noble.
* **2024-03-04:** - Install from zip package instead of deb.
* **2023-10-17:** - Add environment variables for TLS and authSource to support Atlas and new MongoDB versions.
* **2023-09-05:** - Initial release.
