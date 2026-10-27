---
image: "foldingathome"
section: "application-setup"
title: "Application Setup"
order: 1
---
This image sets up the Folding@home client. The interface is available at [https://app.foldingathome.org](https://app.foldingathome.org).

Before setting up this container, please register for an account on [https://app.foldingathome.org](https://app.foldingathome.org) and retrieve the account token shown in the account settings. That value should be populated in the `ACCOUNT_TOKEN` env var.

Once the container is created with the token and the machine name, the instance should be listed in the web app and can be controlled there.

Afterwards, the `ACCOUNT_TOKEN` and the `MACHINE_NAME` vars can be removed as the instance will already be associated with the online account and the info stored in the config folder.
