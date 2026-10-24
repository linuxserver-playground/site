/** Fleet-wide snapshots: mods, stores, base images and staleness, the package index. */
import fleet from '@/data/fleet.json';
import mods from '@/data/mods.json';
import packages from '@/data/packages.json';
import stores from '@/data/stores.json';
import type { BaseUsage, Mod, PackageIndexEntry, StaleImage, StoreEntry } from './hub';
import { hubApi } from './hub';

// ---------------------------------------------------------------- mods
const MODS = mods as { source: string; mods: Mod[] };

export const getMods = (): Mod[] => MODS.mods;
export const MODS_SOURCE = MODS.source;

/** Mods for one image: those targeting it (or listing it), then universal mods. */
export function modsForImage(name: string): { own: Mod[]; universal: Mod[] } {
  const own = MODS.mods.filter((m) => m.target === name || (m.target !== 'universal' && m.applies_to.includes(name)));
  const universal = MODS.mods.filter((m) => m.target === 'universal');
  return { own, universal };
}

/** Every image name a mod targets or is listed for, with counts. Universal mods are excluded. */
export function modTargets(): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const m of MODS.mods) {
    if (m.target === 'universal') continue;
    for (const t of new Set([m.target, ...m.applies_to])) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------- stores
export const getStores = (): StoreEntry[] => stores as StoreEntry[];
export const getStore = (platform: string) => getStores().find((s) => s.platform === platform);

/** Platforms a visitor can install an image from, in the order the buttons appear. */
export const INSTALL_PLATFORMS = ['compose', 'unraid', 'portainer', 'casaos', 'umbrel', 'runtipi', 'cosmos', 'kubernetes', 'quadlet', 'proxy'] as const;
export type InstallPlatform = (typeof INSTALL_PLATFORMS)[number];

export interface InstallOption {
  platform: InstallPlatform;
  name: string;
  /** Short label for the button. */
  label: string;
  /** The URL to paste or open for this image on this platform. */
  url: string;
  /** One-line how-to from the hub's stores index, completed for this image. */
  howTo: string;
  /** Where to read more. */
  more?: string;
}

const PLATFORM_LABELS: Record<InstallPlatform, string> = {
  compose: 'Docker Compose',
  unraid: 'Unraid',
  portainer: 'Portainer',
  casaos: 'CasaOS',
  umbrel: 'Umbrel',
  runtipi: 'Runtipi',
  cosmos: 'Cosmos',
  kubernetes: 'Kubernetes',
  quadlet: 'Podman quadlet',
  proxy: 'SWAG proxy conf',
};

/**
 * "Install on …" options for one image, from the hub's stores index (`/api/v1/stores/index.json`). A
 * platform the hub doesn't list is left out; a platform whose output is per image gets the image's file.
 */
export function installOptions(image: string, opts: { kubernetes: boolean; quadlet: boolean; proxy: boolean }): InstallOption[] {
  const list: InstallOption[] = [];
  for (const platform of INSTALL_PLATFORMS) {
    if (platform === 'compose') {
      list.push({
        platform,
        name: 'Docker Compose',
        label: PLATFORM_LABELS[platform],
        url: hubApi(`catalog/${image}/docker-compose.yml`),
        howTo: `Save as docker-compose.yml, edit the /path/to folders, then run docker compose up -d.`,
      });
      continue;
    }
    const store = getStore(platform);
    if (!store) continue;
    if (platform === 'kubernetes' && !opts.kubernetes) continue;
    if (platform === 'quadlet' && !opts.quadlet) continue;
    if (platform === 'proxy' && !opts.proxy) continue;
    let url = store.url;
    let howTo = store.how_to;
    if (platform === 'unraid') url = `${store.url.replace(/\/$/, '')}/${image}.xml`;
    if (platform === 'kubernetes') url = `${store.url.replace(/\/$/, '')}/${image}.yaml`;
    if (platform === 'quadlet') url = `${store.url.replace(/\/$/, '')}/${image}.container`;
    if (platform === 'proxy') url = `${store.url.replace(/\/$/, '')}/${image}.subdomain.conf.sample`;
    howTo = howTo.replace(/<url>/g, store.url.replace(/\/$/, '')).replace(/<name>/g, image);
    list.push({ platform, name: store.name, label: PLATFORM_LABELS[platform], url, howTo, more: store.url });
  }
  return list;
}

// ---------------------------------------------------------------- fleet
const FLEET = fleet as { bases: BaseUsage[]; staleness: { stale: StaleImage[]; checked: number } };
export const getBases = (): BaseUsage[] => FLEET.bases;
export const getStaleness = () => FLEET.staleness;

// ---------------------------------------------------------------- packages
export const getPackageIndex = (): PackageIndexEntry[] => packages as PackageIndexEntry[];
export function packageEcosystems(): { type: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of getPackageIndex()) for (const t of p.types) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts].map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count || a.type.localeCompare(b.type));
}
