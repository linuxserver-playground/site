---
title: Container Branding
description: How to replace the LinuxServer.io branding in the init logs when you build on our base images or fork an image.
section: general
order: 9
updated: 2026-10-24
aliases:
  - /general/container-branding/
---
If you use our base images for your own projects, or fork our downstream images to modify them, you're probably aware that we ask you to change the branding that appears in the container init logs to make it clear that your image is not associated with us. This is for your benefit as much as ours: we aren't well-equipped to provide your users with support, and you don't want them crediting us for your work.

If you build from one of our base images and don't change anything, your init logs will look something like this:

![Default Container Branding](./lsio-branding1.png)

If you want to add your own branding, when using our base images or a forked downstream one, just place a file called `branding` containing the text you want to use into the `/etc/s6-overlay/s6-rc.d/init-adduser` folder of your image. The branding file will replace the highlighted section of the init:

![Default Container Branding with Hightlights](./lsio-branding2.png)

On start-up, the base image will automatically load the branding into its init, allowing you to inflict whatever ASCII art you like on your users:

![Custom Container Branding](./lsio-branding3.png)

Hopefully this makes it simpler for everyone to manage the branding of your images when using our bases.

> [!NOTE] `LSIO_FIRST_PARTY`
> Our own application images are marked as first party with the environment variable `LSIO_FIRST_PARTY=true`. It is not written in any Dockerfile: the [shared build workflow](https://github.com/linuxserver-playground/workflows) injects `ENV LSIO_FIRST_PARTY=true` after `FROM` when it builds a non-base image. A fork that builds with its own pipeline, or with a plain `docker build`, does not get it, so the base image will not overwrite your branding. If you do copy our workflow, or build an image that has the variable set, set `ENV LSIO_FIRST_PARTY=false` in your Dockerfile to keep your own branding.

A final note: if you've previously overridden the `init-adduser` run file to do custom branding, we recommend switching to the above approach so that you don't miss out on any future changes to that init step.
