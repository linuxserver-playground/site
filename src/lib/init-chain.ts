/**
 * The chain of base images under a build, for the init graph: which base image defines each inherited s6 unit,
 * and the build of that base to read its run script from. Browser-safe: the static build page resolves the chain
 * from the snapshots, the live build page and the island resolve it from the hub's API.
 *
 * A build records its base as the digest of the base build's multi-arch index (`base.digest`), and the hub lists
 * every build's `index_digest`, so the exact base build is a lookup. When the hub no longer holds it (the newest 5
 * per branch rotate), the newest build the base's floating tag points at stands in, marked inexact: init scripts
 * change rarely, and the label says so. A base outside the playground, or a build without a recorded base, ends
 * the chain.
 */
import type { BuildBase, BuildSummary, Bundle, InitUnit } from './hub';
import { hubApi } from './hub';

export interface ChainHop {
  /** The base image's name in the catalogue (`baseimage-selkies`). */
  image: string;
  /** The build of it this hop reads: the exact one when held, else the newest build of the floating tag. */
  tag: string;
  /** The FROM reference, short: `baseimage-selkies:ubunturesolute`. */
  ref: string;
  exact: boolean;
  /** What that build in turn was built on, for the next hop. */
  base: BuildBase;
}

export type ChainEnd =
  | { kind: 'root' }
  | { kind: 'upstream'; image: string }
  | { kind: 'missing'; image: string }
  | { kind: 'unknown' };

export interface InitChain {
  hops: ChainHop[];
  end: ChainEnd;
}

export type BaseLookup = (image: string) => BuildSummary[] | null | Promise<BuildSummary[] | null>;

const PLAYGROUND = /^(?:ghcr\.io\/)?linuxserver-playground\/([^/:@]+)(?::([^@]+))?(?:@.*)?$/;

/** `ghcr.io/linuxserver-playground/baseimage-selkies:ubunturesolute@sha256:…` → name and tag; null for `scratch` or
 * an image outside the playground. */
export function parseBaseRef(image: string | null | undefined): { name: string; tag: string } | null {
  if (!image || image === 'scratch') return null;
  const m = image.match(PLAYGROUND);
  return m ? { name: m[1], tag: m[2] ?? 'latest' } : null;
}

export const shortRef = (image: string) => image.split('@', 1)[0].replace(/^.*\//, '');

/** The build of `base` among `builds`: by index digest when held, else the newest build of the floating tag. */
export function matchBaseBuild(builds: BuildSummary[], base: BuildBase): { build: BuildSummary; exact: boolean } | null {
  if (base.digest) {
    const exact = builds.find((b) => b.index_digest && b.index_digest === base.digest);
    if (exact) return { build: exact, exact: true };
  }
  const ref = parseBaseRef(base.image);
  if (!ref) return null;
  const floating = builds.filter((b) => b.tags?.includes(ref.tag)).sort((a, b) => b.created.localeCompare(a.created));
  return floating.length ? { build: floating[0], exact: false } : null;
}

const MAX_HOPS = 4;

/** Walks the bases down from `base` until scratch, an image not built here, or a base without a held build. */
export async function resolveChain(base: BuildBase | null | undefined, lookup: BaseLookup): Promise<InitChain> {
  const hops: ChainHop[] = [];
  let current = base;
  while (hops.length < MAX_HOPS) {
    if (!current || !current.image || current.image === 'scratch') return { hops, end: { kind: 'root' } };
    const ref = parseBaseRef(current.image);
    if (!ref) return { hops, end: { kind: 'upstream', image: shortRef(current.image) } };
    const builds = await lookup(ref.name);
    const match = builds?.length ? matchBaseBuild(builds, current) : null;
    if (!match) return { hops, end: { kind: 'missing', image: shortRef(current.image) } };
    hops.push({ image: ref.name, tag: match.build.tag, ref: shortRef(current.image), exact: match.exact, base: match.build.base });
    current = match.build.base;
  }
  return { hops, end: { kind: 'unknown' } };
}

/** A hub document's `data`, null on 404 (every hub response is an envelope: `status`, `last_updated`, `data`). */
async function hubJSON<T>(path: string): Promise<T | null> {
  const res = await fetch(hubApi(path), { mode: 'cors' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${res.status} for ${path}`);
  return ((await res.json()) as { data: T }).data;
}

/** The hub's builds list of an image, for resolving in the browser. 404 means the image is not in the catalogue. */
export const hubLookup: BaseLookup = async (image) => (await hubJSON<{ builds: BuildSummary[] }>(`catalog/${image}/builds.json`))?.builds ?? null;

export interface BaseLayers {
  chain: InitChain;
  /** Each hop's init units from its build, null when that document could not be read. */
  hops: (InitUnit[] | null)[];
}

/** Resolves the chain (from the hub when the page did not) and reads each hop's build for its init units. */
export async function loadBaseLayers(base: BuildBase, chain?: InitChain | null): Promise<BaseLayers> {
  const resolved = chain ?? (await resolveChain(base, hubLookup));
  const hops = await Promise.all(
    resolved.hops.map(async (hop) => {
      try {
        const doc = await hubJSON<{ build: Bundle }>(`catalog/${hop.image}/builds/${hop.tag}.json`);
        return doc ? (doc.build.init_graph?.units ?? []) : null;
      } catch {
        return null;
      }
    })
  );
  return { chain: resolved, hops };
}

export interface Attribution {
  /** Index into the chain's hops. */
  hop: number;
  script: string | null;
}

/**
 * Which base image defines each unit: the first hop whose build lists the unit as its own. A unit this build calls
 * its own stays its own unless a hop owns a byte-identical script, which means the build's record predates the
 * attribution by repository (every intermediate base's unit was then recorded as the image's) and the base is the
 * author. An own unit with a different script is an override and stays.
 */
export function attributeUnits(units: InitUnit[], hops: (InitUnit[] | null)[]): Map<string, Attribution> {
  const own = hops.map((h) => new Map((h ?? []).filter((u) => u.source === 'image').map((u) => [u.name, u])));
  const out = new Map<string, Attribution>();
  for (const unit of units) {
    if (unit.source === 'mod') continue;
    for (let i = 0; i < own.length; i++) {
      const theirs = own[i].get(unit.name);
      if (!theirs) continue;
      if (unit.source === 'image' && (unit.script ?? null) !== (theirs.script ?? null)) break;
      out.set(unit.name, { hop: i, script: theirs.script ?? null });
      break;
    }
  }
  return out;
}

/** Why an inherited unit has no script after the chain was read, in a sentence. */
export function unresolvedReason(chain: InitChain, hops: (InitUnit[] | null)[]): string {
  const last = chain.hops[chain.hops.length - 1];
  if (hops.some((h) => h === null)) return 'A base image’s build could not be read from the hub.';
  switch (chain.end.kind) {
    case 'upstream':
      return `Defined in ${chain.end.image}, which is not built here.`;
    case 'missing':
      return `Defined in ${chain.end.image}, of which no build is held.`;
    case 'unknown':
      return 'The chain of base images is deeper than the hub records.';
    default:
      return last
        ? `Defined in a base image, but ${last.ref}’s build predates recorded base scripts.`
        : 'This build records no base image.';
  }
}
