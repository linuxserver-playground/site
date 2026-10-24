/**
 * Guided hints for the config lab: short notes that react to the visitor's choices. Every sentence is
 * either the manifest's own description of the item or a fact from our documentation (linked); nothing
 * is inferred about an image beyond what the hub says about it. Browser-safe.
 */
import { withBase } from './base';
import { COMMON_ENV, effectiveEnv, flagOn, hostNet, isOn, modEnvValue, privileged, valueOf, type LabModel, type LabState } from './lab';

export interface Hint {
  id: string;
  tone: 'info' | 'warn';
  /** Plain text; `code` spans are rendered. */
  text: string;
  link?: { label: string; href: string };
  /** Id of the control the hint is about, so the island can point at it. */
  field?: string;
}

const DOCS = withBase('/docs');

/** Static facts, each with the page it comes from. */
export const FACTS = {
  paths: { text: 'Replace the `/path/to` folders with real folders on your host; they are created if missing.', href: undefined },
  puid: {
    text: 'PUID and PGID should be the ids of the user who owns the host folders: `id <user>` prints them.',
    href: `${DOCS}/general/understanding-puid-and-pgid/`,
  },
  tz: {
    text: 'TZ takes a name from the tz database, such as `Europe/London`.',
    href: 'https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List',
  },
  readonly: {
    text: '`read_only: true` needs `/run` on a tmpfs with exec (added). PUID, PGID and UMASK then have no effect: the application runs as UID 911. Test before switching an existing container.',
    href: `${DOCS}/misc/read-only/`,
  },
  nonroot: {
    text: '`user:` starts the container as that user. PUID and PGID are ignored and you own the permissions of every mount.',
    href: `${DOCS}/misc/non-root/`,
  },
  modsBlocked: {
    text: 'Docker Mods do not run read-only or as a non-root user: the init cannot extract them.',
    href: `${DOCS}/misc/read-only/`,
  },
  hostNetwork: { text: 'Host networking: the container uses the host\'s network directly, so the port mappings are left out.', href: undefined },
  privileged: { text: 'Privileged mode lifts the container\'s capability and device restrictions; use it only because this image asks for it.', href: undefined },
  dri: { text: 'The image adds its user to the groups that own the device nodes at start, so nothing else is needed for `/dev/dri`.', href: undefined },
  mods: { text: 'Several mods go in one `DOCKER_MODS` value separated with `|`, in this order.', href: `${DOCS}/general/container-customization/` },
  secrets: { text: 'Values flagged as secrets are masked here and left out of the shareable link.', href: undefined },
  k8sStatic: {
    text: 'The Kubernetes manifest takes the tag and the environment from your choices; volumes, ports and security settings keep the hub\'s structure. Non-root drops PUID and PGID from the ConfigMap.',
    href: `${DOCS}/general/kubernetes/`,
  },
  quadlet: { text: 'Optional lines stay commented out in the unit until chosen. Copy the file to `~/.config/containers/systemd/` and run `systemctl --user daemon-reload`.', href: `${DOCS}/general/podman-quadlet/` },
} as const;

export function hintsFor(m: LabModel, s: LabState): Hint[] {
  const out: Hint[] = [];
  const add = (id: string, tone: Hint['tone'], text: string, href?: string, field?: string, label = 'Read the docs') =>
    out.push({ id, tone, text, field, link: href ? { label, href } : undefined });

  // Paths still at their placeholders.
  if (m.volumes.some((v) => isOn(s, v) && /^\/path\/to/.test(valueOf(s, v.id, v.host)))) add('paths', 'info', FACTS.paths.text);

  // Identity.
  const puid = m.env.find((e) => e.name === 'PUID');
  const pgid = m.env.find((e) => e.name === 'PGID');
  if ((puid && valueOf(s, puid.id, puid.value) !== puid.value) || (pgid && valueOf(s, pgid.id, pgid.value) !== pgid.value)) {
    add('puid', 'info', FACTS.puid.text, FACTS.puid.href, puid?.id, 'Understanding PUID and PGID');
  }
  const tz = m.env.find((e) => e.name === 'TZ');
  if (tz && valueOf(s, tz.id, tz.value) !== 'Etc/UTC') add('tz', 'info', FACTS.tz.text, FACTS.tz.href, tz.id, 'List of tz database names');

  // Security modes.
  const ro = m.readonly && flagOn(s, 'ro');
  const nonroot = m.nonroot && flagOn(s, 'nonroot');
  if (ro) add('ro', 'info', FACTS.readonly.text, FACTS.readonly.href, 'ro', 'Running containers read-only');
  if (nonroot) add('nonroot', 'info', FACTS.nonroot.text, FACTS.nonroot.href, 'nonroot', 'Running as a non-root user');
  if ((ro || nonroot) && s.mods.length) add('mods-blocked', 'warn', FACTS.modsBlocked.text, FACTS.modsBlocked.href, 'mods');
  if (hostNet(m, s)) add('net', 'info', FACTS.hostNetwork.text, undefined, m.network?.optional ? 'net' : undefined);
  if (privileged(m, s) && m.privileged === 'optional' && flagOn(s, 'priv')) add('priv', 'warn', FACTS.privileged.text, undefined, 'priv');

  // Chosen optional items explain themselves with the manifest's description.
  for (const d of m.devices) {
    if (!d.optional || !isOn(s, d)) continue;
    add(d.id, 'info', d.desc + (d.path.startsWith('/dev/dri') ? ` ${FACTS.dri.text}` : ''), undefined, d.id);
  }
  for (const c of m.caps) if (c.optional && isOn(s, c)) add(c.id, 'info', `\`${c.cap}\`: ${c.desc}`, undefined, c.id);
  for (const x of m.securityOpt) if (x.optional && isOn(s, x)) add(x.id, 'info', `\`${x.compose}\`: ${x.desc}`, undefined, x.id);
  for (const e of m.env) {
    if (!e.optional || !isOn(s, e) || COMMON_ENV.includes(e.name)) continue;
    if (valueOf(s, e.id, e.value) === '' && e.value === '') add(e.id, 'info', `\`${e.name}\` is empty: ${e.desc}`, undefined, e.id);
  }

  // Mods.
  const mods = s.mods.map((id) => m.mods.find((x) => x.id === id)).filter((x): x is NonNullable<typeof x> => !!x);
  if (mods.length > 1) add('mods-order', 'info', FACTS.mods.text, FACTS.mods.href, 'mods', 'Container customisation');
  for (const mod of mods) {
    if (mod.deprecated) add(`mod-dep-${mod.id}`, 'warn', `${mod.title} is deprecated${mod.deprecationMessage ? `: ${mod.deprecationMessage}` : '.'}`, mod.url, `mod-${mod.id}`, 'Mod page');
    if (!mod.hasManifest) add(`mod-readme-${mod.id}`, 'info', `${mod.title} has no settings data in the hub yet; its README lists the variables it reads.`, mod.url, `mod-${mod.id}`, `${mod.title} README`);
    for (const e of mod.env) {
      if (e.required && modEnvValue(s, mod, e) === '') add(`mod-env-${mod.id}-${e.name}`, 'warn', `${mod.title} needs \`${e.name}\`: ${e.description}`, undefined, `mod-${mod.id}/${e.name}`);
    }
  }

  // Secrets in the output.
  if (effectiveEnv(m, s).some((e) => e.secret && e.value !== '')) add('secrets', 'info', FACTS.secrets.text);

  return out;
}
