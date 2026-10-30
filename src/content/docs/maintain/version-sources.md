---
title: Version sources and release assets
description: Every upstream.version type with its options and an example, transforms and sanitising, require_assets, release notes sources, and how the control plane schedules from them.
section: maintain
order: 3
---
`upstream.version` says where the upstream version comes from. One resolver implements every type, [`scripts/resolve_version.py`](https://github.com/linuxserver-playground/workflows/blob/main/scripts/resolve_version.py) in the workflows repository: the build runs it in its Prepare job, and the control plane imports a byte-for-byte copy (`control/vendor/resolve_version.py`, a test fails on drift) to decide every hour whether a build is due. Change it in workflows, run `./scripts/check.sh`, push, move `v1`, then copy it into control and update the commit in the file header.

Every type resolves to a raw string, then in order: `transform` (regex substitutions), sanitising (`~ , % @ + ; : /` and spaces removed, giving `upstream_clean`, the version in the tag), semver derivation (`MAJOR.MINOR.PATCH` when present; `MAJOR.MINOR` gets the build date as patch), and `require_assets`. A release is tagged `<upstream_clean>-ls<N>`; the raw `upstream` is what the Dockerfile receives in `build.version_arg`.

Prefer a typed source to `command`. The list in CONVENTIONS §3 is the order of preference; `command` stays for what none of them can say.

## Types

Each block below is a complete `version:` value. Only the listed keys exist for each type; `transform` and `require_assets` are allowed on all of them.

### `github_release`

GitHub's latest stable release when no option is set (one API call to `releases/latest`, as Jenkins' `github_stable` did). With any option the release list is filtered instead.

```yaml
version:
  type: github_release
  repo: Sonarr/Sonarr
  prerelease: false        # true: prereleases count too (Jenkins' github_devel)
  include: '^v4\.'          # regex on the tag; only matching releases count
  exclude: '-rc'            # regex on the tag; matching releases are skipped
  sort: date                # date: newest published wins. version: the highest tag in sort -V order
```

Drafts never count. `sort: version` is for repositories whose release list is not in publication order.

### `codeberg_release`, `gitea_release`

The newest non-draft release, stable first, from the Gitea API.

```yaml
version:
  type: codeberg_release
  repo: forgejo/forgejo
```

```yaml
version:
  type: gitea_release
  base_url: https://git.eden-emu.dev
  repo: eden-emu/eden
```

### `github_commit`, `gitlab_commit`

The first 8 characters of the branch head's sha. For images that build from a branch rather than a release.

```yaml
version:
  type: github_commit
  repo: HTPC-Manager/HTPC-Manager
  branch: master2
```

```yaml
version:
  type: gitlab_commit
  project_id: 12345
  branch: main
  web_url: https://gitlab.com/group/project    # optional, for the source link
```

### `json`

Any JSON endpoint, with a `jq` expression (the `jq` binary is used).

```yaml
version:
  type: json
  url: https://services.sonarr.tv/v1/releases
  jq: .["v4-stable"].version
  sort: first               # first: the first value jq prints. version: the highest in sort -V order
```

A `jq` that prints several lines plus `sort: version` picks the highest, which is how a tag list is turned into "the newest version" without trusting its order.

### `regex`

A page or a redirect, searched with a Python regex (multiline). The version is the `version` group, else group 1, else the whole match.

```yaml
version:
  type: regex
  url: https://mirrors.mit.edu/kde/stable/digikam/
  pattern: href="\./([0-9][^/"]*)/"
  sort: version             # first: the first match. version: the highest in sort -V order
  search: body              # body: the page. url: the address the URL redirects to
```

`search: url` is for download links that only name the version in the redirect target (ubooquity).

### `npm`, `pip`

The registry's current version.

```yaml
version:
  type: npm
  package: thelounge
  dist_tag: latest          # optional
```

```yaml
version:
  type: pip
  package: certbot
```

### `alpine_apk`

A package's version in an Alpine repository. The APKINDEX of every build platform is read and must agree, otherwise the check reports "assets not ready" and tries again next hour (one arch's mirror lagging is the usual cause).

```yaml
version:
  type: alpine_apk
  repo_url: http://dl-cdn.alpinelinux.org/alpine/v3.22/community/
  package: nginx
```

### `deb_packages`

A package's version in a Debian `Packages` index.

```yaml
version:
  type: deb_packages
  index_url: https://repo.jellyfin.org/ubuntu/dists/resolute/main/binary-amd64/Packages
  package: jellyfin-server
```

### `arch_package`

A package in the Arch repositories.

```yaml
version:
  type: arch_package
  package: darktable
  repo: extra               # core, extra or multilib
  arch: x86_64
  release: false            # true: pkgver-pkgrel, so a rebuild of the same version counts. Never the epoch
```

### `deb_repo`

The md5 of `apt-cache show` for a set of packages, resolved inside a distro image. Needs docker, so **control never runs it**: these branches build only on the weekly package check.

```yaml
version:
  type: deb_repo
  image: ubuntu:noble
  sources: deb https://download.docker.com/linux/ubuntu noble stable
  packages: docker-ce docker-ce-cli containerd.io
```

### `blob`

The first 8 hex characters of the md5 of a URL's body: the version changes when the file does.

```yaml
version:
  type: blob
  url: https://example.org/latest.tar.gz
```

### `static`

A version pinned by hand. Nothing is resolved, so nothing triggers a build except a push or the package check; `require_assets` has nothing to wait for.

```yaml
version:
  type: static
  version: v0.8.134
```

### `os`

For images with no upstream application: the version is the first 8 hex characters of the md5 of `package_versions.txt`. The hourly check skips these; the weekly package check rebuilds them when packages changed.

```yaml
version:
  type: os
```

### `command`

A bash command whose last line of output is the version. The escape hatch. The build may give it `GITHUB_TOKEN`; the control plane runs it hourly as `nobody` in a sandbox with an empty environment, its own directory, ulimits, and a kill at 120 s, so it must work with no credentials and no state.

```yaml
version:
  type: command
  run: curl -s https://example.org/release.txt | tail -1
```

### `combined`

Several sources resolved one by one, each with its own `transform`, joined with `separator`. For an image whose version is made of two upstreams (docker and compose).

```yaml
version:
  type: combined
  separator: '-'
  sources:
    - type: github_release
      repo: docker/cli
      transform: [{ regex: '^v', replace: '' }]
    - type: github_release
      repo: docker/compose
      transform: [{ regex: '^v', replace: '' }]
```

`require_assets` patterns are not available on `combined` (there is no single release to read); URL templates are.

## `transform`

Regex substitutions in order, Python `re` syntax, applied to the raw value before sanitising.

```yaml
transform:
  - { regex: '^v', replace: '' }
  - { regex: '-release$', replace: '' }
```

Mind what it does to the tag: stripping a `v` changes every tag the branch publishes from `v1.2.3-ls4` to `1.2.3-ls4`, which is a deviation worth a note when converting an image.

## `require_assets`

What must exist before the resolved version counts. The scheduler records "assets not ready" and tries again next hour instead of dispatching a build that would fail; the build's own resolve step stops with the same message. Each entry is one of:

- **A URL template.** `${VERSION}` is substituted (the raw upstream version, after `transform`) and the URL must answer `HEAD` with 200. Redirects are followed. Works with every source type; a URL with no `${VERSION}` is a fixed check.
- **An asset pattern**, `{asset: <regex>}`. The resolved release's uploaded assets are read by tag, exactly as a Dockerfile reads them, and one of their file names must match. `${VERSION}` is substituted as literal text (escaped). `github_release`, `codeberg_release` and `gitea_release` only; an asset whose upload has not finished (GitHub `state: open`) does not count.

Every entry must be satisfied; the first one that is not names itself in the message. List one entry per asset the Dockerfiles download, each platform's own, so the message says which file is late or renamed:

```yaml
version:
  type: github_release
  repo: VSCodium/vscodium
  require_assets:
    - asset: '^codium_${VERSION}_amd64\.deb$'
    - asset: '^codium_${VERSION}_arm64\.deb$'
```

```yaml
version:
  type: github_release
  repo: nextcloud/server
  sort: version
  transform: [{ regex: '^v', replace: '' }]
  require_assets:
    - 'https://download.nextcloud.com/server/releases/nextcloud-${VERSION}.tar.bz2'
```

rpcs3 is the case that needs the pattern form: its tag is `build-<sha>` while the asset is `rpcs3-v0.0.43-20511-9508444d_linux64.AppImage`, so no URL can be templated from the version:

```yaml
version:
  type: github_release
  repo: RPCS3/rpcs3-binaries-linux
  require_assets:
    - asset: '_linux64\.AppImage$'
```

Its arm64 Dockerfile downloads from a different repository (`rpcs3-binaries-linux-arm64`), which the version source does not read, so that asset is not checked. Images are versioned from their x86 release by convention; an arm64 side that uses a different upstream is accepted and documented, not fixed.

Pair the check with a Dockerfile that downloads the *resolved* release, not `releases/latest`: a build dispatched for version X must not fetch X+1's assets. The pattern is a fallback for local builds plus a lookup by tag:

```dockerfile
ARG RPCS3_VERSION
RUN \
  if [ -z ${RPCS3_VERSION+x} ]; then \
    RPCS3_VERSION=$(curl -sX GET "https://api.github.com/repos/RPCS3/rpcs3-binaries-linux/releases/latest" \
      | jq -r '.tag_name'); \
  fi && \
  DOWNLOAD_URL=$(curl -sX GET "https://api.github.com/repos/RPCS3/rpcs3-binaries-linux/releases/tags/${RPCS3_VERSION}" \
    | jq -r 'first(.assets[].browser_download_url | select(test("AppImage")))') && \
  ...
```

What control does while assets are missing: the upstream check keeps its hourly interval; the release and package checks of the branch hold (a held package check keeps its weekly slot and is retried next hour); and every waiting check posts a Discord embed, amber for the first four and red from the fifth, carrying the message with the pattern and the uploaded names. Four hours of amber is an upload in progress; red is almost always a renamed asset (`.AppImage` to `.app`), fixed by updating the pattern and the Dockerfile in one commit. A build is never dispatched while the asset is known to be missing, because it would fail at its resolve step.

`builder check` rejects an asset pattern on a non-release source or one that does not compile. The legacy `external_artifact_check` is what this replaces; `builder migrate` turns its `grep` form into patterns and a plain `curl` HEAD into a URL template.

## `upstream.notes`

Where the upstream release notes shown on build pages come from. Stored verbatim with the Release and in the hub; rendered as GitHub-flavoured Markdown (or HTML from a feed) and sanitised on the site.

| Type | Keys | Notes |
| --- | --- | --- |
| `github_release`, `codeberg_release` | `repo`, `tag` | The release body. `tag` is a template for the release tag, default `${VERSION}`; `v${VERSION}` when the tag has a prefix the version lost in a `transform`. |
| `gitea_release` | `base_url`, `repo`, `tag` | Same, any Gitea. |
| `github_commit`, `gitlab_commit` | `repo` / `project_id`, `branch` | The commit message. |
| `json` | `url`, `jq` | Any JSON body. |
| `rss` | `url`, `title` | The description of the feed item whose title matches `title` (a template, `calibre ${VERSION}`; the version also matches without a leading `v` and without trailing `.0` parts). Usually HTML; stored as is. |
| `command` | `run` | A bash command; its output is the notes. |
| `none` | | No upstream notes. |

## How the control plane uses the source

- **Hourly, per live branch**, spread across the hour by a hash of `repo/branch`: resolve, read the branch's newest Release tag, dispatch `build.yml` with `reason: upstream` when they differ. Every type but `os` and `deb_repo` is resolved by control; `command` only through its sandbox.
- **No second dispatch of a branch within 2 hours** of the last one, whatever triggered it. A branch with no Release at all whose build failed is retried daily.
- **Skip flags** (set from the site's management page) hold a branch, an image or a version.
- **Resolver errors** are recorded as `error`; six in a row post one red Discord embed. **Missing assets** are `skipped` with "assets not ready" and post as described above.
- Decisions and the next 24 hours of checks are at `/api/scheduler.json` on the control plane and on the fleet pages of the site.

## Testing a source

Resolve for real, the way both the build and control do:

```bash
cd workflows
GITHUB_TOKEN=$(gh auth token) python3 scripts/resolve_version.py ../docker-<name>/image.yml
# {"upstream": "v4.0.20", "upstream_clean": "v4.0.20", "semver": "4.0.20", "source": "github_release", "source_url": "..."}
# exit 3 and "assets not ready: ..." when require_assets are not published; exit 1 on a resolver error
```

When replacing a `command` source with a typed one, compare the output with the command's before pushing. The unit tests for every type are in `tests/test_resolve_version.py` with a fake HTTP layer; add one for any new option.
