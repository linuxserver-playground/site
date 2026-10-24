/** Site-wide settings. Everything that used to live in the Grav theme YAML. */

export const SITE = {
  name: 'LinuxServer.io',
  url: 'https://linuxserver-playground.github.io/site/',
  title: 'LinuxServer.io v2 playground: transparent Docker images',
  description:
    'The LinuxServer.io v2 playground builds community Docker images from one manifest each, and shows what is inside every build: layers, files, packages, init graph and the diff to the previous build.',
  tagline: 'Building community images, transparently',
  locale: 'en_GB',
  lang: 'en-GB',
  postsPerPage: 12,
  feedItems: 20,
  fediverse: '@linuxserver@linuxserver.io',
  registry: 'ghcr.io/linuxserver-playground',
};

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  description?: string;
}

/** Primary navigation. The control plane is a separate site; the docs live here under /docs/. */
export const NAV: NavItem[] = [
  { label: 'Images', href: '/images/', description: 'Browse every container we maintain' },
  { label: 'Docs', href: '/docs/', description: 'How to run our containers, Selkies, policies and the FAQ' },
  { label: 'Fleet', href: '/fleet/', description: 'Base images, staleness and the latest builds' },
  { label: 'Mods', href: '/mods/', description: 'Docker mods for every image' },
  { label: 'Stores', href: '/stores/', description: 'Unraid, Portainer, CasaOS, Umbrel and more' },
  { label: 'Blog', href: '/blog/', description: 'News, guides and release notes' },
  { label: 'Support', href: '/support/', description: 'Discord, forum and GitHub' },
  { label: 'About', href: '/about/', description: 'Who we are and how we work' },
];

export const NAV_SECONDARY: NavItem[] = [
  { label: 'Packages', href: '/packages/', description: 'Which image ships which package' },
  { label: 'Live builds', href: 'https://ci.thelamer.duckdns.org:8443', external: true, description: 'The control plane: build queue and live status' },
];

export const DONATE_URL = 'https://opencollective.com/linuxserver/donate';

export const LINKS = {
  github: 'https://github.com/linuxserver-playground',
  discord: 'https://discord.gg/YWrKVTn',
  discussions: 'https://github.com/orgs/linuxserver/discussions',
  /** The control plane: live build status, queue and scheduler. Linked, never embedded. */
  control: 'https://ci.thelamer.duckdns.org:8443',
  /** The hub: the static API every number on this site comes from. */
  hub: 'https://linuxserver-playground.github.io/hub/',
  conventions: 'https://github.com/linuxserver-playground/builder/blob/main/CONVENTIONS.md',
  mastodon: 'https://mastodon.linuxserver.io/@linuxserver',
  bluesky: 'https://bsky.app/profile/linuxserver.io',
  opencollective: 'https://opencollective.com/linuxserver',
  team: 'https://github.com/orgs/linuxserver-playground/people',
  /** Where posts and docs are edited ("Edit on GitHub" links). */
  repo: 'https://github.com/linuxserver-playground/site',
};

export interface Social {
  name: string;
  href: string;
  icon: 'github' | 'discord' | 'mastodon' | 'bluesky' | 'rss' | 'docs';
}

export const SOCIAL: Social[] = [
  { name: 'GitHub', href: LINKS.github, icon: 'github' },
  { name: 'Discord', href: LINKS.discord, icon: 'discord' },
  { name: 'Mastodon', href: LINKS.mastodon, icon: 'mastodon' },
  { name: 'Bluesky', href: LINKS.bluesky, icon: 'bluesky' },
  { name: 'RSS feed', href: '/blog/rss.xml', icon: 'rss' },
];

export interface SupportChannel {
  name: string;
  href: string;
  icon: 'docs' | 'discord' | 'discussions' | 'github';
  summary: string;
  bestFor: string;
}

/** From the Support page on the Grav site, in the order we want people to try them. */
export const SUPPORT_CHANNELS: SupportChannel[] = [
  {
    name: 'Documentation',
    href: '/docs/',
    icon: 'docs',
    summary: 'How to run our containers, the FAQ, and a page for every image with its parameters and setup.',
    bestFor: 'Start here. Most questions are already answered.',
  },
  {
    name: 'Discord',
    href: LINKS.discord,
    icon: 'discord',
    summary: 'Real-time support and chat with the community and the team.',
    bestFor: 'Quick questions and troubleshooting together.',
  },
  {
    name: 'Discussions',
    href: LINKS.discussions,
    icon: 'discussions',
    summary: 'Our forum on GitHub. Searchable, threaded and asynchronous.',
    bestFor: 'Longer questions and ideas for new images.',
  },
  {
    name: 'GitHub',
    href: LINKS.github,
    icon: 'github',
    summary: 'The source for every image. Pull requests are welcome.',
    bestFor: 'Bugs that do not behave as documented.',
  },
];

export interface Supporter {
  name: string;
  href: string;
  contribution: string;
}

/** Organisations that have donated time, credit or hardware (Donate page on the Grav site). */
export const SUPPORTERS: Supporter[] = [
  { name: 'DigitalOcean', href: 'https://www.digitalocean.com/', contribution: 'Credit for their Droplet platform, and LSIO in their supporter programme.' },
  { name: 'Pine64', href: 'https://www.pine64.org/', contribution: 'Hardware that runs part of our aarch64 build system.' },
  { name: 'QNAP', href: 'https://www.qnap.com/', contribution: 'A test unit so we can support users on QNAP devices.' },
  { name: 'Synology', href: 'https://www.synology.com/', contribution: 'A test unit so we can support users on Synology devices.' },
  { name: 'Unraid', href: 'https://unraid.net/', contribution: 'Generous monetary donations and licence keys for their software.' },
];

/** The four principles from the Grav home page. */
export const PILLARS = [
  {
    id: 'standardised',
    title: 'Standardised images',
    body: 'Every image is built on the same curated base. With s6-overlay each one is highly extendable, and shared base layers save you bandwidth and storage.',
    link: { label: 'About s6-overlay', href: 'https://github.com/just-containers/s6-overlay' },
  },
  {
    id: 'updates',
    title: 'Regular updates',
    body: 'When an upstream application, a package or the base image changes, the shared workflow rebuilds automatically. Version tags tell you exactly what each build contains.',
    link: { label: 'See the fleet', href: '/fleet/' },
  },
  {
    id: 'docs',
    title: 'Transparent builds',
    body: 'Every release attaches its build record: layers, files, packages, init graph and test results. This site shows all of it, and the diff to the build before.',
    link: { label: 'Explore a build', href: '/fleet/#builds' },
  },
  {
    id: 'support',
    title: 'Real support',
    body: 'Whether you are new or a veteran, someone from the team or the community is around on Discord and our forum to help.',
    link: { label: 'Get support', href: '/support/' },
  },
] as const;

export const MISSION =
  'We are a group of like-minded enthusiasts from across the world who build and maintain the largest collection of Docker images on the web. At our core are the principles behind Free and Open Source Software. Our goal is easy-to-use, streamlined images with clear and concise documentation.';
