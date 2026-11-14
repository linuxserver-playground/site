---
image: "foldingathome"
section: "migration-from-version-7-6"
title: "Migration from version 7.6"
order: 2
---
Version 8 of fah-client has been rewritten and has some breaking changes that we can't automatically mitigate in this container.

Unlike v7, v8 no longer bundles a local webgui. The web app is loaded from an online source and can only auto-detect instances that are running on the same machine (bare metal) as the browser. This is not possible in a docker container. Therefore, upgrading to v8 requires registering for an online account, retrieving the account token and setting it in the new env var `ACCOUNT_TOKEN`, along with a friendly name in `MACHINE_NAME`.
