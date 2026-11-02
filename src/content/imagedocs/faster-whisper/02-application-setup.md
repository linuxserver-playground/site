---
image: "faster-whisper"
section: "application-setup"
title: "Application Setup"
order: 2
---
For use with Home Assistant [Assist](https://www.home-assistant.io/voice_control/voice_remote_local_assistant/), add the Wyoming integration and supply the hostname/IP and port that Whisper is running add-on."

When using the `gpu` tag with Nvidia GPUs, make sure you set the container to use the `nvidia` runtime and that you have the [Nvidia Container Toolkit](https://github.com/NVIDIA/nvidia-container-toolkit) installed on the host and that you run the container with the correct GPU(s) exposed. See the [Nvidia Container Toolkit docs](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/sample-workload.html) for more details.

For more information see the [faster-whisper docs](https://github.com/SYSTRAN/faster-whisper),
