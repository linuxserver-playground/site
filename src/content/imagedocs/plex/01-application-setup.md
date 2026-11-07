---
image: "plex"
section: "application-setup"
title: "Application Setup"
order: 1
---
Webui can be found at `<your-ip>:32400/web`

> [!NOTE]
> **Updates**
>
> If there is no value set for the VERSION variable, then no updates will take place.

> [!NOTE]
> **New users**
>
> For new users, no updates will take place on the first run of the container as there is no preferences file to read your token from, to update restart the Docker container after logging in through the webui.

Valid settings for VERSION are:-

> [!NOTE]
> **Plexpass**
>
> YOU CANNOT UPDATE TO A PLEXPASS ONLY (BETA) VERSION IF YOU ARE NOT LOGGED IN WITH A PLEXPASS ACCOUNT.

+ **`docker`**: Let Docker handle the Plex Version, we keep our Dockerhub Endpoint up to date with the latest public builds. This is the same as leaving this setting out of your create command.
+ **`latest`**: will update plex to the latest version available that you are entitled to.
+ **`public`**: will update plexpass users to the latest public version, useful for plexpass users that don't want to be on the bleeding edge but still want the latest public updates.
+ **`<specific-version>`**: will select a specific version (eg 0.9.12.4.1192-9a47d21) of plex to install, note you cannot use this to access plexpass versions if you do not have plexpass.

### Hardware Acceleration

Many desktop applications need access to a GPU to function properly and even some Desktop Environments have compositor effects that will not function without a GPU. However this is not a hard requirement and all base images will function without a video device mounted into the container.

#### Intel/ATI/AMD

To leverage hardware acceleration you will need to mount /dev/dri video device inside of the container.

```text
--device=/dev/dri:/dev/dri
```

We will automatically ensure the abc user inside of the container has the proper permissions to access this device.

#### Nvidia

Hardware acceleration users for Nvidia will need to install the container runtime provided by Nvidia on their host, instructions can be found here:
https://github.com/NVIDIA/nvidia-container-toolkit

We automatically add the necessary environment variable that will utilise all the features available on a GPU on the host. Once nvidia-container-toolkit is installed on your host you will need to re/create the docker container with the nvidia container runtime `--runtime=nvidia` and add an environment variable `-e NVIDIA_VISIBLE_DEVICES=all` (can also be set to a specific gpu's UUID, this can be discovered by running `nvidia-smi --query-gpu=gpu_name,gpu_uuid --format=csv` ). NVIDIA automatically mounts the GPU and drivers from your host into the container.

#### Arm Devices

Best effort is made to install tools to allow mounting in /dev/dri on Arm devices. In most cases if /dev/dri exists on the host it should just work. If running a Raspberry Pi 4 be sure to enable `dtoverlay=vc4-fkms-v3d` in your usercfg.txt.
