---
image: "foldingathome"
section: "gpu-hardware-acceleration"
title: "GPU Hardware Acceleration"
order: 3
---
### Nvidia

Hardware acceleration users for Nvidia will need to install the container runtime provided by Nvidia on their host, instructions can be found here:
https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html
We automatically add the necessary environment variable that will utilise all the features available on a GPU on the host. Once nvidia container toolkit is installed on your host you will need to re/create the docker container with the nvidia container runtime `--runtime=nvidia` and add an environment variable `-e NVIDIA_VISIBLE_DEVICES=all` (can also be set to a specific gpu's UUID, this can be discovered by running `nvidia-smi --query-gpu=gpu_name,gpu_uuid --format=csv` ). NVIDIA automatically mounts the GPU and drivers from your host into the foldingathome docker container.
