import * as React from 'react';
import { AlertTriangle, Info, Link as LinkIcon, RotateCcw, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FACTS, hintsFor } from '@/lib/hints';
import {
  changes,
  COMMON_ENV,
  decodeState,
  defaultState,
  encodeState,
  flagOn,
  hostNet,
  isOn,
  modEnvValue,
  renderCompose,
  renderKubernetes,
  renderQuadlet,
  renderRun,
  RESTART_POLICIES,
  TIMEZONES,
  valueOf,
  type LabItem,
  type LabMod,
  type LabModel,
  type LabState,
  type Restart,
} from '@/lib/lab';
import { inlineMarkdown } from '@/lib/markdown/inline';
import { cn } from '@/lib/utils';
import CopyButton from './CopyButton';

interface Props {
  model: LabModel;
  /** Where the hub serves the generated documents the tabs are based on. */
  sources: { compose?: string; kubernetes?: string; quadlet?: string };
}

/** Short manifest text with `code` spans and links. */
function Desc({ text, className }: { text: string; className?: string }) {
  return <span className={cn('[&_code]:font-mono [&_code]:text-foreground [&_a]:underline [&_a]:underline-offset-4', className)} dangerouslySetInnerHTML={{ __html: inlineMarkdown(text) }} />;
}

function Group({ title, note, children, open, count }: { title: string; note?: string; children: React.ReactNode; open?: boolean; count?: number }) {
  return (
    <details open={open} className="group border-b border-[var(--raft-hair)] last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&::-webkit-details-marker]:hidden">
        <span>
          {title}
          {count !== undefined && <span className="ml-2 rounded-md bg-muted px-1.5 py-px font-mono text-[0.6875rem] text-muted-foreground">{count}</span>}
        </span>
        <span aria-hidden="true" className="font-mono text-xs text-muted-foreground transition-transform group-open:rotate-90">
          ›
        </span>
      </summary>
      <div className="space-y-3 px-4 pt-1 pb-4">
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
        {children}
      </div>
    </details>
  );
}

function Field({ id, label, hint, children }: { id: string; label: React.ReactNode; hint?: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block font-mono text-xs text-muted-foreground">
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {hint && <Desc text={hint} className="mt-1 block text-xs text-muted-foreground" />}
    </div>
  );
}

const CHECK = 'mt-0.5 size-4 shrink-0 accent-primary';

/**
 * The config lab: a form on the left (above on phones) and the live docker compose, docker run, quadlet
 * and Kubernetes output on the right. Server-rendered with the manifest defaults, which are exactly the
 * hub's required-only snippets; the visitor adds optional settings and mods, edits values and copies
 * the result, or a link that restores the configuration (`#lab:` hash token, see lib/lab.ts).
 */
export default function ConfigLab({ model, sources }: Props) {
  const m = model;
  const uid = React.useId();
  const fid = (id: string) => `${uid}-${id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  const [s, setS] = React.useState<LabState>(() => defaultState(m));
  const [tab, setTab] = React.useState('compose');
  const [q, setQ] = React.useState('');
  const [linked, setLinked] = React.useState(false);
  const dirty = React.useRef(false);

  // The hash restores a shared configuration; applying it after mount keeps the hydration identical to the SSR.
  React.useEffect(() => {
    const restore = () => {
      const st = decodeState(window.location.hash, m);
      if (st) (dirty.current = true), setS(st);
    };
    restore();
    window.addEventListener('hashchange', restore);
    return () => window.removeEventListener('hashchange', restore);
  }, [m]);

  const update = (patch: Partial<LabState> | ((prev: LabState) => LabState)) => {
    dirty.current = true;
    setS((prev) => (typeof patch === 'function' ? patch(prev) : { ...prev, ...patch }));
  };
  const toggle = (id: string, on: boolean) => update((p) => ({ ...p, on: on ? [...p.on.filter((x) => x !== id), id] : p.on.filter((x) => x !== id) }));
  const setValue = (id: string, v: string) => update((p) => ({ ...p, values: { ...p.values, [id]: v } }));
  const toggleMod = (id: string, on: boolean) => update((p) => ({ ...p, mods: on ? [...p.mods.filter((x) => x !== id), id] : p.mods.filter((x) => x !== id) }));
  const reset = () => {
    update(defaultState(m));
    setLinked(false);
    if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search);
  };

  const compose = React.useMemo(() => renderCompose(m, s), [m, s]);
  const run = React.useMemo(() => renderRun(m, s), [m, s]);
  const quadlet = React.useMemo(() => renderQuadlet(m, s), [m, s]);
  const k8s = React.useMemo(() => renderKubernetes(m, s), [m, s]);
  const changed = React.useMemo(() => changes(m, s), [m, s]);
  const hints = React.useMemo(() => hintsFor(m, s), [m, s]);

  // The visible summary is the live region; it follows the state after a pause so typing is not read out letter by letter.
  const initialSummary = 'Defaults from the manifest: required settings only. Tick optional settings and mods to add them.';
  const [summary, setSummary] = React.useState(initialSummary);
  React.useEffect(() => {
    if (!dirty.current) return;
    const t = setTimeout(() => setSummary(changed.length ? `Changed: ${changed.join(', ')}.` : initialSummary), 400);
    return () => clearTimeout(t);
  }, [changed]);

  const copyLink = async () => {
    const hash = encodeState(m, s);
    history.replaceState(null, '', window.location.pathname + window.location.search + hash);
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinked(true);
      setTimeout(() => setLinked(false), 2000);
    } catch {}
  };

  const tabs = [
    { key: 'compose', label: 'Docker Compose', text: compose, aria: 'docker-compose.yml', source: sources.compose, note: undefined as string | undefined },
    { key: 'run', label: 'docker run', text: run, aria: 'docker run command', source: undefined, note: undefined },
    ...(quadlet ? [{ key: 'quadlet', label: 'Quadlet', text: quadlet, aria: 'Podman quadlet', source: sources.quadlet, note: FACTS.quadlet.text }] : []),
    ...(k8s ? [{ key: 'k8s', label: 'Kubernetes', text: k8s, aria: 'Kubernetes manifest', source: sources.kubernetes, note: FACTS.k8sStatic.text }] : []),
  ];

  const identity = m.env.filter((e) => COMMON_ENV.includes(e.name));
  const requiredEnv = m.env.filter((e) => !e.optional && !COMMON_ENV.includes(e.name));
  const optionalEnv = m.env.filter((e) => e.optional && !COMMON_ENV.includes(e.name));
  const requiredVolumes = m.volumes.filter((v) => !v.optional);
  const requiredPorts = m.ports.filter((p) => !p.optional);
  const requiredDevices = m.devices.filter((d) => !d.optional);
  const alwaysOn = [
    ...m.caps.filter((c) => !c.optional).map((c) => ({ key: `cap_add: ${c.cap}`, desc: c.desc })),
    ...m.securityOpt.filter((x) => !x.optional).map((x) => ({ key: `security_opt: ${x.compose}`, desc: x.desc })),
    ...m.custom.filter((x) => !x.optional).map((x) => ({ key: `${x.compose}: ${x.values.join(', ')}`, desc: x.desc })),
    ...(m.network && !m.network.optional ? [{ key: `network_mode: ${m.network.mode}`, desc: FACTS.hostNetwork.text }] : []),
    ...(m.privileged === 'required' ? [{ key: 'privileged: true', desc: 'The image needs privileged mode.' }] : []),
  ];
  const optionalCount =
    optionalEnv.length + m.volumes.filter((v) => v.optional).length + m.ports.filter((p) => p.optional).length + m.devices.filter((d) => d.optional).length + m.caps.filter((c) => c.optional).length + m.securityOpt.filter((x) => x.optional).length + m.custom.filter((x) => x.optional).length + (m.hostname?.optional ? 1 : 0) + (m.mac?.optional ? 1 : 0) + (m.network?.optional ? 1 : 0) + (m.privileged === 'optional' ? 1 : 0) + (m.readonly ? 1 : 0) + (m.nonroot ? 1 : 0);
  const net = hostNet(m, s);

  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const modRows = m.mods.filter((x) => terms.every((t) => `${x.name} ${x.title} ${x.summary}`.toLowerCase().includes(t)));

  const envInput = (e: { id: string; name: string; value: string; options?: string[]; secret: boolean }, required: boolean) => {
    const value = valueOf(s, e.id, e.value);
    if (e.options?.length) {
      return (
        <Select value={value} onValueChange={(v) => setValue(e.id, v)}>
          <SelectTrigger id={fid(e.id)} className="w-full font-mono text-xs" aria-label={`${e.name} value`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {e.options.map((o) => (
              <SelectItem key={o} value={o} className="font-mono text-xs">
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    return <Input id={fid(e.id)} type={e.secret ? 'password' : 'text'} value={value} onChange={(ev) => setValue(e.id, ev.target.value)} className="font-mono text-xs" autoComplete="off" spellCheck={false} required={required} />;
  };

  /** A checkbox row for an optional item; `children` is its value control, shown when ticked. */
  const optionRow = (item: LabItem, label: React.ReactNode, children?: React.ReactNode) => {
    const on = isOn(s, item);
    return (
      <li key={item.id} className="min-w-0">
        <label className="flex items-start gap-2.5 text-sm">
          <input type="checkbox" id={fid(item.id)} className={CHECK} checked={on} onChange={(e) => toggle(item.id, e.target.checked)} />
          <span className="min-w-0">
            <span className="font-mono text-xs text-foreground">{label}</span>
            <Desc text={item.desc} className="block text-xs text-muted-foreground" />
          </span>
        </label>
        {on && children && <div className="mt-2 ml-6.5">{children}</div>}
      </li>
    );
  };

  const switchRow = (id: 'ro' | 'nonroot' | 'net' | 'priv', label: string, desc: string, children?: React.ReactNode) => (
    <li key={id}>
      <div className="flex items-start justify-between gap-3">
        <label htmlFor={fid(id)} className="min-w-0 text-sm">
          <span className="font-mono text-xs text-foreground">{label}</span>
          <Desc text={desc} className="block text-xs text-muted-foreground" />
        </label>
        <Switch id={fid(id)} checked={flagOn(s, id)} onCheckedChange={(v) => toggle(id, v)} className="mt-0.5" />
      </div>
      {flagOn(s, id) && children && <div className="mt-2">{children}</div>}
    </li>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <form className="min-w-0 border-b border-[var(--raft-hair)] bg-[var(--raft-surface)] xl:border-r xl:border-b-0" aria-label={`Configure ${m.name}`} onSubmit={(e) => e.preventDefault()}>
        <Group title="Image" open>
          <Field id={fid('tag')} label="Tag">
            <Select value={s.tag} onValueChange={(v) => update({ tag: v })}>
              <SelectTrigger id={fid('tag')} className="w-full font-mono text-xs" aria-label="Image tag">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Version tags</SelectLabel>
                  {m.tags.map((t) => (
                    <SelectItem key={t.tag} value={t.tag} className="font-mono text-xs">
                      {t.tag}
                      <span className="ml-2 font-sans text-muted-foreground">{t.desc}</span>
                    </SelectItem>
                  ))}
                </SelectGroup>
                {m.pinned.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>Pinned builds</SelectLabel>
                    {m.pinned.map((t) => (
                      <SelectItem key={t.tag} value={t.tag} className="font-mono text-xs">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field id={fid('name')} label="Container name">
              <Input id={fid('name')} value={s.name} onChange={(e) => update({ name: e.target.value })} className="font-mono text-xs" autoComplete="off" spellCheck={false} pattern="[a-zA-Z0-9][a-zA-Z0-9_.-]*" />
            </Field>
            <Field id={fid('restart')} label="Restart policy">
              <Select value={s.restart} onValueChange={(v) => update({ restart: v as Restart })}>
                <SelectTrigger id={fid('restart')} className="w-full font-mono text-xs" aria-label="Restart policy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESTART_POLICIES.map((r) => (
                    <SelectItem key={r} value={r} className="font-mono text-xs">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Group>

        {identity.length > 0 && (
          <Group title="Identity" open note="The user the application runs as and its timezone.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {identity.map((e) =>
                e.name === 'TZ' ? (
                  <Field key={e.id} id={fid(e.id)} label="TZ">
                    <Input id={fid(e.id)} list={fid('tzlist')} value={valueOf(s, e.id, e.value)} onChange={(ev) => setValue(e.id, ev.target.value)} className="font-mono text-xs" autoComplete="off" spellCheck={false} />
                    <datalist id={fid('tzlist')}>
                      {TIMEZONES.map((z) => (
                        <option key={z} value={z} />
                      ))}
                    </datalist>
                  </Field>
                ) : (
                  <Field key={e.id} id={fid(e.id)} label={e.name}>
                    <Input id={fid(e.id)} type="number" inputMode="numeric" min={0} value={valueOf(s, e.id, e.value)} onChange={(ev) => setValue(e.id, ev.target.value)} className="font-mono text-xs" />
                  </Field>
                ),
              )}
            </div>
          </Group>
        )}

        {(requiredEnv.length > 0 || requiredVolumes.length > 0 || requiredPorts.length > 0 || requiredDevices.length > 0 || alwaysOn.length > 0 || (m.hostname && !m.hostname.optional) || (m.mac && !m.mac.optional)) && (
          <Group title="Required" open>
            {requiredEnv.map((e) => (
              <Field key={e.id} id={fid(e.id)} label={e.name} hint={e.desc}>
                {envInput(e, true)}
              </Field>
            ))}
            {requiredVolumes.map((v) => (
              <Field key={v.id} id={fid(v.id)} label={<>Host folder for <span className="text-foreground">{v.path}</span>{v.ro ? ' (read-only)' : ''}</>} hint={v.desc}>
                <Input id={fid(v.id)} value={valueOf(s, v.id, v.host)} onChange={(e) => setValue(v.id, e.target.value)} className="font-mono text-xs" autoComplete="off" spellCheck={false} />
              </Field>
            ))}
            {!net &&
              requiredPorts.map((p) => (
                <Field key={p.id} id={fid(p.id)} label={<>Host port for <span className="text-foreground">{p.internal}</span></>} hint={p.desc}>
                  <Input id={fid(p.id)} inputMode="numeric" value={valueOf(s, p.id, p.external)} onChange={(e) => setValue(p.id, e.target.value)} className="max-w-32 font-mono text-xs" />
                </Field>
              ))}
            {requiredDevices.map((d) => (
              <Field key={d.id} id={fid(d.id)} label={<>Host device for <span className="text-foreground">{d.path}</span></>} hint={d.desc}>
                <Input id={fid(d.id)} value={valueOf(s, d.id, d.host)} onChange={(e) => setValue(d.id, e.target.value)} className="font-mono text-xs" autoComplete="off" spellCheck={false} />
              </Field>
            ))}
            {m.hostname && !m.hostname.optional && (
              <Field id={fid('hostname')} label="Hostname" hint={m.hostname.desc}>
                <Input id={fid('hostname')} value={valueOf(s, 'hostname', m.hostname.value)} onChange={(e) => setValue('hostname', e.target.value)} className="font-mono text-xs" />
              </Field>
            )}
            {m.mac && !m.mac.optional && (
              <Field id={fid('mac')} label="MAC address" hint={m.mac.desc}>
                <Input id={fid('mac')} value={valueOf(s, 'mac', m.mac.value)} onChange={(e) => setValue('mac', e.target.value)} className="font-mono text-xs" />
              </Field>
            )}
            {alwaysOn.length > 0 && (
              <ul className="space-y-1.5" aria-label="Always included">
                {alwaysOn.map((x) => (
                  <li key={x.key} className="text-xs text-muted-foreground">
                    <code className="font-mono text-foreground">{x.key}</code> <Desc text={x.desc} />
                  </li>
                ))}
              </ul>
            )}
          </Group>
        )}

        {optionalCount > 0 && (
          <Group title="Optional settings" count={optionalCount} note="Tick what you need; it is added to every output with its value.">
            <ul className="space-y-3">
              {m.volumes.filter((v) => v.optional).map((v) =>
                optionRow(
                  v,
                  <>
                    {v.path}
                    {v.ro ? ' (read-only)' : ''}
                  </>,
                  <Field id={fid(`${v.id}-host`)} label="Host folder">
                    <Input id={fid(`${v.id}-host`)} value={valueOf(s, v.id, v.host)} onChange={(e) => setValue(v.id, e.target.value)} className="font-mono text-xs" autoComplete="off" spellCheck={false} />
                  </Field>,
                ),
              )}
              {!net &&
                m.ports.filter((p) => p.optional).map((p) =>
                  optionRow(
                    p,
                    <>port {p.internal}</>,
                    <Field id={fid(`${p.id}-host`)} label="Host port">
                      <Input id={fid(`${p.id}-host`)} inputMode="numeric" value={valueOf(s, p.id, p.external)} onChange={(e) => setValue(p.id, e.target.value)} className="max-w-32 font-mono text-xs" />
                    </Field>,
                  ),
                )}
              {optionalEnv.map((e) =>
                optionRow(
                  e,
                  e.name,
                  <Field id={fid(e.id)} label="Value">
                    {envInput(e, false)}
                  </Field>,
                ),
              )}
              {m.devices.filter((d) => d.optional).map((d) =>
                optionRow(
                  d,
                  <>device {d.path}</>,
                  <Field id={fid(`${d.id}-host`)} label="Host device">
                    <Input id={fid(`${d.id}-host`)} value={valueOf(s, d.id, d.host)} onChange={(e) => setValue(d.id, e.target.value)} className="font-mono text-xs" autoComplete="off" spellCheck={false} />
                  </Field>,
                ),
              )}
              {m.caps.filter((c) => c.optional).map((c) => optionRow(c, <>cap_add {c.cap}</>))}
              {m.securityOpt.filter((x) => x.optional).map((x) => optionRow(x, <>security_opt {x.compose}</>))}
              {m.custom.filter((x) => x.optional).map((x) => optionRow(x, <>{x.compose}: {x.values.join(', ')}</>))}
              {m.hostname?.optional &&
                optionRow(
                  m.hostname,
                  'hostname',
                  <Field id={fid('hostname-v')} label="Hostname">
                    <Input id={fid('hostname-v')} value={valueOf(s, 'hostname', m.hostname.value)} onChange={(e) => setValue('hostname', e.target.value)} className="font-mono text-xs" />
                  </Field>,
                )}
              {m.mac?.optional &&
                optionRow(
                  m.mac,
                  'mac_address',
                  <Field id={fid('mac-v')} label="MAC address">
                    <Input id={fid('mac-v')} value={valueOf(s, 'mac', m.mac.value)} onChange={(e) => setValue('mac', e.target.value)} className="font-mono text-xs" />
                  </Field>,
                )}
              {m.network?.optional && switchRow('net', `network_mode: ${m.network.mode}`, FACTS.hostNetwork.text)}
              {m.privileged === 'optional' && switchRow('priv', 'privileged: true', FACTS.privileged.text)}
              {m.readonly && switchRow('ro', 'Read-only root filesystem', 'Tested with this image. Adds `read_only: true` and a tmpfs at `/run`; PUID, PGID and mods stop applying.')}
              {m.nonroot &&
                switchRow(
                  'nonroot',
                  'Run as a non-root user',
                  'Tested with this image. Adds `user:`; PUID and PGID are ignored and mods do not run.',
                  <Field id={fid('user')} label="uid:gid">
                    <Input id={fid('user')} value={s.user} onChange={(e) => update({ user: e.target.value })} pattern="\d+(:\d+)?" className="max-w-40 font-mono text-xs" autoComplete="off" />
                  </Field>,
                )}
            </ul>
          </Group>
        )}

        {m.mods.length > 0 && (
          <Group title="Mods" count={s.mods.length || undefined} note={`${m.mods.filter((x) => !x.universal).length} for ${m.name} and ${m.mods.filter((x) => x.universal).length} universal. Ticked mods join one DOCKER_MODS value in the order you tick them.`}>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <label htmlFor={fid('modq')} className="sr-only">
                Filter mods
              </label>
              <Input id={fid('modq')} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Filter ${m.mods.length} mods…`} autoComplete="off" spellCheck={false} className="pl-8 text-xs" />
            </div>
            <ul className="max-h-[22rem] space-y-3 overflow-y-auto pr-1" id={fid('mods')}>
              {modRows.map((mod) => {
                const on = s.mods.includes(mod.id);
                return (
                  <li key={mod.id} className="min-w-0">
                    <label className="flex items-start gap-2.5 text-sm">
                      <input type="checkbox" id={fid(`mod-${mod.id}`)} className={CHECK} checked={on} onChange={(e) => toggleMod(mod.id, e.target.checked)} />
                      <span className="min-w-0">
                        <span className="font-medium">{mod.title}</span>
                        <span className="ml-2 font-mono text-[0.6875rem] text-muted-foreground">{mod.universal ? 'universal' : m.name}</span>
                        {mod.deprecated && <span className="ml-2 rounded bg-destructive/15 px-1.5 py-px font-mono text-[0.6875rem] text-destructive">deprecated</span>}
                        <Desc text={mod.summary} className="line-clamp-2 block text-xs text-muted-foreground" />
                      </span>
                    </label>
                    {on && <ModSettings mod={mod} s={s} fid={fid} onChange={(key, v) => update((p) => ({ ...p, modEnv: { ...p.modEnv, [key]: v } }))} />}
                  </li>
                );
              })}
              {modRows.length === 0 && <li className="text-xs text-muted-foreground">No mod matches.</li>}
            </ul>
          </Group>
        )}
      </form>

      <div className="min-w-0">
        <Tabs value={tab} onValueChange={setTab} className="gap-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-3 py-2">
            <TabsList aria-label={`Ways to run ${m.name}`} className="h-auto flex-wrap">
              {tabs.map((t) => (
                <TabsTrigger key={t.key} value={t.key}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex items-center gap-1">
              <button type="button" onClick={copyLink} className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                <LinkIcon className="size-3.5" aria-hidden="true" /> {linked ? 'Link copied' : 'Copy link to this config'}
              </button>
              <button type="button" onClick={reset} disabled={changed.length === 0} className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50">
                <RotateCcw className="size-3.5" aria-hidden="true" /> Reset to defaults
              </button>
            </div>
          </div>
          {tabs.map((t) => (
            <TabsContent key={t.key} value={t.key} className="relative">
              <pre className="max-h-[32rem] overflow-auto bg-[var(--raft-code-bg)] p-4 pr-14 font-mono text-[0.8125rem] leading-relaxed" tabIndex={0} aria-label={t.aria}>
                <code>{t.text}</code>
              </pre>
              <CopyButton text={t.text} label={`Copy ${t.aria}`} className="absolute top-2 right-2" variant="secondary" />
              {(t.note || t.source) && (
                <div className="space-y-1 border-t border-border px-4 py-2 text-[0.6875rem] text-muted-foreground">
                  {t.note && <Desc text={t.note} className="block" />}
                  {t.source && (
                    <p className="font-mono">
                      Based on the hub's generated file:{' '}
                      <a href={t.source} className="break-all underline underline-offset-4 decoration-[var(--raft-hair-strong)] hover:text-foreground hover:decoration-current">
                        {t.source.replace(/^https?:\/\//, '')}
                      </a>
                    </p>
                  )}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
        <p role="status" aria-live="polite" className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          {summary}
        </p>
        {hints.length > 0 && (
          <ul className="space-y-2 border-t border-border px-4 py-3" aria-label="Hints">
            {hints.map((h) => (
              <li key={h.id} className="flex gap-2 text-xs">
                {h.tone === 'warn' ? <AlertTriangle className="mt-px size-3.5 shrink-0 text-destructive" aria-hidden="true" /> : <Info className="mt-px size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />}
                <span className="min-w-0 text-muted-foreground">
                  {h.tone === 'warn' && <span className="sr-only">Warning: </span>}
                  <Desc text={h.text} />
                  {h.link && (
                    <>
                      {' '}
                      <a href={h.link.href} target="_blank" rel="noopener" className="underline underline-offset-4 decoration-[var(--raft-hair-strong)] hover:text-foreground hover:decoration-current">
                        {h.link.label}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </>
                  )}
                  {h.field && (
                    <>
                      {' '}
                      <button type="button" onClick={() => focusField(fid(h.field!))} className="underline underline-offset-4 decoration-[var(--raft-hair-strong)] hover:text-foreground hover:decoration-current">
                        Go to setting
                      </button>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Opens the <details> around a control and focuses it. */
function focusField(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  for (let p = el.parentElement; p; p = p.parentElement) if (p instanceof HTMLDetailsElement) p.open = true;
  el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  el.focus({ preventScroll: true });
}

function ModSettings({ mod, s, fid, onChange }: { mod: LabMod; s: LabState; fid: (id: string) => string; onChange: (key: string, v: string) => void }) {
  if (!mod.hasManifest || mod.env.length === 0) {
    return (
      <p className="mt-1.5 ml-6.5 text-xs text-muted-foreground">
        {mod.hasManifest ? 'No settings.' : 'No settings data in the hub yet; see the'}{' '}
        {!mod.hasManifest && (
          <a href={mod.url} target="_blank" rel="noopener" className="underline underline-offset-4 decoration-[var(--raft-hair-strong)] hover:text-foreground hover:decoration-current">
            mod README<span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
        {!mod.hasManifest && '.'}
      </p>
    );
  }
  return (
    <ul className="mt-2 ml-6.5 space-y-2">
      {mod.env.map((e) => {
        const key = `${mod.id}/${e.name}`;
        const value = modEnvValue(s, mod, e);
        const id = fid(`mod-${key}`);
        return (
          <li key={e.name}>
            <Field id={id} label={<>{e.name}{e.required && <span className="text-destructive"> *</span>}</>} hint={e.description}>
              <Input id={id} type={/TOKEN|PASS|KEY/i.test(e.name) ? 'password' : 'text'} value={value} onChange={(ev) => onChange(key, ev.target.value)} className="font-mono text-xs" autoComplete="off" spellCheck={false} required={e.required} aria-invalid={e.required && value === '' ? true : undefined} />
            </Field>
          </li>
        );
      })}
    </ul>
  );
}
