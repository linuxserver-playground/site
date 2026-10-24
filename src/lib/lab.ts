/**
 * The config lab on image pages: a model of one image's runtime parameters, built at build time from
 * the hub's ImageDetail (`config`, `snippets`, `releases`), its generated Kubernetes manifest and quadlet
 * unit, and the mods index; the visitor's choices (`LabState`); the renderers that turn both into docker
 * compose, docker run, a quadlet unit and a Kubernetes manifest; and the URL hash token the "copy link"
 * button produces. Browser-safe: the island imports everything but `buildLabModel` on the client.
 *
 * With the default state the compose and run output is, character for character, the hub's required-only
 * snippet (`builder.snippets` with `#optional` entries dropped), and with every optional item on it is the
 * full snippet minus the `#optional` markers: the renderers follow `builder/snippets.py` key for key.
 */
import type { ImageDetail, Mod } from './hub';

// ---------------------------------------------------------------------------------------------------
// Model

export interface LabItem {
  /** Stable id used in state and in the URL token: `e:TZ`, `v:/config`, `p:8989`, `d:/dev/dri`, `c:NET_ADMIN`, `s:<run>`, `x:<flag>`. */
  id: string;
  desc: string;
  optional: boolean;
}
export interface LabEnv extends LabItem {
  name: string;
  value: string;
  /** Allowed values when the manifest lists them (`runtime.env[].options`); the form shows a select. */
  options?: string[];
  /** Masked in the form and left out of the shareable link. */
  secret: boolean;
}
export interface LabVolume extends LabItem { path: string; host: string; ro: boolean }
export interface LabPort extends LabItem { internal: string; external: string }
export interface LabDevice extends LabItem { path: string; host: string }
export interface LabCap extends LabItem { cap: string }
export interface LabSecurityOpt extends LabItem { run: string; compose: string }
export interface LabCustom extends LabItem { flag: string; compose: string; values: string[]; array: boolean }
export interface LabScalar extends LabItem { value: string }

export interface LabModEnv { name: string; description: string; default: string; required: boolean }
export interface LabMod {
  /** The docker-mods branch; unique across the index. */
  id: string;
  name: string;
  title: string;
  summary: string;
  /** The `DOCKER_MODS` value. */
  image: string;
  url: string;
  universal: boolean;
  deprecated: boolean;
  deprecationMessage?: string;
  env: LabModEnv[];
  /** Whether the hub read a `mod.yml` (legacy mod-list entries have no settings data). */
  hasManifest: boolean;
}

export interface LabModel {
  name: string;
  title: string;
  /** `ghcr.io/linuxserver-playground/<name>` */
  ref: string;
  tags: { tag: string; desc: string }[];
  /** Newest release tag per live branch, for pinning. */
  pinned: { tag: string; label: string }[];
  defaultTag: string;
  env: LabEnv[];
  volumes: LabVolume[];
  ports: LabPort[];
  devices: LabDevice[];
  caps: LabCap[];
  securityOpt: LabSecurityOpt[];
  custom: LabCustom[];
  hostname: LabScalar | null;
  mac: LabScalar | null;
  network: { mode: string; optional: boolean } | null;
  privileged: 'required' | 'optional' | null;
  readonly: boolean;
  nonroot: boolean;
  mods: LabMod[];
  /** The "external application" block the hub appends to both snippets, when the manifest has one. */
  external: { compose: string; run: string } | null;
  kubernetes: string | null;
  quadlet: string | null;
}

/** The common variables, shown as the "identity" group of the form. */
export const COMMON_ENV = ['PUID', 'PGID', 'TZ'];

/** The builder's rule (image.schema.json): `secret` defaults to true when the name contains TOKEN, PASS or KEY. */
const secretByName = (name: string) => /TOKEN|PASS|KEY/i.test(name);

const OPTIONAL_MARK = /\s*(`#optional`|#\s?optional)\s*\\?\s*$/;

/** Everything after the first blank line of a hub snippet: the external application block. */
function externalBlock(snippet: string): string | null {
  const i = snippet.indexOf('\n\n');
  return i === -1 ? null : snippet.slice(i + 2).trimEnd();
}

/**
 * The lab's model for one image. `image` is the hub's ImageDetail plus the GHCR ref the site adds; the
 * compose snippet is consulted for what `config` does not carry: `:ro` volumes and whether host networking
 * or privileged mode are optional.
 */
export function buildLabModel(
  image: ImageDetail & { ref: string },
  extras: { kubernetes: string | null; quadlet: string | null },
  mods: Mod[],
): LabModel {
  const c = image.config ?? {};
  const compose = image.snippets.docker_compose;
  const composeLines = compose.split('\n');
  const line = (re: RegExp) => composeLines.find((l) => re.test(l));
  const optionalFlag = (l: string | undefined) => !!l && OPTIONAL_MARK.test(l);
  const roPaths = new Set(
    composeLines
      .map((l) => l.replace(OPTIONAL_MARK, '').match(/^\s+- (.+):(\/[^:\s]*):ro$/))
      .filter((m): m is RegExpMatchArray => !!m)
      .map((m) => m[2]),
  );

  const envSource = (c.env_vars ?? []) as (ImageDetail['config']['env_vars'] extends (infer T)[] | null | undefined ? T : never)[];
  const env: LabEnv[] = envSource.map((e) => {
    // The manifest schema has `options` and `secret` per variable; the hub's v1 Config does not carry
    // them yet, so read them defensively and fall back to the builder's name rule for secrets.
    const extra = e as unknown as { options?: string[] | null; secret?: boolean | null };
    return {
      id: `e:${e.name}`,
      name: e.name,
      value: e.value,
      desc: e.desc,
      optional: e.optional,
      options: extra.options?.length ? extra.options : undefined,
      secret: extra.secret ?? secretByName(e.name),
    };
  });

  const tags = image.tags.length ? image.tags : [{ tag: 'latest', desc: 'Stable releases' }];
  const pinned = image.releases
    .filter((r) => r.tag)
    .map((r) => ({ tag: r.tag!, label: `${r.tag} (${r.release_tag})` }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const external = externalBlock(compose) && externalBlock(image.snippets.docker_run)
    ? { compose: externalBlock(compose)!, run: externalBlock(image.snippets.docker_run)! }
    : null;

  return {
    name: image.name,
    title: image.title,
    ref: image.ref,
    tags,
    pinned,
    defaultTag: tags.some((t) => t.tag === 'latest') ? 'latest' : tags[0].tag,
    env,
    volumes: (c.volumes ?? []).map((v) => ({ id: `v:${v.path}`, path: v.path, host: v.host_path, desc: v.desc, optional: v.optional, ro: roPaths.has(v.path) })),
    ports: (c.ports ?? []).map((p) => ({ id: `p:${p.internal}`, internal: p.internal, external: p.external, desc: p.desc, optional: p.optional })),
    devices: (c.devices ?? []).map((d) => ({ id: `d:${d.path}`, path: d.path, host: d.host_path, desc: d.desc, optional: d.optional })),
    caps: (c.caps ?? []).map((x) => ({ id: `c:${x.cap_add}`, cap: x.cap_add, desc: x.desc, optional: x.optional })),
    securityOpt: (c.security_opt ?? []).map((x) => ({ id: `s:${x.run_var}`, run: x.run_var, compose: x.compose_var, desc: x.desc, optional: x.optional })),
    custom: (c.custom ?? []).map((x) => ({
      id: `x:${x.name}`,
      flag: x.name,
      compose: x.name_compose,
      values: Array.isArray(x.value) ? x.value : [x.value],
      array: Array.isArray(x.value),
      desc: x.desc,
      optional: x.optional,
    })),
    hostname: c.hostname ? { id: 'hostname', value: c.hostname.hostname, desc: c.hostname.desc, optional: c.hostname.optional } : null,
    mac: c.mac_address ? { id: 'mac', value: c.mac_address.mac_address, desc: c.mac_address.desc, optional: c.mac_address.optional } : null,
    network: c.networking ? { mode: c.networking, optional: optionalFlag(line(/^\s+network_mode:/)) } : null,
    privileged: c.privileged ? (optionalFlag(line(/^\s+privileged:/)) ? 'optional' : 'required') : null,
    readonly: !!c.readonly_supported,
    nonroot: !!c.nonroot_supported,
    mods: mods.map((m) => ({
      id: m.branch,
      name: m.name,
      title: m.title,
      summary: m.summary,
      image: m.image,
      url: m.url,
      universal: m.target === 'universal',
      deprecated: m.deprecated,
      deprecationMessage: m.deprecation_message ?? undefined,
      env: m.env.map((e) => ({ name: e.name, description: e.description, default: e.default ?? '', required: e.required })),
      hasManifest: m.source === 'playground',
    })),
    external,
    kubernetes: extras.kubernetes?.trimEnd() ?? null,
    quadlet: extras.quadlet?.trimEnd() ?? null,
  };
}

// ---------------------------------------------------------------------------------------------------
// State

export const RESTART_POLICIES = ['unless-stopped', 'always', 'on-failure', 'no'] as const;
export type Restart = (typeof RESTART_POLICIES)[number];

export interface LabState {
  tag: string;
  name: string;
  restart: Restart;
  /** Ids of optional items turned on, plus `net`, `priv`, `ro` and `nonroot` when chosen. */
  on: string[];
  /** Edited values by item id: an env value, a volume's host path, a port's host port, a device's host path, the hostname or mac address. */
  values: Record<string, string>;
  /** `uid:gid` for the non-root user. */
  user: string;
  /** Selected mods (ids), in the order they were chosen; `DOCKER_MODS` keeps that order. */
  mods: string[];
  /** Mod settings by `<mod id>/<NAME>`. */
  modEnv: Record<string, string>;
}

export const DEFAULT_USER = '1000:1000';

export function defaultState(m: LabModel): LabState {
  return { tag: m.defaultTag, name: m.name, restart: 'unless-stopped', on: [], values: {}, user: DEFAULT_USER, mods: [], modEnv: {} };
}

export const isOn = (s: LabState, item: LabItem) => !item.optional || s.on.includes(item.id);
export const flagOn = (s: LabState, id: 'net' | 'priv' | 'ro' | 'nonroot') => s.on.includes(id);
export const hostNet = (m: LabModel, s: LabState) => !!m.network && m.network.mode === 'host' && (!m.network.optional || flagOn(s, 'net'));
export const privileged = (m: LabModel, s: LabState) => m.privileged === 'required' || (m.privileged === 'optional' && flagOn(s, 'priv'));

/** The value the output uses for an item: the visitor's edit, else the manifest's. */
export function valueOf(s: LabState, id: string, fallback: string): string {
  const v = s.values[id];
  return v === undefined ? fallback : v;
}

export function modEnvValue(s: LabState, mod: LabMod, e: LabModEnv): string {
  const v = s.modEnv[`${mod.id}/${e.name}`];
  return v === undefined ? e.default : v;
}

/** Every optional id the model allows in `on`. */
export function optionalIds(m: LabModel): Set<string> {
  const ids = new Set<string>();
  for (const list of [m.env, m.volumes, m.ports, m.devices, m.caps, m.securityOpt, m.custom]) for (const i of list) if (i.optional) ids.add(i.id);
  if (m.hostname?.optional) ids.add('hostname');
  if (m.mac?.optional) ids.add('mac');
  if (m.network?.optional) ids.add('net');
  if (m.privileged === 'optional') ids.add('priv');
  if (m.readonly) ids.add('ro');
  if (m.nonroot) ids.add('nonroot');
  return ids;
}

/** Every item that has an editable value, with its manifest default. */
export function valueDefaults(m: LabModel): Map<string, string> {
  const d = new Map<string, string>();
  for (const e of m.env) d.set(e.id, e.value);
  for (const v of m.volumes) d.set(v.id, v.host);
  for (const p of m.ports) d.set(p.id, p.external);
  for (const x of m.devices) d.set(x.id, x.host);
  if (m.hostname) d.set('hostname', m.hostname.value);
  if (m.mac) d.set('mac', m.mac.value);
  return d;
}

/** The environment as it will be emitted: the image's variables, DOCKER_MODS, then each selected mod's settings. */
export function effectiveEnv(m: LabModel, s: LabState): { name: string; value: string; secret: boolean; mod?: LabMod }[] {
  const out: { name: string; value: string; secret: boolean; mod?: LabMod }[] = [];
  for (const e of m.env) if (isOn(s, e)) out.push({ name: e.name, value: valueOf(s, e.id, e.value), secret: e.secret });
  const mods = s.mods.map((id) => m.mods.find((x) => x.id === id)).filter((x): x is LabMod => !!x);
  if (mods.length) out.push({ name: 'DOCKER_MODS', value: mods.map((x) => x.image).join('|'), secret: false });
  for (const mod of mods) {
    for (const e of mod.env) {
      const value = modEnvValue(s, mod, e);
      if (value !== '' || e.required) out.push({ name: e.name, value, secret: secretByName(e.name), mod });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------
// Quoting

const YAML_INDICATOR = /^[-?:,[\]{}#&*!|>'"%@`]/;
const yamlDouble = (s: string) => `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

/** A compose block-sequence item (`- VAR=value`, `- /host:/path`): quoted only when YAML would misread it. */
export function yamlItem(s: string): string {
  if (s === '') return "''";
  return /\s/.test(s) || /["'\\]/.test(s) || /#/.test(s) || YAML_INDICATOR.test(s) || /: /.test(s) ? yamlDouble(s) : s;
}

/** A compose mapping value (`container_name: x`): also quoted when YAML would read it as a number, boolean or null. */
export function yamlValue(s: string): string {
  if (s === '') return "''";
  if (/^(true|false|yes|no|on|off|null|~|[-+]?(\d[\d_]*\.?\d*|\.\d+)([eE][-+]?\d+)?|0x[0-9a-f]+|0o?[0-7]+|[-+]?\.(inf|nan))$/i.test(s)) return yamlDouble(s);
  return yamlItem(s);
}

/** A shell word for the docker run command: quoted when it has whitespace or a character the shell would interpret. */
export function shellWord(s: string): string {
  if (s === '') return '';
  if (/^[\w@%+=:,./-]+$/.test(s)) return s;
  return `"${s.replace(/([\\"$`])/g, '\\$1')}"`;
}

// ---------------------------------------------------------------------------------------------------
// docker compose and docker run (the builder's order: builder/snippets.py)

const SYSTEMD_RESTART: Record<Restart, string> = { 'unless-stopped': 'always', always: 'always', 'on-failure': 'on-failure', no: 'no' };

export function renderCompose(m: LabModel, s: LabState): string {
  const L = ['---', 'services:', `  ${m.name}:`, `    image: ${m.ref}:${s.tag}`, `    container_name: ${yamlValue(s.name)}`];
  if (m.hostname && isOn(s, m.hostname)) L.push(`    hostname: ${yamlValue(valueOf(s, 'hostname', m.hostname.value))}`);
  if (m.mac && isOn(s, m.mac)) L.push(`    mac_address: ${yamlValue(valueOf(s, 'mac', m.mac.value))}`);
  if (privileged(m, s)) L.push('    privileged: true');
  const caps = m.caps.filter((c) => isOn(s, c));
  if (caps.length) L.push('    cap_add:', ...caps.map((c) => `      - ${yamlItem(c.cap)}`));
  const secs = m.securityOpt.filter((x) => isOn(s, x));
  if (secs.length) L.push('    security_opt:', ...secs.map((x) => `      - ${yamlItem(x.compose)}`));
  if (m.network && (!m.network.optional || flagOn(s, 'net'))) L.push(`    network_mode: ${yamlValue(m.network.mode)}`);
  const env = effectiveEnv(m, s);
  if (env.length) L.push('    environment:', ...env.map((e) => `      - ${yamlItem(`${e.name}=${e.value}`)}`));
  const vols = m.volumes.filter((v) => isOn(s, v));
  if (vols.length) L.push('    volumes:', ...vols.map((v) => `      - ${yamlItem(`${valueOf(s, v.id, v.host)}:${v.path}${v.ro ? ':ro' : ''}`)}`));
  const ports = hostNet(m, s) ? [] : m.ports.filter((p) => isOn(s, p));
  if (ports.length) L.push('    ports:', ...ports.map((p) => `      - ${yamlItem(`${valueOf(s, p.id, p.external)}:${p.internal}`)}`));
  const devs = m.devices.filter((d) => isOn(s, d));
  if (devs.length) L.push('    devices:', ...devs.map((d) => `      - ${yamlItem(`${valueOf(s, d.id, d.host)}:${d.path}`)}`));
  for (const c of m.custom) {
    if (!isOn(s, c)) continue;
    if (c.array) L.push(`    ${c.compose}:`, ...c.values.map((v) => `      - ${yamlItem(v)}`));
    else L.push(`    ${c.compose}: ${yamlDouble(c.values[0])}`);
  }
  if (m.nonroot && flagOn(s, 'nonroot')) L.push(`    user: ${yamlDouble(s.user)}`);
  if (m.readonly && flagOn(s, 'ro')) L.push('    read_only: true', '    tmpfs:', '      - /run:exec');
  L.push(`    restart: ${s.restart}`);
  if (m.external) L.push('', m.external.compose);
  return L.join('\n');
}

export function renderRun(m: LabModel, s: LabState): string {
  const A = [`--name=${shellWord(s.name)}`];
  if (m.hostname && isOn(s, m.hostname)) A.push(`--hostname=${shellWord(valueOf(s, 'hostname', m.hostname.value))}`);
  if (m.mac && isOn(s, m.mac)) A.push(`--mac-address=${shellWord(valueOf(s, 'mac', m.mac.value))}`);
  if (m.network && (!m.network.optional || flagOn(s, 'net'))) A.push(`--net=${m.network.mode}`);
  if (privileged(m, s)) A.push('--privileged');
  for (const c of m.caps) if (isOn(s, c)) A.push(`--cap-add=${c.cap}`);
  for (const x of m.securityOpt) if (isOn(s, x)) A.push(`--security-opt ${shellWord(x.run)}`);
  for (const e of effectiveEnv(m, s)) A.push(`-e ${e.name}=${shellWord(e.value)}`);
  if (!hostNet(m, s)) for (const p of m.ports) if (isOn(s, p)) A.push(`-p ${shellWord(`${valueOf(s, p.id, p.external)}:${p.internal}`)}`);
  for (const v of m.volumes) if (isOn(s, v)) A.push(`-v ${shellWord(`${valueOf(s, v.id, v.host)}:${v.path}${v.ro ? ':ro' : ''}`)}`);
  for (const d of m.devices) if (isOn(s, d)) A.push(`--device ${shellWord(`${valueOf(s, d.id, d.host)}:${d.path}`)}`);
  for (const c of m.custom) if (isOn(s, c)) for (const v of c.values) A.push(`--${c.flag}="${v}"`);
  if (m.nonroot && flagOn(s, 'nonroot')) A.push(`--user=${shellWord(s.user)}`);
  if (m.readonly && flagOn(s, 'ro')) A.push('--read-only=true', '--tmpfs /run:exec');
  A.push(`--restart ${s.restart}`);
  const L = ['docker run -d \\', ...A.map((a) => `  ${a} \\`), `  ${m.ref}:${s.tag}`];
  if (m.external) L.push('', m.external.run);
  return L.join('\n');
}

// ---------------------------------------------------------------------------------------------------
// Quadlet: the hub's unit, line by line, with the visitor's values; optional lines stay commented out
// until chosen, as the hub's header says.

const unitQuote = (v: string) => (/\s/.test(v) ? `"${v}"` : v);

export function renderQuadlet(m: LabModel, s: LabState): string | null {
  if (!m.quadlet) return null;
  const env = effectiveEnv(m, s);
  const envByName = new Map(env.map((e) => [e.name, e]));
  const emitted = new Set<string>();
  const out: string[] = [];
  let lastEnv = -1;
  let containerEnd = -1;
  const toggle = (key: string, value: string, on: boolean) => `${on ? '' : '# '}${key}=${value}`;
  const net = hostNet(m, s);

  for (const raw of m.quadlet.split('\n')) {
    const line = raw.replace(/^# /, '');
    const eq = line.indexOf('=');
    const key = eq === -1 ? '' : line.slice(0, eq);
    const val = eq === -1 ? '' : line.slice(eq + 1);
    if (raw === '' && containerEnd === -1 && out.some((l) => l === '[Container]')) containerEnd = out.length;

    if (key === 'Image') out.push(`Image=${m.ref}:${s.tag}`);
    else if (key === 'ContainerName') out.push(`ContainerName=${unitQuote(s.name)}`);
    else if (key === 'Environment') {
      const name = val.replace(/^"/, '').split('=')[0];
      const item = m.env.find((e) => e.name === name);
      const e = envByName.get(name);
      if (item && e) {
        out.push(`Environment=${unitQuote(`${name}=${e.value}`)}`);
        emitted.add(name);
      } else out.push(`# ${line}`);
      lastEnv = out.length - 1;
    } else if (key === 'Volume') {
      const mt = val.match(/^(.*):(\/[^:]*)(:Z|:ro)?$/);
      const v = mt && m.volumes.find((x) => x.path === mt[2]);
      if (v) out.push(toggle('Volume', unitQuote(`${isOn(s, v) ? valueOf(s, v.id, v.host) : v.host}:${v.path}${mt![3] ?? ''}`), isOn(s, v)));
      else out.push(raw);
    } else if (key === 'PublishPort') {
      const i = val.indexOf(':');
      const p = m.ports.find((x) => x.internal === val.slice(i + 1));
      if (net) continue;
      if (p) out.push(toggle('PublishPort', `${isOn(s, p) ? valueOf(s, p.id, p.external) : p.external}:${p.internal}`, isOn(s, p)));
      else out.push(raw);
    } else if (key === 'AddDevice') {
      const d = m.devices.find((x) => val.endsWith(`:${x.path}`));
      if (d) out.push(toggle('AddDevice', unitQuote(`${isOn(s, d) ? valueOf(s, d.id, d.host) : d.host}:${d.path}`), isOn(s, d)));
      else out.push(raw);
    } else if (key === 'AddCapability') {
      const c = m.caps.find((x) => x.cap === val);
      out.push(c ? toggle('AddCapability', val, isOn(s, c)) : raw);
    } else if (key === 'Network') out.push(toggle('Network', val, !!m.network && (!m.network.optional || flagOn(s, 'net'))));
    else if (key === 'HostName' && m.hostname) out.push(toggle('HostName', unitQuote(valueOf(s, 'hostname', m.hostname.value)), isOn(s, m.hostname)));
    else if (key === 'PodmanArgs' && val === '--privileged') out.push(toggle('PodmanArgs', val, privileged(m, s)));
    else if (key === 'PodmanArgs' && val.startsWith('--mac-address=') && m.mac) out.push(toggle('PodmanArgs', `--mac-address=${valueOf(s, 'mac', m.mac.value)}`, isOn(s, m.mac)));
    else if (key === 'PodmanArgs' && val.startsWith('--security-opt ')) {
      const x = m.securityOpt.find((o) => o.run === val.slice('--security-opt '.length));
      out.push(x ? toggle('PodmanArgs', val, isOn(s, x)) : raw);
    } else if (key === 'SecurityLabelDisable') {
      const x = m.securityOpt.find((o) => o.run.startsWith('label=disable'));
      out.push(x ? toggle('SecurityLabelDisable', val, isOn(s, x)) : raw);
    } else if (key === 'ShmSize' || key === 'Sysctl' || (key === 'PodmanArgs' && val.startsWith('--'))) {
      const flag = key === 'ShmSize' ? 'shm-size' : key === 'Sysctl' ? 'sysctl' : val.slice(2).split('=')[0];
      const c = m.custom.find((x) => x.flag === flag);
      out.push(c ? toggle(key, val, isOn(s, c)) : raw);
    } else if (key === 'Restart') out.push(`Restart=${SYSTEMD_RESTART[s.restart]}`);
    else out.push(raw);
  }

  // Variables the hub's unit has no line for: mods and their settings, after the last Environment line.
  const extra = env.filter((e) => !emitted.has(e.name) && !m.env.some((x) => x.name === e.name)).map((e) => `Environment=${unitQuote(`${e.name}=${e.value}`)}`);
  const security: string[] = [];
  if (m.nonroot && flagOn(s, 'nonroot')) {
    const [uid, gid] = s.user.split(':');
    security.push(`User=${uid}`);
    if (gid) security.push(`Group=${gid}`);
  }
  if (m.readonly && flagOn(s, 'ro')) security.push('ReadOnly=true', 'Tmpfs=/run:exec');
  if (containerEnd === -1) containerEnd = out.length;
  out.splice(containerEnd, 0, ...security);
  if (extra.length) out.splice(lastEnv === -1 ? containerEnd : lastEnv + 1, 0, ...extra);
  return out.join('\n');
}

// ---------------------------------------------------------------------------------------------------
// Kubernetes: the hub's manifest with the image tag and the ConfigMap's environment substituted. Volumes,
// ports and security settings keep the hub's structure (claims, Service, securityContext notes).

/** A ConfigMap value the way the hub's YAML writer quotes it: single quotes when YAML would not read a string. */
function yamlConfigValue(s: string): string {
  if (s === '') return "''";
  if (/^(true|false|yes|no|on|off|null|~|[-+]?(\d[\d_]*\.?\d*|\.\d+)([eE][-+]?\d+)?)$/i.test(s) || /^[-?:,[\]{}#&*!|>'"%@`]/.test(s) || /: |\s#|\s$|^\s/.test(s)) {
    return `'${s.replace(/'/g, "''")}'`;
  }
  return s;
}

export function renderKubernetes(m: LabModel, s: LabState): string | null {
  if (!m.kubernetes) return null;
  const lines = m.kubernetes.split('\n');
  const out: string[] = [];
  const env = effectiveEnv(m, s).filter((e) => !(m.nonroot && flagOn(s, 'nonroot') && (e.name === 'PUID' || e.name === 'PGID')));
  let inConfigMap = false;
  let inData = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l === '---') (inConfigMap = false), (inData = false);
    if (/^kind: ConfigMap$/.test(l)) inConfigMap = true;
    if (inData) {
      if (/^  \S/.test(l)) continue; // the hub's entries, replaced below
      inData = false;
    }
    if (inConfigMap && l === 'data:') {
      out.push('data:', ...env.map((e) => `  ${e.name}: ${yamlConfigValue(e.value)}`));
      inData = true;
      continue;
    }
    const img = l.match(/^(\s+)image: (\S+):\S+$/);
    if (img && img[2] === m.ref) {
      out.push(`${img[1]}image: ${m.ref}:${s.tag}`);
      continue;
    }
    out.push(l);
  }
  return out.join('\n');
}

// ---------------------------------------------------------------------------------------------------
// "What you changed"

export function changes(m: LabModel, s: LabState): string[] {
  const d = defaultState(m);
  const defaults = valueDefaults(m);
  const out: string[] = [];
  if (s.tag !== d.tag) out.push(`tag ${s.tag}`);
  if (s.name !== d.name) out.push(`name ${s.name}`);
  const added = s.on.filter((id) => !['ro', 'nonroot', 'net', 'priv'].includes(id));
  if (added.length) out.push(`${added.length} optional setting${added.length === 1 ? '' : 's'}`);
  if (flagOn(s, 'net') && m.network?.optional) out.push(`${m.network.mode} network`);
  if (flagOn(s, 'priv') && m.privileged === 'optional') out.push('privileged');
  const edited = Object.entries(s.values).filter(([id, v]) => defaults.has(id) && defaults.get(id) !== v);
  if (edited.length) out.push(`${edited.length} value${edited.length === 1 ? '' : 's'} edited`);
  if (s.mods.length) out.push(`${s.mods.length} mod${s.mods.length === 1 ? '' : 's'}`);
  if (m.readonly && flagOn(s, 'ro')) out.push('read-only');
  if (m.nonroot && flagOn(s, 'nonroot')) out.push(`user ${s.user}`);
  if (s.restart !== d.restart) out.push(`restart ${s.restart}`);
  return out;
}

// ---------------------------------------------------------------------------------------------------
// URL token: `#lab:` + query pairs holding only what differs from the defaults. Keys: t tag, n name,
// r restart, u user, on (repeated) optional ids, v.<id> value, m (repeated) mod ids, me.<mod>/<NAME>
// mod setting. Secret values are never serialised.

const TOKEN = '#lab:';

export function encodeState(m: LabModel, s: LabState): string {
  const d = defaultState(m);
  const defaults = valueDefaults(m);
  const allowed = optionalIds(m);
  const p = new URLSearchParams();
  if (s.tag !== d.tag) p.set('t', s.tag);
  if (s.name !== d.name) p.set('n', s.name);
  if (s.restart !== d.restart) p.set('r', s.restart);
  if (s.user !== d.user && flagOn(s, 'nonroot')) p.set('u', s.user);
  for (const id of s.on) if (allowed.has(id)) p.append('on', id);
  for (const [id, v] of Object.entries(s.values)) {
    if (!defaults.has(id) || defaults.get(id) === v) continue;
    if (m.env.find((e) => e.id === id)?.secret) continue;
    p.set(`v.${id}`, v);
  }
  for (const id of s.mods) if (m.mods.some((x) => x.id === id)) p.append('m', id);
  for (const [key, v] of Object.entries(s.modEnv)) {
    const [modId, name] = key.split('/');
    const mod = m.mods.find((x) => x.id === modId);
    const e = mod?.env.find((x) => x.name === name);
    if (!mod || !e || !s.mods.includes(modId) || v === e.default || secretByName(name)) continue;
    p.set(`me.${key}`, v);
  }
  const q = p.toString();
  return q ? TOKEN + q.replace(/%2F/g, '/').replace(/%3A/g, ':').replace(/%2C/g, ',') : '';
}

/** The state a hash describes, or null when it is not a lab token. Unknown ids are ignored. */
export function decodeState(hash: string, m: LabModel): LabState | null {
  if (!hash.startsWith(TOKEN)) return null;
  const p = new URLSearchParams(hash.slice(TOKEN.length));
  const s = defaultState(m);
  const defaults = valueDefaults(m);
  const allowed = optionalIds(m);
  const t = p.get('t');
  if (t && (m.tags.some((x) => x.tag === t) || m.pinned.some((x) => x.tag === t))) s.tag = t;
  const n = p.get('n');
  if (n && /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(n)) s.name = n;
  const r = p.get('r');
  if (r && (RESTART_POLICIES as readonly string[]).includes(r)) s.restart = r as Restart;
  const u = p.get('u');
  if (u && /^\d+(:\d+)?$/.test(u)) s.user = u;
  s.on = [...new Set(p.getAll('on').filter((id) => allowed.has(id)))];
  s.mods = [...new Set(p.getAll('m').filter((id) => m.mods.some((x) => x.id === id)))];
  for (const [k, v] of p) {
    if (k.startsWith('v.')) {
      const id = k.slice(2);
      if (defaults.has(id)) s.values[id] = v;
    } else if (k.startsWith('me.')) {
      const key = k.slice(3);
      const [modId, name] = key.split('/');
      if (s.mods.includes(modId) && m.mods.find((x) => x.id === modId)?.env.some((e) => e.name === name)) s.modEnv[key] = v;
    }
  }
  return s;
}

/** Common tz database names for the TZ field's suggestions. */
export const TIMEZONES = [
  'Etc/UTC',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Africa/Lagos',
  'America/Anchorage',
  'America/Argentina/Buenos_Aires',
  'America/Bogota',
  'America/Chicago',
  'America/Denver',
  'America/Halifax',
  'America/Los_Angeles',
  'America/Mexico_City',
  'America/New_York',
  'America/Phoenix',
  'America/Sao_Paulo',
  'America/Toronto',
  'America/Vancouver',
  'Asia/Bangkok',
  'Asia/Dubai',
  'Asia/Hong_Kong',
  'Asia/Jakarta',
  'Asia/Kolkata',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Brisbane',
  'Australia/Melbourne',
  'Australia/Perth',
  'Australia/Sydney',
  'Europe/Amsterdam',
  'Europe/Berlin',
  'Europe/Dublin',
  'Europe/Helsinki',
  'Europe/Lisbon',
  'Europe/London',
  'Europe/Madrid',
  'Europe/Moscow',
  'Europe/Oslo',
  'Europe/Paris',
  'Europe/Rome',
  'Europe/Stockholm',
  'Europe/Warsaw',
  'Europe/Zurich',
  'Pacific/Auckland',
  'Pacific/Honolulu',
];
