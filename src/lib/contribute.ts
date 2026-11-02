/**
 * Contributing: the ways in, the harness that makes them approachable, and the prompts the site suggests on
 * the pages people are already reading. The /contribute/ page, the docs' Contribute section and every
 * ContributeCallout read from here, so a renamed command or a new path is one change.
 */

import { LABS_GUIDE_URL } from './site';

export const HARNESS_REPO = 'https://github.com/linuxserver-playground/harness';

/**
 * New applications start in LinuxServer Labs. The full guide to proposing one is on the Labs site: what qualifies,
 * building it locally, the harness, the proposal form (the structured issue form in the Labs proposals repository).
 */
export const PROPOSE_GUIDE_URL = LABS_GUIDE_URL;

/** The harness's three commands, as its README gives them. */
export const HARNESS_START = [
  'gh repo clone linuxserver-playground/harness && cd harness',
  './harness doctor',
  './harness core',
  'claude   # or any agent that reads AGENTS.md',
].join('\n');

export interface ContributePath {
  id: string;
  title: string;
  body: string;
  /** What to say to the agent. Angle brackets are the person's to fill in. */
  prompt: string;
  /** The docs page that explains it without an agent (an absolute URL when the guide is on the Labs site). */
  href: string;
}

/** The ways in, most approachable first. Each works with an agent or by hand. */
export const CONTRIBUTE_PATHS: ContributePath[] = [
  {
    id: 'fix',
    title: 'Fix an image you use',
    body: 'Something broken, missing or out of date in an image you run. The agent reproduces it in your Docker, makes the smallest fix and drafts the pull request.',
    prompt: 'My <image> container <what goes wrong>. Reproduce it, fix it and draft the PR.',
    href: '/docs/contribute/contributing-an-image/',
  },
  {
    id: 'mod',
    title: 'Make the mod you need',
    body: 'A package, a driver or a tool only some users want belongs in a mod, not the image. Mods are a Dockerfile and a few scripts, and the agent tests them for you.',
    prompt: 'Make a mod that installs yt-dlp into any image, and test it.',
    href: '/docs/contribute/making-a-mod/',
  },
  {
    id: 'propose',
    title: 'Bring an app you want',
    body: 'New applications start in LinuxServer Labs. Build and run your app\'s image locally from the Labs template, or let the agent check the bar and fill in the proposal form from real data, for you to read before it is filed.',
    prompt: "I'd like <app> in LinuxServer Labs. Check it meets the bar and draft the proposal.",
    href: LABS_GUIDE_URL,
  },
  {
    id: 'docs',
    title: 'Improve the docs',
    body: 'Every docs page is Markdown in the site repository. If a page confused you, you are the right person to fix it.',
    prompt: 'The <page> docs page <what confused you>. Fix it and draft the PR.',
    href: '/docs/contribute/',
  },
  {
    id: 'triage',
    title: 'Explain a red build or an issue',
    body: 'Half of maintenance is working out why something broke. Ask the agent, check what it found, and post the explanation where it helps.',
    prompt: 'Explain the newest red build on the fleet board. Is it us, upstream or a network flake?',
    href: '/docs/contribute/ai-agents/',
  },
  {
    id: 'review',
    title: 'Review a pull request',
    body: 'Build and run someone else\'s change locally and compare it with the released image. A second pair of eyes is what keeps a small team moving.',
    prompt: 'Review PR 6 on docker-heimdall. Build it, run it and compare it with the released image.',
    href: '/docs/contribute/ai-agents/',
  },
];

/** Prompts for an image's page. `app` is false for base images and tools, which take no mods. */
export function imagePrompts(name: string, app: boolean): string[] {
  return [
    `Something is wrong with the ${name} image: <what you saw>. Reproduce it, fix it and draft the PR.`,
    `Add <package> to the ${name} image, test it and draft the PR.`,
    ...(app ? [`Make a mod for ${name} that <what you need>, and test it.`] : []),
  ];
}

export const modPrompts = (branch: string): string[] => [
  `The ${branch} mod <what is wrong>. Fix it, test it and draft the PR.`,
  `Make a mod like ${branch} for <another image>, and test it.`,
];

export const docPrompt = (title: string): string => `The "${title}" docs page <what is wrong or missing>. Fix it and draft the PR.`;
