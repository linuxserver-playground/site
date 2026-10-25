---
title: API
description: "The static API at /api/v1/: the catalogue, per-image detail, builds, packages, generated documents and the store index, with the OpenAPI specification."
section: general
order: 19
group: Project
updated: 2026-10-24
aliases:
  - /API/
  - /api/
---
The data behind these pages and every store template is served as a static API at
`https://linuxserver-playground.github.io/hub/api/v1/`: the image list (`/api/v1/images.json`, with
`.config` and `.deprecated` variants), per-image detail, builds, package tables, compose, Kubernetes and
quadlet documents, and the store index.

- Reference: [linuxserver-playground.github.io/hub](https://linuxserver-playground.github.io/hub/)
- Specification: [`openapi.json`](https://linuxserver-playground.github.io/hub/openapi.json) and
  [`openapi.yaml`](https://linuxserver-playground.github.io/hub/openapi.yaml)
