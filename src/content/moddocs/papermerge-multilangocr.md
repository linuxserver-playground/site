---
branch: "papermerge-multilangocr"
---
In papermerge/paperless-ng/x docker arguments, set an environment variable `DOCKER_MODS=ghcr.io/linuxserver-playground/mods:papermerge-multilangocr` to enable this mod.

Then set an environment variable named `OCRLANG` and set it to the language codes that follow `tesseract-ocr-` from [this page](https://packages.ubuntu.com/focal/tesseract-ocr-all). You can add multiple codes that are comma separated, with no spaces.

For example, if you want to enable OCR for Chinese Simple and Belarusian, you'd set the var as `-e OCRLANG="chi-sim,bel"`.
