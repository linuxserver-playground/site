---
title: API
description: "The static API the hub serves at /api/v1/: the catalogue, per-image detail, builds, packages, generated documents and the store index, with the OpenAPI specification."
section: general
order: 19
group: Project
updated: 2026-10-24
aliases:
  - /API/
  - /api/
---
The fleet data behind these pages, the www site and every store template is served as a static API by the
[hub](https://linuxserver-playground.github.io/hub/) at `https://linuxserver-playground.github.io/hub/api/v1/`.
It keeps the shape of the original `api.linuxserver.io` endpoints (`/api/v1/images`, `/api/v1/images.json`,
the `.config` and `.deprecated` variants) and adds per-image detail, builds, package tables, generated
compose, Kubernetes and quadlet documents, and the store index. Because the host is static, query parameters
became files: `?include_deprecated=true` is `/api/v1/images.deprecated.json`.

The specification is published at
[`https://linuxserver-playground.github.io/hub/openapi.json`](https://linuxserver-playground.github.io/hub/openapi.json)
(also `openapi.yaml`) and the hub's own interactive page at
[`https://linuxserver-playground.github.io/hub/`](https://linuxserver-playground.github.io/hub/).

The interactive copy lives on the hub, which renders the same specification: [open the API reference](https://linuxserver-playground.github.io/hub/).
