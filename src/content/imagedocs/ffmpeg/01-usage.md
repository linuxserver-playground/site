---
image: "ffmpeg"
section: "usage"
title: "Usage"
order: 1
---
Unlike most of our container library this image is meant to be run ephemerally from the command line parsing user input for a custom FFmpeg command. You will need to understand some Docker basics to use this image and be familiar with how to construct an FFmpeg command. In the commands below we will be bind mounting our current working directory from the CLI to /config, the assumption is that input.mkv is in your current working directory.

If an input file is detected we will run FFmpeg as that user/group so the output file will match its permissions.
The image supports Hardware acceleration on x86 pay close attention to the variables for the examples below.

### Included Intel Drivers (latest versions compiled):

* iHD Driver: Supports gen8+ (default for Intel)
* i965 Driver: Supports gen5+ (for gen5-gen9.5 it can be enabled by setting env var `LIBVA_DRIVER_NAME=i965` in docker arguments)
* Libva (VAAPI): Supports gen5+ with i965 driver and gen8+ with iHD driver
* Qsv Dispatcher: OneVPL (supports both OneVPL and MSDK runtimes and should automatically switch)
* Qsv Runtime:

    * OneVPL: Supports gen12+
    * MSDK (libmfx): Supports gen8 - gen12

### Basic Transcode

```bash
docker run --rm -it \
  -v $(pwd):/config \
  linuxserver/ffmpeg \
  -i /config/input.mkv \
  -c:v libx264 \
  -b:v 4M \
  -vf scale=1280:720 \
  -c:a copy \
  /config/output.mkv
```

### Hardware accelerated (VAAPI) ([click for more info](https://trac.ffmpeg.org/wiki/Hardware/VAAPI))

```bash
docker run --rm -it \
  --device=/dev/dri:/dev/dri \
  -v $(pwd):/config \
  linuxserver/ffmpeg \
  -vaapi_device /dev/dri/renderD128 \
  -i /config/input.mkv \
  -c:v h264_vaapi \
  -b:v 4M \
  -vf 'format=nv12|vaapi,hwupload,scale_vaapi=w=1280:h=720' \
  -c:a copy \
  /config/output.mkv
```

### Hardware accelerated (QSV) ([click for more info](https://trac.ffmpeg.org/wiki/Hardware/QuickSync))

```bash
docker run --rm -it \
  --device=/dev/dri:/dev/dri \
  -v $(pwd):/config \
  linuxserver/ffmpeg \
  -hwaccel qsv \
  -c:v h264_qsv \
  -i /config/input.mkv \
  -c:v h264_qsv \
  -global_quality 25 \
  /config/output.mkv
```

### Nvidia Hardware accelerated ([click for more info](https://trac.ffmpeg.org/wiki/HWAccelIntro#CUDANVENCNVDEC))

Nvidia support __requires__ [Nvidia container toolkit](https://github.com/NVIDIA/nvidia-container-toolkit) and the Nvidia drivers installed on the host.

```bash
docker run --rm -it \
  --runtime=nvidia \
  -v $(pwd):/config \
  linuxserver/ffmpeg \
  -hwaccel nvdec \
  -i /config/input.mkv \
  -c:v h264_nvenc \
  -b:v 4M \
  -vf scale=1280:720 \
  -c:a copy \
  /config/output.mkv
```

### Vulkan support

Vulkan support has been added to x86_64 (tested with Intel and AMD iGPU) ([click for more info](https://trac.ffmpeg.org/wiki/HWAccelIntro#Vulkan)).

```bash
docker run --rm -it \
  --device=/dev/dri:/dev/dri \
  -v $(pwd):/config \
  -e ANV_VIDEO_DECODE=1 \
  linuxserver/ffmpeg \
  -init_hw_device "vulkan=vk:0" \
  -hwaccel vulkan \
  -hwaccel_output_format vulkan \
  -i /config/input.mkv \
  -f null - -benchmark
```

#### Vulkan supports three drivers

* ANV: To enable for Intel, set the env var `ANV_VIDEO_DECODE=1`
* RADV: To enable on AMD, set the env var `RADV_PERFTEST=video_decode`
* NVIDIA: To enable on Nvidia, install Nvidia Vulkan Beta drivers on the host per [this article](https://lynne.ee/vulkan-video-decoding.html#driver-support)
