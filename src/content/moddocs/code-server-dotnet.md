---
branch: "code-server-dotnet"
---
The [current release and all current lts releases](https://dotnet.microsoft.com/download/dotnet-core) will be made available inside the container (5.0.101, 3.1.404 and 2.1.811 as of 2020/12/13).

The binaries are accessible at `/dotnet_<sdkversion>/dotnet` for each respective version.

The current version binary is symlinked from `/usr/local/bin/dotnet` so it can be called via `dotnet` from anywhere.
