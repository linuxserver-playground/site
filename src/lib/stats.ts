/**
 * Headline numbers, from src/data/stats.json (written by `npm run data` from the hub's /api/v1/stats.json,
 * GitHub and Open Collective). Each stat carries its own label, long-form text for screen readers and a
 * source note, so every page presents the same facts the same honest way. There are no pull counts: the
 * playground publishes to GHCR only and the hub has no download statistics, so none are shown.
 */
import raw from '@/data/stats.json';
import { grouped } from './format';

export const STATS = raw as {
  generated: string;
  last_updated: string;
  images: number;
  deprecated: number;
  stars: number;
  builds: number;
  retained_builds: number;
  arm64: number;
  readonly_supported: number;
  nonroot_supported: number;
  updated_this_week: number;
  categories: number;
  since: string | null;
  team: number;
  backers: number | null;
};

export interface Stat {
  id: string;
  value: string;
  /** Raw number, for meters and percentages. */
  raw: number;
  suffix?: string;
  label: string;
  /** Full sentence for screen readers / tooltips. */
  long: string;
  source: string;
}

const HUB = 'The hub, /api/v1/stats.json.';
const sinceYear = STATS.since ? new Date(STATS.since).getUTCFullYear() : null;
const years = sinceYear ? Math.floor((Date.parse(STATS.generated) - Date.parse(STATS.since!)) / (365.25 * 864e5)) : 0;

const stats = {
  images: {
    id: 'images',
    value: grouped(STATS.images),
    raw: STATS.images,
    label: 'maintained images',
    long: `${STATS.images} actively maintained images`,
    source: `${HUB} Deprecated images are not counted.`,
  },
  builds: {
    id: 'builds',
    value: grouped(STATS.builds),
    raw: STATS.builds,
    label: 'build records',
    long: `${grouped(STATS.builds)} build records held by the hub`,
    source: `${HUB} The newest ten builds per branch are kept; older ones stay on their GitHub Release.`,
  },
  stars: {
    id: 'stars',
    value: grouped(STATS.stars),
    raw: STATS.stars,
    label: 'GitHub stars',
    long: `${grouped(STATS.stars)} stars across the image repositories`,
    source: 'GitHub, summed over current image repositories by the hub (hourly).',
  },
  arm64: {
    id: 'arm64',
    value: grouped(STATS.arm64),
    raw: STATS.arm64,
    label: 'multi-arch images',
    long: `${STATS.arm64} images built for both x86-64 and arm64`,
    source: 'Catalogue architectures (from each image’s build platforms).',
  },
  updatedThisWeek: {
    id: 'updated-week',
    value: grouped(STATS.updated_this_week),
    raw: STATS.updated_this_week,
    label: 'images rebuilt this week',
    long: `${STATS.updated_this_week} images rebuilt in the last seven days`,
    source: `${HUB} Build timestamps in the seven days before the hub’s last refresh.`,
  },
  readonly: {
    id: 'readonly',
    value: grouped(STATS.readonly_supported),
    raw: STATS.readonly_supported,
    label: 'read-only capable',
    long: `${STATS.readonly_supported} images support a read-only root filesystem`,
    source: `${HUB} \`readonly_supported\` in the manifest.`,
  },
  nonroot: {
    id: 'nonroot',
    value: grouped(STATS.nonroot_supported),
    raw: STATS.nonroot_supported,
    label: 'run as non-root',
    long: `${STATS.nonroot_supported} images support running as a non-root user`,
    source: `${HUB} \`nonroot_supported\` in the manifest.`,
  },
  categories: {
    id: 'categories',
    value: grouped(STATS.categories),
    raw: STATS.categories,
    label: 'categories',
    long: `${STATS.categories} categories`,
    source: HUB,
  },
  years: {
    id: 'years',
    value: String(years),
    raw: years,
    suffix: '+',
    label: 'years of images',
    long: sinceYear ? `Building images since ${sinceYear}` : 'Years of images',
    source: 'Oldest first-build date in the catalogue.',
  },
  team: {
    id: 'team',
    value: String(STATS.team),
    raw: STATS.team,
    label: 'public members',
    long: `${STATS.team} public members of the GitHub organisation`,
    source: 'Public members of the linuxserver-playground GitHub organisation.',
  },
  backers: {
    id: 'backers',
    value: grouped(STATS.backers ?? 0),
    raw: STATS.backers ?? 0,
    label: 'backers',
    long: `${grouped(STATS.backers ?? 0)} backers on Open Collective`,
    source: 'Open Collective.',
  },
} satisfies Record<string, Stat>;

/** Every stat typed as Stat, so optional fields like `suffix` can be read on any of them. */
export const stat: Record<keyof typeof stats, Stat> = stats;

/** Stats whose number exists; a tile for a missing one would be a lie. */
export const hasBackers = STATS.backers !== null;
export const hasTeam = STATS.team > 0;
export const hasSince = sinceYear !== null;

export const SINCE_YEAR = sinceYear ?? new Date(STATS.generated).getUTCFullYear();
