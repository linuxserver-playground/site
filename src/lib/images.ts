/**
 * The image catalogue, read from the src/data/catalog.json snapshot of the hub's /api/v1/catalog.json.
 * Refresh with `npm run data` (or `npm run data:local` against a hub checkout).
 */
import { getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';
import snapshot from '@/data/catalog.json';
import categoriesSnapshot from '@/data/categories.json';
import type { Category as HubCategory, ImageDetail } from './hub';
import { isoWeek } from './format';

export type { ImageConfig, ImageDetail, ReleaseInfo } from './hub';

export interface Image extends ImageDetail {
  /** Description with Markdown links reduced to their text. */
  summary: string;
  arm64: boolean;
  url: string;
  logo: ImageMetadata | null;
  /** `ghcr.io/linuxserver-playground/<name>` */
  ref: string;
}

const logos = import.meta.glob<{ default: ImageMetadata }>('/src/assets/logos/*.{png,jpg,gif,svg,webp}', { eager: true });
const logoFor = (name: string): ImageMetadata | null => {
  for (const ext of ['png', 'svg', 'jpg', 'webp', 'gif']) {
    const m = logos[`/src/assets/logos/${name}.${ext}`];
    if (m) return m.default;
  }
  return null;
};

/** "[AudioSilo] is…" / "[text](url)" -> plain text. */
export function plainDescription(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

const all: Image[] = (snapshot.images as unknown as ImageDetail[])
  .map((i) => ({
    ...i,
    categories: i.categories?.length ? i.categories : (i.category ?? '').split(',').map((c) => c.trim()).filter(Boolean),
    summary: plainDescription(i.description ?? ''),
    arm64: i.architectures.some((a) => a.arch === 'arm64'),
    url: `/images/${i.name}/`,
    logo: logoFor(i.name),
    ref: i.registries.ghcr,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

/** When the hub last refreshed its data. Use this, not `new Date()`, for "updated 3 days ago" style text. */
export const SNAPSHOT_DATE = new Date(snapshot.last_updated.replace(' ', 'T'));

/** `2026-10-24 20:55:30+00:00` -> Date */
export const hubDate = (s: string) => new Date(s.replace(' ', 'T'));

export const getAllImages = () => all;
export const getImages = () => all.filter((i) => !i.deprecated);
export const getImage = (name: string) => all.find((i) => i.name === name);

export interface Category {
  name: string;
  slug: string;
  count: number;
  images: string[];
}

/** From the hub's /api/v1/categories.json, largest first. */
export function getCategories(): Category[] {
  return [...(categoriesSnapshot as HubCategory[])].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export const mostStarred = (n = 8) => [...getImages()].sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name)).slice(0, n);
export const recentlyUpdated = (n = 8) =>
  [...getImages()].sort((a, b) => b.version_timestamp.localeCompare(a.version_timestamp)).slice(0, n);

/** Newest additions to the fleet, by first build date. */
export const newest = (n = 8) =>
  getImages()
    .filter((i) => i.initial_date)
    .sort((a, b) => b.initial_date!.localeCompare(a.initial_date!))
    .slice(0, n);

export function relatedImages(image: Image, n = 4): Image[] {
  const cats = new Set(image.categories);
  return getImages()
    .filter((i) => i.name !== image.name)
    .map((i) => ({ i, score: i.categories.filter((c) => cats.has(c)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.i.stars - a.i.stars || a.i.name.localeCompare(b.i.name))
    .slice(0, n)
    .map((x) => x.i);
}

export interface Spotlight {
  /** "2026-W43" */
  week: string;
  image: Image;
  /** Note from src/content/spotlight.yaml, if the entry has one. */
  note?: string;
  by?: string;
  /** Other recent additions, for a "new this season" strip next to the spotlight. */
  alsoNew: Image[];
}

/** The Monday the rotation starts from: the first image in spotlight.yaml is featured this week. */
const ROTATION_START = Date.UTC(2026, 9, 19);
const WEEK = 7 * 864e5;

/**
 * The weekly spotlight: the images in src/content/spotlight.yaml take turns, one per week, in file order,
 * changing every Monday (CI builds daily). An image name that doesn't exist, or is deprecated, fails the
 * build so a typo can't slip through.
 */
export async function getSpotlight(now = new Date()): Promise<Spotlight> {
  const { year, week } = isoWeek(now);
  const entries = (await getCollection('spotlight')).sort((a, b) => a.data.position - b.data.position);
  if (!entries.length) throw new Error('src/content/spotlight.yaml needs at least one image');
  for (const e of entries) {
    const img = getImage(e.id);
    if (!img) throw new Error(`src/content/spotlight.yaml: there is no image called "${e.id}"`);
    if (img.deprecated) throw new Error(`src/content/spotlight.yaml: "${e.id}" is deprecated`);
  }
  const monday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - ((now.getUTCDay() + 6) % 7) * 864e5;
  const turn = Math.round((monday - ROTATION_START) / WEEK);
  const entry = entries[((turn % entries.length) + entries.length) % entries.length];
  const image = getImage(entry.id)!;
  return {
    week: `${year}-W${String(week).padStart(2, '0')}`,
    image,
    note: entry.data.note,
    by: entry.data.by,
    alsoNew: newest(7).filter((i) => i.name !== image.name).slice(0, 6),
  };
}

// ---------------------------------------------------------------------------------------------------
// Quick start snippets. The hub generates them with `builder.snippets` (optional entries marked
// `#optional`); the required-only variant strips those lines and any list key left empty.

const OPTIONAL = /\s*(`#optional`|#\s?optional)\s*\\?\s*$/;

function stripOptional(snippet: string): string {
  const lines = snippet.split('\n');
  const kept: string[] = [];
  for (const line of lines) {
    if (OPTIONAL.test(line)) {
      // docker run continuation lines end with " \"; dropping one must not break the chain, and it
      // doesn't: every remaining line still ends with its own backslash.
      continue;
    }
    kept.push(line);
  }
  // A compose key whose children were all optional ("volumes:" followed by nothing deeper) goes too.
  const indent = (s: string) => s.match(/^\s*/)![0].length;
  return kept
    .filter((line, i) => {
      if (!/^\s+[\w-]+:\s*$/.test(line)) return true;
      const next = kept[i + 1];
      return next !== undefined && indent(next) > indent(line);
    })
    .join('\n');
}

export function composeSnippet(image: Image, { optional = true } = {}): string {
  const s = image.snippets.docker_compose.trimEnd();
  return optional ? s : stripOptional(s);
}

export function dockerRunSnippet(image: Image, { optional = true } = {}): string {
  const s = image.snippets.docker_run.trimEnd();
  return optional ? s : stripOptional(s);
}

/** Slim records for client-side islands (catalogue filtering, command palette). Logos are resolved by the caller. */
export interface ImageCard {
  name: string;
  summary: string;
  categories: string[];
  version: string;
  updated: string;
  added?: string;
  stars: number;
  arm64: boolean;
  deprecated: boolean;
  /** Base image family from the manifest (alpine, ubuntu…). */
  base?: string;
  /** Number of live branches (release tags). */
  channels: number;
  url: string;
  logo?: string;
}

export function toCard(i: Image, logo?: string): ImageCard {
  return {
    name: i.name,
    summary: i.summary,
    categories: i.categories,
    version: i.version,
    updated: i.version_timestamp,
    added: i.initial_date ?? undefined,
    stars: i.stars,
    arm64: i.arm64,
    deprecated: i.deprecated,
    base: i.base ?? undefined,
    channels: i.releases.length,
    url: i.url,
    logo,
  };
}
