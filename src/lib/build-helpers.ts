/**
 * Build helpers with no data behind them, safe in the browser: the live build page (rendered from the hub when
 * the static site predates a build) uses them as well as the build-time pages. builds.ts re-exports them.
 */
import type { BuildSummary, Classification } from './hub';

export const buildUrl = (image: string, tag: string) => `/images/${image}/builds/${tag}/`;

export const CLASSIFICATION: Record<Classification, { label: string; desc: string }> = {
  upstream: { label: 'upstream', desc: 'The upstream version changed.' },
  packages: { label: 'packages', desc: 'Only packages changed.' },
  linuxserver: { label: 'linuxserver', desc: 'The Dockerfile or the image repository changed with the same upstream version.' },
  base: { label: 'base', desc: 'The base image digest changed.' },
  mixed: { label: 'mixed', desc: 'More than one kind of change.' },
  none: { label: 'identical', desc: 'An identical rebuild.' },
  initial: { label: 'initial', desc: 'The first build of this branch the hub has seen.' },
};

export const classify = (c?: Classification | null) => (c ? CLASSIFICATION[c] : undefined);

/** Human reason for a build: "rebuild", "upstream", "push"… as the workflow reported it. */
export const REASONS: Record<string, string> = {
  rebuild: 'scheduled rebuild',
  upstream: 'new upstream version',
  push: 'commit to the branch',
  manual: 'manual trigger',
  base: 'base image update',
  dispatch: 'scheduler dispatch',
};
export const reasonLabel = (r: string) => REASONS[r] ?? r;

/** Result over all platforms: success when every one succeeded. */
export function buildResult(summary: Pick<BuildSummary, 'platforms' | 'test_success'>): 'success' | 'failure' | 'partial' {
  const ok = summary.platforms.filter((p) => p.result === 'success').length;
  if (ok === summary.platforms.length && summary.test_success !== false) return 'success';
  if (ok === 0) return 'failure';
  return summary.test_success === false ? 'failure' : 'partial';
}
