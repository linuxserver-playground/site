---
image: "ffmpeg"
section: "versions"
title: "Versions"
order: 3
---
* **12.10.26:** - Bump ffmpeg to 9.0.2. Also bump aom, fdk-aac, fribidi, harfbuzz, Intel drivers and libs, libdovi, libpng, libvmaf, mesa, shaderc, srt, vpx and vulkan-sdk. Make builds more resilient (curl retry).
* **05.08.26:** - Rebase to Ubuntu Resolute. Bump ffmpeg to 9.0. Also bump harfbuzz, Intel drivers and libs, lame, libdav1d, libdovi, libvidstab, mesa, nvcodec, opus, rist, shaderc, srt, svtav1 and vulkan sdk.
* **25.06.26:** - Bump ffmpeg to 8.1.2. Also bump aom, harfbuzz, libass, libdrm, libvmaf, mesa, rist and vulkan sdk.
* **02.05.26:** - Bump ffmpeg to 8.1. Also bump aom, freetype, harfbuzz, Intel drivers and libs, libdovi, libdrm, libplacebo, libpng, mesa, rist, shaderc, srt, svtav1 and x265.
* **06.03.26:** - Add support for SoX Resampler. Bump freetype, harfbuzz, Intel drivers and libs, libplacebo, libpng, mesa, shaderc, svtav1, vpx, vulkan-sdk and vvenc.
* **06.01.26:** - Remove mpp from aarch64 build due to upstream DMCA removal. Bump harfbuzz, libdav1d, libdrm, libpng, libva, libvpl, mesa, opus, shaderc and vulkan-sdk.
* **01.12.25:** - Bump ffmpeg to 8.0.1.
* **19.11.25:** - Bump aom, freetype, harfbuzz, Intel drivers and libs, kvazaar, libdav1d, libdrm, mesa, mpp, openjpeg, shaderc, svt-av1 and vulkan-sdk.
* **23.08.25:** - Bump ffmpeg to 8.0. Bump harfbuzz, Intel drivers and libs, libdovi, libdrm, libpng, mesa, ogg, rav1e, shaderc, svt-av1, vulkan-sdk, webp and zimg.
* **06.08.25:** - Bump svt-av1.
* **07.06.25:** - Bump harfbuzz, libass, libdovi, libplacebo, libpng, mesa, rav1e, shaderc, libvpx and vulkan-sdk.
* **04.06.25:** - Add libdrm and rkmpp to arm64 image.
* **21.04.25:** - Bump aom, Intel drivers and libs, harfbuzz, mesa, svt-av1, libvpx, libtheora, vulkan-sdk and vvenc.
* **07.03.25:** - Bump ffmpeg to 7.1.1, Bump aom, fontconfig, Intel drivers and libs, harfbuzz, libdav1d, libdovi, libdrm, liblc3, libpng, mesa, openjpeg, shaderc, svt-av1, vulkan-sdk, vvenc and webp.
* **26.11.24:** - Bump libaom, mesa, rist, srt and libx265.
* **07.11.24:** - Bump harfbuzz, Intel drivers and libs, libdav1d, mesa, svtav1, vpx, vulkan sdk and vvenc.
* **05.10.24:** - Add support for libvvenc on aarch64. Bump mesa.
* **30.09.24:** - Bump ffmpeg for 7.1. Add support for libvvenc (amd64 only) and liblc3. Bump libfribidi and libharfbuzz.
* **24.09.24:** - Let ffmpeg terminate gracefully on docker stop/restart. Bump libharfbuzz, libpng, mesa, shaderc and libx265.
* **09.09.24:** - Add libzmq.
* **31.08.24:** - Bump libaom, libdrm, libvpl, mesa and svtav1. Enable nvdec/nvenc on arm64 (untested).
* **17.08.24:** - Bump ffmpeg, freetype, libdovi and mesa.
* **14.08.24:** - Add SRT and libRIST.
* **01.08.24:** - Add libdav1d. Bump libharfbuzz, various Intel drivers and libs, libass, libdrm, libplacebo, libva, mesa, svtav1, and vulkan sdk.
* **21.06.24:** - Bump mesa and libaom. Update lib path for rav1e.
* **08.06.24:** - Bump ffmpeg, fribidi, libdrm, mesa and vpx.
* **26.05.24:** - Rebase to Ubuntu Noble. Bump libass, libharfbuzz and vulkan-sdk.
* **22.05.24:** - Bump Mesa to 24.1.0.
* **20.05.24:** - Bump libsvtav1.
* **09.05.24:** - Bump libaom, fribidi, kvazaar, various Intel drivers and libs, Mesa, opus, shaderc, webp and x265.
* **11.04.24:** - Explicitly disable libdrm on aarch64, add new lib `libxcb-shm0`. Add quick test at the end of build.
* **10.04.24:** - Compile ffmpeg with `libfribidi`, `libharfbuzz` and `libfontconfig`, compile libharfbuzz.
* **05.04.24:** - Bump ffmpeg to 7.0, bump libdovi, libva, mesa and vulkan-sdk.
* **16.03.24:** - Bump libaom, mesa, openjpeg, opus, shaderc and svtav1.
* **11.02.24:** - Add Zimg support.
* **09.02.24:** - Bump ffmpeg to 6.1.1, bump other deps.
* **08.02.24:** - Enable cuda-llvm, clean up rustc.
* **01.02.24:** - Bump Mesa to v24.
* **21.01.24:** - Add alsa support.
* **18.01.24:** - Let the wrapper pass the ffmpeg exit code to docker run. Bump various libs.
* **01.01.24:** - Add rav1e support. Bump libaom, fdkaac, libdrm, libvmaf, libvpl, mesa and svt-av1.
* **06.12.23:** - Add libplacebo and libdobi to x86_64.
* **05.12.23:** - Bump Mesa. Fix vdpau. Fix AMD VAAPI.
* **25.11.23:** - Compile Mesa from source. Add proper Vulkan support (env var `ENABLE_VULKAN=true` no longer needed)(tested with Intel).
* **22.11.23:** - Add shaderc and (preliminary) Vulkan support (via env var `ENABLE_VULKAN=true`) to x86_64. Bump Intel drivers and other libs.
* **13.11.23:** - Bump FFmpeg to 6.1.
* **02.11.23:** - Remove `--enable-small` from ffmpeg build options to add back some features.
* **05.10.23:** - Add support for SVT-AV1. Update various libraries.
* **16.08.23:** - Added support for WebP formats.
* **11.08.23:** - Add optional i965 driver for gen5+ support.
* **14.06.23:** - Switch to latest iHD for Intel, add qsv support.
* **13.06.23:** - Bump to 6.0, update shared libraries, deprecate armhf, combine bin stage.
* **14.12.22:** - Rebase to Jammy, bump to 5.1.2.
* **19.06.22:** - Rebase to Focal.
* **26.08.21:** - Add support for libOpenCL.
* **01.07.21:** - Bump to 4.4.
* **17.06.20:** - Bump to 4.3.
* **16.06.20:** - Add support for libvmaf.
* **01.08.19:** - Initial release.
