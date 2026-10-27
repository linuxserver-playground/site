/**
 * The PRoot Apps index (`src/data/proot-apps.json`, from the hub's `/api/v1/proot-apps.json`) and each app's icon
 * (`src/assets/proot-apps/`). Both are globbed rather than imported, so a snapshot made before the hub served the index
 * still builds: the PRoot Apps page then says the catalogue is on its way.
 */
import type { ImageMetadata } from 'astro';
import type { ProotApp, ProotAppsData } from './hub';

const data = Object.values(import.meta.glob<{ default: ProotAppsData }>('/src/data/proot-apps.json', { eager: true }))[0]?.default;
const icons = import.meta.glob<{ default: ImageMetadata }>('/src/assets/proot-apps/*.png', { eager: true });

export const PROOT_APPS_REPO = 'https://github.com/linuxserver-playground/proot-apps';
export const PROOT_DOCS = 'https://proot.selkies.io/docs/how-it-works/';
/** proot-next, the Rust PRoot every app runs under: a Selkies project, part of LinuxServer.io. */
export const PROOT_NEXT = {
  repo: 'https://github.com/selkies-project/proot-next',
  site: 'https://proot.selkies.io/',
  issues: 'https://github.com/selkies-project/proot-next/issues',
  discord: 'https://discord.gg/wDNGDeSW5F',
  /** A copy of the project's assets/logo.svg. */
  logo: '/brands/proot-next.svg',
};

/** The enabled apps, by title; empty when the snapshot has no index yet. */
export const getProotApps = (): ProotApp[] => data?.apps ?? [];

/** Images that ship the proot-apps CLI: the Selkies base image and every image built on it. */
export const supportsProotApps = (image: { name: string; base?: string | null }) => image.base === 'selkies' || image.name === 'baseimage-selkies';

/** The CLI release the install command downloads, when the repository has one. */
export const prootCli = () => data?.cli ?? null;

/** The app's icon, a 128px PNG made by the data refresh. */
export const prootIcon = (name: string): ImageMetadata | null => icons[`/src/assets/proot-apps/${name}.png`]?.default ?? null;

/** Categories with their app counts, largest first. */
export function prootCategories(apps: ProotApp[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const a of apps) counts.set(a.category, (counts.get(a.category) ?? 0) + 1);
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** The install commands from the proot-apps README, against this organisation's releases. */
export const PROOT_INSTALL = `rm -f $HOME/.local/bin/{ncat,proot-apps,proot,jq}
mkdir -p $HOME/.local/bin
curl -L https://github.com/linuxserver-playground/proot-apps/releases/download/$(curl -sX GET "https://api.github.com/repos/linuxserver-playground/proot-apps/releases/latest" | awk '/tag_name/{print $4;exit}' FS='[""]')/proot-apps-$(uname -m).tar.gz | tar -xzf - -C $HOME/.local/bin/
export PATH="$HOME/.local/bin:$PATH"`;

export const PROOT_SHELL = `echo 'export PATH="$HOME/.local/bin:$PATH"' >> $HOME/.bashrc
echo 'command -v proot-apps >/dev/null && source <(proot-apps completion bash)' >> $HOME/.bashrc`;

export const PROOT_UNINSTALL = `proot-apps remove all
rm -f $HOME/.local/bin/{ncat,proot-apps,proot,jq}
[ "$(readlink $HOME/.local/bin/bwrap)" == "proot" ] && rm -f $HOME/.local/bin/bwrap
rm -Rf $HOME/proot-apps/`;
