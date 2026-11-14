---
image: "faster-whisper"
section: "parameters"
title: "Parameters"
order: 5
---
Containers are configured using parameters passed at runtime (such as those above). These parameters are separated by a colon and indicate `<external>:<internal>` respectively. For example, `-p 8080:80` would expose port `80` from inside the container to be accessible from the host's IP on port `8080` outside the container.

| Parameter | Function |
| :----: | --- |
| `-p 10300:10300` | Wyoming connection port. |
| `-e PUID=1000` | for UserID - see below for explanation |
| `-e PGID=1000` | for GroupID - see below for explanation |
| `-e TZ=Etc/UTC` | specify a timezone to use, see this [list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List). |
| `-e DEBUG=` | If set to `true`, or any other value, the container will output debug logs. |
| `-e LOCAL_ONLY=` | If set to `true`, or any other value, the container will not attempt to download models from HuggingFace and will only use locally-provided models. |
| `-e WHISPER_BEAM=1` | Number of candidates to consider simultaneously during transcription. |
| `-e WHISPER_LANG=auto` | Two character code for the language that you will speak to the add-on. |
| `-e WHISPER_MODEL=auto` | Whisper model that will be used for transcription. From [here](https://github.com/SYSTRAN/faster-whisper/blob/master/faster_whisper/utils.py#L11-L31). |
| `-v /config` | Local path for Whisper config files. |
| `--read-only=true` | Run container with a read-only filesystem. Please [read the docs](https://linuxserver-playground.github.io/site/docs/misc/read-only/). |
