/**
 * The reverse proxy lab: targeted line edits on the SWAG samples the hub generates from the manifest's
 * `proxy` block (`/api/v1/catalog/<name>/proxy.json`), so the output never drifts from what SWAG ships.
 * The samples carry every auth include as a comment (`#include /config/nginx/authelia-server.conf;` in
 * the server block, `#include /config/nginx/authelia-location.conf;` in each location that takes auth;
 * API locations have none); the lab uncomments the pair for the chosen auth and leaves the rest as they
 * are. Browser-safe.
 */

export const PROXY_AUTHS = [
  { key: 'none', label: 'None' },
  { key: 'basic', label: 'HTTP basic (.htpasswd)' },
  { key: 'authelia', label: 'Authelia' },
  { key: 'authentik', label: 'Authentik' },
  { key: 'tinyauth', label: 'Tinyauth' },
  { key: 'ldap', label: 'LDAP' },
] as const;
export type ProxyAuth = (typeof PROXY_AUTHS)[number]['key'];
export type ProxyMode = 'subdomain' | 'subfolder';

export interface ProxyChoice {
  mode: ProxyMode;
  /** The container name SWAG resolves on the shared network. */
  name: string;
  port: string;
  scheme: string;
  auth: ProxyAuth;
}

export interface ProxySample {
  image: string;
  subdomain: string;
  subfolder: string | null;
  port: number;
  scheme: string;
  /** The default container name the sample was generated with (`set $upstream_app`). */
  name: string;
  baseUrlNote: string | null;
}

export function defaultChoice(p: ProxySample): ProxyChoice {
  return { mode: 'subdomain', name: p.name, port: String(p.port), scheme: p.scheme, auth: 'none' };
}

/** The file SWAG reads: the sample without its `.sample` suffix. */
export const proxyFile = (image: string, mode: ProxyMode) => `/config/nginx/proxy-confs/${image}.${mode}.conf`;

/** The hub's sample with the visitor's choices applied. With the defaults the text is the sample itself. */
export function applyProxy(p: ProxySample, c: ProxyChoice): string {
  const base = c.mode === 'subfolder' && p.subfolder ? p.subfolder : p.subdomain;
  const port = /^\d+$/.test(c.port) ? c.port : String(p.port);
  const name = c.name.trim() || p.name;
  const out: string[] = [];
  for (const line of base.trimEnd().split('\n')) {
    let l = line;
    const m = l.match(/^(\s*)(.*)$/)!;
    const indent = m[1];
    const body = m[2];
    if (/^# make sure that your \S+ container is named /.test(body)) l = body.replace(/named \S+$/, `named ${name}`);
    else if (/^set \$upstream_app /.test(body)) l = `${indent}set $upstream_app ${name};`;
    else if (/^set \$upstream_port /.test(body)) l = `${indent}set $upstream_port ${port};`;
    else if (/^set \$upstream_proto /.test(body)) l = `${indent}set $upstream_proto ${c.scheme};`;
    else if (c.auth === 'basic' && (body === '#auth_basic "Restricted";' || body === '#auth_basic_user_file /config/nginx/.htpasswd;')) l = indent + body.slice(1);
    else if (c.auth !== 'none' && c.auth !== 'basic' && (body === `#include /config/nginx/${c.auth}-server.conf;` || body === `#include /config/nginx/${c.auth}-location.conf;`)) l = indent + body.slice(1);
    out.push(l);
  }
  return out.join('\n');
}

/** Differences from the sample, for the summary line. */
export function proxyChanges(p: ProxySample, c: ProxyChoice): string[] {
  const d = defaultChoice(p);
  const out: string[] = [];
  if (c.mode !== d.mode) out.push(c.mode);
  if (c.name.trim() && c.name.trim() !== d.name) out.push(`container ${c.name.trim()}`);
  if (c.port !== d.port) out.push(`port ${c.port}`);
  if (c.scheme !== d.scheme) out.push(c.scheme);
  if (c.auth !== 'none') out.push(`${PROXY_AUTHS.find((a) => a.key === c.auth)?.label ?? c.auth} auth`);
  return out;
}
