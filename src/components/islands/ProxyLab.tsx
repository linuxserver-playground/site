import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { applyProxy, defaultChoice, PROXY_AUTHS, proxyChanges, proxyFile, type ProxyAuth, type ProxyChoice, type ProxyMode, type ProxySample } from '@/lib/proxy';
import { inlineMarkdown } from '@/lib/markdown/inline';
import CopyButton from './CopyButton';

interface Props {
  sample: ProxySample;
  /** The hub's proxy.json for this image, for the source link. */
  source?: string;
}

/**
 * The reverse proxy lab: the hub's SWAG sample for this image with the mode, container name, upstream
 * port, scheme and auth include chosen by the visitor. Server-rendered with the subdomain sample as is.
 */
export default function ProxyLab({ sample, source }: Props) {
  const id = React.useId();
  const [c, setC] = React.useState<ProxyChoice>(() => defaultChoice(sample));
  const set = (patch: Partial<ProxyChoice>) => setC((p) => ({ ...p, ...patch }));
  const text = React.useMemo(() => applyProxy(sample, c), [sample, c]);
  const changed = React.useMemo(() => proxyChanges(sample, c), [sample, c]);
  const file = proxyFile(sample.image, c.mode);
  const [summary, setSummary] = React.useState('Default sample.');
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) return void (first.current = false);
    const t = setTimeout(() => setSummary(changed.length ? `Changed: ${changed.join(', ')}.` : 'Default sample.'), 400);
    return () => clearTimeout(t);
  }, [changed]);

  const selectCls = 'w-full font-mono text-xs';
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <form className="min-w-0 space-y-3 border-b border-[var(--raft-hair)] bg-[var(--raft-surface)] p-4 xl:border-r xl:border-b-0" aria-label={`Proxy settings for ${sample.image}`} onSubmit={(e) => e.preventDefault()}>
        {sample.subfolder && (
          <div>
            <label htmlFor={`${id}-mode`} className="block font-mono text-xs text-muted-foreground">
              Mode
            </label>
            <Select value={c.mode} onValueChange={(v) => set({ mode: v as ProxyMode })}>
              <SelectTrigger id={`${id}-mode`} className={`mt-1 ${selectCls}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="subdomain" className="font-mono text-xs">
                  subdomain <span className="font-sans text-muted-foreground">{sample.image}.yourdomain.com</span>
                </SelectItem>
                <SelectItem value="subfolder" className="font-mono text-xs">
                  subfolder <span className="font-sans text-muted-foreground">yourdomain.com/{sample.image}</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div>
          <label htmlFor={`${id}-name`} className="block font-mono text-xs text-muted-foreground">
            Container name
          </label>
          <Input id={`${id}-name`} value={c.name} onChange={(e) => set({ name: e.target.value })} className="mt-1 font-mono text-xs" autoComplete="off" spellCheck={false} pattern="[a-zA-Z0-9][a-zA-Z0-9_.-]*" />
          <p className="mt-1 text-xs text-muted-foreground">What you named the {sample.image} container; SWAG resolves it on the shared network.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${id}-port`} className="block font-mono text-xs text-muted-foreground">
              Upstream port
            </label>
            <Input id={`${id}-port`} inputMode="numeric" pattern="\d+" value={c.port} onChange={(e) => set({ port: e.target.value })} className="mt-1 font-mono text-xs" />
          </div>
          <div>
            <label htmlFor={`${id}-scheme`} className="block font-mono text-xs text-muted-foreground">
              Scheme
            </label>
            <Select value={c.scheme} onValueChange={(v) => set({ scheme: v })}>
              <SelectTrigger id={`${id}-scheme`} className={`mt-1 ${selectCls}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[...new Set(['http', 'https', sample.scheme])].map((s) => (
                  <SelectItem key={s} value={s} className="font-mono text-xs">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <label htmlFor={`${id}-auth`} className="block font-mono text-xs text-muted-foreground">
            Authentication
          </label>
          <Select value={c.auth} onValueChange={(v) => set({ auth: v as ProxyAuth })}>
            <SelectTrigger id={`${id}-auth`} className={`mt-1 ${selectCls}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROXY_AUTHS.map((a) => (
                <SelectItem key={a.key} value={a.key} className="text-xs">
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-muted-foreground">Uncomments the matching include lines; API locations stay open so client apps keep working.</p>
        </div>
        <ul className="space-y-1.5 border-t border-[var(--raft-hair)] pt-3 text-xs text-muted-foreground">
          <li>
            Save as <code className="font-mono text-foreground break-all">{file}</code> in SWAG (drop the <code className="font-mono">.sample</code>) and restart SWAG.
          </li>
          {c.mode === 'subdomain' ? (
            <li>
              Your DNS needs a record for <code className="font-mono text-foreground">{sample.image}.yourdomain.com</code> (a CNAME to the domain, or a wildcard), and SWAG's{' '}
              <code className="font-mono text-foreground">SUBDOMAINS</code> must cover it.
            </li>
          ) : (
            sample.baseUrlNote && <li dangerouslySetInnerHTML={{ __html: inlineMarkdown(sample.baseUrlNote) }} />
          )}
          <li>
            The <code className="font-mono text-foreground">{c.name.trim() || sample.name}</code> container and SWAG must share a user-defined Docker network so the name resolves.
          </li>
        </ul>
      </form>
      <div className="relative min-w-0">
        <pre className="max-h-[28rem] overflow-auto bg-[var(--raft-code-bg)] p-4 pr-14 font-mono text-[0.75rem] leading-relaxed" tabIndex={0} aria-label={`SWAG ${c.mode} proxy conf`}>
          <code>{text}</code>
        </pre>
        <CopyButton text={text} label={`Copy SWAG ${c.mode} proxy conf`} className="absolute top-2 right-2" variant="secondary" />
        <p role="status" aria-live="polite" className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          {summary}
        </p>
        {source && (
          <p className="border-t border-border px-4 py-2 font-mono text-[0.6875rem] text-muted-foreground">
            Source:{' '}
            <a href={source} className="break-all underline underline-offset-4 decoration-[var(--raft-hair-strong)] hover:text-foreground hover:decoration-current">
              {source.replace(/^https?:\/\//, '')}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
