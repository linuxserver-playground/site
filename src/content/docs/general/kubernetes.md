---
title: Kubernetes
description: The Kubernetes manifest published for every image, what is in it, PUID/PGID versus securityContext, storage, GPUs, host networking, and ingress for SWAG users.
section: general
order: 14
group: Other platforms
updated: 2026-10-24
aliases:
  - /general/kubernetes/
---
> [!WARNING] Reasonable endeavours
> We build and test on Docker and do not run a cluster in CI. Kubernetes is supported on a [reasonable endeavours](/docs/misc/support-policy/#reasonable-endeavours-support) basis: we will help with what the container does, not with your cluster. This page assumes you already know how to operate one.

## The generated manifest

Every image whose `image.yml` does not set `publish.kubernetes.enabled: false` has a manifest at

```
https://linuxserver-playground.github.io/hub/api/v1/catalog/<name>/kubernetes.yaml
```

(also served as `/stores/kubernetes/<name>.yaml`). It contains, in order:

| Object | Name | From the manifest |
| --- | --- | --- |
| `ConfigMap` | `<name>-env` | Every required environment variable, `PUID`, `PGID` and `TZ` included, with the documented defaults. |
| `PersistentVolumeClaim` | `<name>-config`, one per persisted path | `publish.kubernetes.persistence`, or every required volume when unset. `ReadWriteOnce`, **1Gi placeholder**. |
| `Deployment` (or `StatefulSet`) | `<name>` | One replica, `strategy: Recreate`, the image, `envFrom` the ConfigMap, the required ports and the mounts. `publish.kubernetes.workload` picks the kind. |
| `Service` | `<name>` | `ClusterIP` with every required port; omitted when the image needs host networking. |

The header is a comment block with the **security notes**: what the manifest could not decide for you. Required capabilities are set in `securityContext.capabilities.add`; `privileged` is set when the image demands it; devices, `security_opt` entries and host networking are explained but need your decision. Always read the header before applying.

```bash
curl -fsSLO https://linuxserver-playground.github.io/hub/api/v1/catalog/sonarr/kubernetes.yaml
$EDITOR sonarr.yaml          # storage size and class, timezone, anything in the header
kubectl apply -n media -f sonarr.yaml
kubectl -n media logs -f deploy/sonarr
```

The manifest has no `namespace`; apply it with `-n`. Optional volumes (`/tv`, `/downloads` in the example above) are not emitted because they are yours to shape; add them as `hostPath`, NFS or RWX claims as you see fit.

> [!TIP]
> The manifest is a starting point, not a Helm chart. Keep your edited copy (or a kustomization that patches the downloaded one) in your own repository; re-download when the image page changes its parameters.

## `PUID`/`PGID` versus `securityContext`

This is the part that trips most people, because Kubernetes and our images both have an opinion about which user runs.

Our images start as **root**. The init reads `PUID` and `PGID`, changes the internal `abc` user to those ids, fixes the ownership of `/config`, and only then starts the application as `abc`. That is why a `docker run` with `PUID=1000` leaves files on the host owned by uid 1000. It needs root for a few seconds, and the capabilities root normally has (`CHOWN`, `SETUID`, `SETGID`, `DAC_OVERRIDE`, `FOWNER`).

Kubernetes offers three knobs that interact with that:

| Setting | Effect on our images |
| --- | --- |
| `securityContext.fsGroup` | The kubelet makes the volume group-owned by that gid (and setgid) when it mounts it, for volume types that support it (most PVs and `emptyDir`; not `hostPath`). Harmless and useful: set it to the same value as `PGID`. `fsGroupChangePolicy: OnRootMismatch` skips the recursive chown on large volumes. |
| `securityContext.runAsUser` / `runAsGroup` | The container **starts** as that user, like `docker run --user`. The init cannot change ids or chown anything any more. This is our [non-root mode](/docs/misc/non-root/): `PUID`/`PGID` are ignored, you own the permissions of every mount, Docker Mods and custom services do not run. Only use it with images that state `runtime.nonroot.supported` (shown on the image page as "Non-Root Operation"). |
| `securityContext.runAsNonRoot: true` | The kubelet refuses to start a container whose image would run as root. Our images do not set `USER`, so this fails with `container has runAsNonRoot and image will run as root` unless you also set `runAsUser`. |

So, in the default mode (what the generated manifest does): leave `runAsUser` alone, keep `PUID`/`PGID` in the ConfigMap, and set `fsGroup` to match `PGID` so freshly provisioned volumes are writable before the init even runs. Do not drop `capabilities: ALL`; the init needs them.

In non-root mode:

```yaml
spec:
  securityContext:
    runAsUser: 1000
    runAsGroup: 1000
    fsGroup: 1000
    runAsNonRoot: true
  containers:
    - name: sonarr
      volumeMounts:
        - name: run
          mountPath: /run
  volumes:
    - name: run
      emptyDir:
        medium: Memory
```

Remove `PUID` and `PGID` from the ConfigMap (they would only confuse the next reader), and give s6 a writable `/run` as above. Our [non-root documentation](/docs/misc/non-root/) notes that `no-new-privileges`, which is `allowPrivilegeEscalation: false` in Kubernetes, additionally needs `/run` to be owned by the running user; an `emptyDir` is created root-owned and Kubernetes offers no way to set its owner, so test that combination per image before relying on it.

### Secrets

The ConfigMap holds every variable, defaults included, because the manifest cannot know which ones you consider secret. Move those to a `Secret` and either add it with `envFrom: [{secretRef: ...}]` or use the images' `FILE__` convention: mount the Secret as a volume and set `FILE__MYVAR=/run/secrets/myvar` in the ConfigMap, and the init reads the value from the file. See the "Environment variables from files" section on every image page.

## Storage

`/config` is a database directory for most of our applications: SQLite files, lock files, logs, a few hundred thousand small writes a day. Treat it accordingly:

* Use a block-backed storage class (`local-path` on k3s, Longhorn, Ceph RBD, a cloud disk). **NFS and SMB for `/config` are unsupported** on any platform; SQLite over NFS corrupts, and we will not debug it. Media libraries and download directories are a different matter: they are large, sequential and fine on NFS, as `ReadWriteMany` claims or plain NFS volumes shared between several pods.
* The generated claim asks for `1Gi`. Change it. Plex and Jellyfin metadata run to tens of gigabytes; the `*arr` family is usually under a few hundred megabytes.
* `strategy: Recreate` is deliberate: an `RWO` claim can be mounted by one node at a time, and a rolling update would hang waiting for the old pod to release it. Keep `replicas: 1`; none of our applications are designed to run two copies against one `/config`.
* With a node-local storage class (`local-path`, `hostPath`) the pod is pinned to the node that holds the data; that is expected, and the reason `StatefulSet` exists as `publish.kubernetes.workload` for images where the identity of the volume matters.
* Set `storageClassName` explicitly rather than relying on the cluster default, and back `/config` up like any other database.

## GPUs and `/dev/dri`

Images that document a `/dev/dri` device (Plex, Jellyfin, Emby, Tdarr, Immich and others) use it for hardware video transcoding. The manifest cannot emit a `--device` equivalent, because Kubernetes has none; the header says so. You have three routes:

1. **A device plugin** is the proper way. The [Intel GPU device plugin](https://github.com/intel/intel-device-plugins-for-kubernetes) exposes `/dev/dri` render nodes as a resource; request it on the container and the plugin mounts the device nodes into the pod:

    ```yaml
    resources:
      limits:
        gpu.intel.com/i915: 1
    ```

    AMD has a [comparable plugin](https://github.com/ROCm/k8s-device-plugin) and a generic one (for example `squat/generic-device-plugin`) can expose any `/dev` path as a resource. The plugins mount the nodes with their host ownership, usually `root:render` or `root:video`. In the default mode our images add `abc` to the group that owns the device at start, so no further change is normally needed; in non-root mode, add the node's `render` and `video` gids to `supplementalGroups`.

2. **NVIDIA** needs the [NVIDIA device plugin or GPU Operator](https://github.com/NVIDIA/k8s-device-plugin) and the container toolkit on the node. Request `nvidia.com/gpu: 1`, set `runtimeClassName: nvidia` where your cluster uses one, and keep the `NVIDIA_VISIBLE_DEVICES` and `NVIDIA_DRIVER_CAPABILITIES` variables the image page documents.

3. **`hostPath` on `/dev/dri`** works only with `privileged: true`, because the device cgroup otherwise denies access to the nodes even though they are visible. It is the quick route on a single-node home cluster and the wrong one anywhere else.

## Host networking

Some images need the host's network namespace: Plex for GDM discovery and DLNA, Home Assistant and anything that speaks mDNS or needs to see the LAN's broadcast traffic. When the manifest requires it (`runtime.network.mode: host`) the generated pod sets `hostNetwork: true` and **no Service is emitted**: the application listens on the node's IP directly.

What that implies:

* Add `dnsPolicy: ClusterFirstWithHostNet` if the container needs to resolve cluster services; with `hostNetwork` the default policy uses the node's resolver.
* Only one such pod per node per port, so pin it with a `nodeSelector` or accept that a rescheduled Plex changes IP.
* For Plex specifically, the alternative is to stay off `hostNetwork`, publish 32400 with a `LoadBalancer` Service with `externalTrafficPolicy: Local` (so Plex sees real client addresses) and set `ADVERTISE_IP` to that address; you lose DLNA and local discovery, and clients on the LAN use the remote-access path unless you also set the LAN networks in Plex's settings.

Images where host networking is merely optional (the manifest marks it `optional`) get a Service and you decide.

## Why read-only and non-root support matters here

Clusters increasingly enforce the [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/). The `baseline` profile is compatible with our default mode. The `restricted` profile requires `runAsNonRoot: true`, `allowPrivilegeEscalation: false`, `capabilities.drop: [ALL]` and a `RuntimeDefault` seccomp profile; a namespace labelled `pod-security.kubernetes.io/enforce: restricted` rejects a pod that starts as root. None of that is compatible with the `PUID` path.

That is why each manifest records whether the image has been tested non-root and read-only, and why the Kubernetes header repeats it:

```
#   - readOnlyRootFilesystem is supported by this image; enable it once /config and /tmp are mounted.
#   - runAsNonRoot is supported by this image (set runAsUser and drop PUID/PGID).
```

An image that carries both notes can run under `restricted` with the `securityContext` shown above plus `readOnlyRootFilesystem: true` and `emptyDir` mounts at `/run` and `/tmp` (see [read-only operation](/docs/misc/read-only/) for what stops working: `PUID`/`PGID`, `UMASK`, mods, custom services). An image without them cannot, and we will not add logic to make it so; pick the `baseline` profile for that namespace or use an image that supports it. The flags are also in the API, as `config.readonly_supported` and `config.nonroot_supported` in `/api/v1/catalog/<name>.json`, so you can list the fleet that fits your policy.

## Ingress, and SWAG users

In Docker you put [SWAG](/docs/general/swag/) in front of everything. In Kubernetes the equivalent job belongs to an Ingress controller plus cert-manager, and the Service the manifest emits is exactly what an `Ingress` points at:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sonarr
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt
spec:
  ingressClassName: nginx
  tls:
    - hosts: [sonarr.example.com]
      secretName: sonarr-tls
  rules:
    - host: sonarr.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: sonarr
                port:
                  number: 8989
```

The hub's `proxy.json` for each image (`/api/v1/catalog/<name>/proxy.json`) tells you what the SWAG conf would have done: whether the app supports a subfolder, which paths are API locations that must bypass authentication, and whether it needs websocket upgrade headers; translate those into your controller's annotations (`nginx.ingress.kubernetes.io/proxy-read-timeout`, and so on) as needed.

If you would rather keep SWAG, it runs as an ordinary Deployment with a `LoadBalancer` Service on 80 and 443 and a PVC at `/config`. Use `VALIDATION=dns` so no inbound port 80 is needed during issuance. The generated proxy confs reference upstreams by container name (`set $upstream_app sonarr;`), and SWAG writes its nginx resolver from the container's `/etc/resolv.conf`, so inside a cluster those names resolve to the Services of the same namespace with no changes, as long as you keep the Service names the hub generates.
