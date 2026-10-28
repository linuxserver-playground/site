---
image: "piper"
section: "parameters"
title: "Parameters"
order: 4
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 10200:10200` | Wyoming connection port. |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e PIPER_VOICE=en_US-lessac-medium` | The [Piper voice](https://huggingface.co/rhasspy/piper-voices/tree/main) to use, in the format `<language>-<name>-<quality>` |
| `-e LOCAL_ONLY=` | If set to `true`, or any other value, the container will not attempt to download models from HuggingFace and will only use locally-provided models. |
| `-e PIPER_LENGTH=1.0` | Voice speaking rate, 1.0 is default with < 1.0 being faster and > 1.0 being slower. |
| `-e PIPER_NOISE=0.667` | Controls the variability of the voice by adding noise. Values above 1 will start to degrade audio. |
| `-e PIPER_NOISEW=0.333` | Controls the variability of speaking cadence. Values above 1 produce extreme stutters and pauses. |
| `-e PIPER_SPEAKER=0` | Speaker number to use if the voice supports multiple speakers. |
| `-e NO_STREAMING=` | Setting to `true`, or any other value, will disable support for streaming audio on sentence boundaries. |
| `-v /config` | Local path for piper config files. |
| `--read-only=true` | Run container with a read-only filesystem. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/read-only/). |
