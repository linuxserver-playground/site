/**
 * Labs images pending approval (`src/data/pending.json`, written by scripts/refresh-data.mjs in Labs mode only): the
 * Labs repositories with the `labs-pending` topic, each with its first open pull request, where the team reviews the
 * image from its build's report (workspace docs/labs.md, "From proposal to live"). Globbed rather than imported, so the
 * main site, which never writes the file, and a Labs snapshot made before it existed both build.
 */

export interface PendingPull {
  number: number;
  title: string;
  url: string;
  author: string | null;
  created_at: string;
}

export interface PendingImage {
  /** `linuxserverlabs-playground/docker-<name>`. */
  repo: string;
  name: string;
  description: string | null;
  url: string;
  /** The repository's first open pull request, which holds the image; null until a member opens it. */
  pull: PendingPull | null;
}

const data = Object.values(import.meta.glob<{ default: PendingImage[] }>('/src/data/pending.json', { eager: true }))[0]?.default;

export const getPending = (): PendingImage[] => (Array.isArray(data) ? data : []);
