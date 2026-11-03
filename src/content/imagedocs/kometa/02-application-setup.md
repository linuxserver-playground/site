---
image: "kometa"
section: "application-setup"
title: "Application Setup"
order: 2
---
There is a [walkthrough](https://kometa.wiki/en/latest/kometa/install/docker/#setting-up-the-initial-config-file) available to help get you up and running.

This image supports all of the environment variables listed [here](https://kometa.wiki/en/latest/kometa/environmental/) and all commandline arguments.

To perform a one-time run use `docker run` (or `docker compose run`) with the `--rm`, and `-e KOMETA_RUN=True` or `--run` arguments. This will cause the container to process your config immediately instead of waiting for the scheduled time, and delete the old container after completion.

For more information see the [official wiki](https://kometa.wiki).
