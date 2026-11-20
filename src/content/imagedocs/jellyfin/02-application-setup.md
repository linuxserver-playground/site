---
image: "jellyfin"
section: "application-setup"
title: "Application Setup"
order: 2
---
Webui can be found at `http://<your-ip>:8096`

More information can be found on the official documentation [here](https://jellyfin.org/docs/general/quick-start.html).

### Hardware Acceleration Enhancements

This section lists the enhancements we have made for hardware acceleration in this image specifically.

### Intel

To enable the OpenCL based DV, HDR10 and HLG tone-mapping, please refer to the OpenCL-Intel mod from here:

https://mods.linuxserver.io/?mod=jellyfin

And follow this guide even if you are using iGPU: https://jellyfin.org/docs/general/administration/hardware-acceleration/intel/#configure-and-verify-lp-mode-on-linux

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
