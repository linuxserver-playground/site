/** Fleet-wide snapshots: mods, stores, base images and staleness, the package index. */
import fleet from '@/data/fleet.json';
import mods from '@/data/mods.json';
import packages from '@/data/packages.json';
import stores from '@/data/stores.json';
import type { BaseUsage, Mod, PackageIndexEntry, StaleImage, StoreEntry } from './hub';
import { HUB_URL, hubApi } from './hub';

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
  /** One line on how to use it. */
  howTo: string;
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

/** Per-image deployment files the hub publishes under /stores/<platform>/ (not stores: no import URL). */
const DEPLOY_FILES: Partial<Record<InstallPlatform, { name: string; file: (image: string) => string; howTo: string }>> = {
  kubernetes: {
    name: 'Kubernetes manifest',
    file: (image) => `kubernetes/${image}.yaml`,
    howTo: 'Review the storage sizes and secrets, then kubectl apply -f this file.',
  },
  quadlet: {
    name: 'Podman quadlet',
    file: (image) => `quadlet/${image}.container`,
    howTo: 'Copy to ~/.config/containers/systemd/, then systemctl --user daemon-reload and start the unit.',
  },
  proxy: {
    name: 'SWAG proxy conf',
    file: (image) => `proxy/${image}.subdomain.conf.sample`,
    howTo: "Copy to SWAG's /config/nginx/proxy-confs/ without .sample and restart SWAG.",
  },
};

/**
 * "Install on …" options for one image: Docker Compose, the six stores from the hub's index
 * (`/api/v1/stores/index.json`), and the per-image deployment files. Unraid gets the image's own template; the
 * other stores take the store URL, since they import every image at once.
 */
export function installOptions(image: string, opts: { kubernetes: boolean; quadlet: boolean; proxy: boolean }): InstallOption[] {
  const list: InstallOption[] = [];
  const files = `${HUB_URL}/stores`;
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
    const deploy = DEPLOY_FILES[platform];
    if (deploy) {
      if (!opts[platform as 'kubernetes' | 'quadlet' | 'proxy']) continue;
      list.push({ platform, name: deploy.name, label: PLATFORM_LABELS[platform], url: `${files}/${deploy.file(image)}`, howTo: deploy.howTo });
      continue;
    }
    const store = getStore(platform);
    if (!store) continue;
    const url = platform === 'unraid' ? `${files}/unraid/${image}.xml` : store.url;
    const howTo = platform === 'unraid' ? `Copy to /boot/config/plugins/dockerMan/templates-user/ and pick it under Docker → Add Container → Template.` : store.how_to;
    list.push({ platform, name: store.name, label: PLATFORM_LABELS[platform], url, howTo });
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
