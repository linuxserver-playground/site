/**
 * Dates from git for the docs and the blog, so nobody has to type them: a post without `date` is dated by
 * the commit that brought it onto the default branch (the merge of its pull request, since the history is
 * read first-parent), and a page or post is `updated` by the last such commit that changed it. Front matter
 * still wins whenever it sets either.
 *
 * Only commits after GIT_DATES_SINCE count: everything before it is the port from the old sites, which would
 * otherwise date every post and page on the day it was copied. Build time only (node, a full clone): a shallow
 * clone has no history, so CI fails rather than dating everything at its one commit; locally it warns.
 */
import { execFileSync } from 'node:child_process';

export const GIT_DATES_SINCE = '2026-10-26T00:00:00Z';

export interface GitDates {
  /** When the file arrived on the default branch, if that happened after GIT_DATES_SINCE. */
  created?: Date;
  /** The newest change to it after GIT_DATES_SINCE; absent when that change is the one that created it. */
  updated?: Date;
}

let cache: Map<string, GitDates> | undefined;

function git(args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
}

function read(): Map<string, GitDates> {
  const dates = new Map<string, GitDates>();
  try {
    if (git(['rev-parse', '--is-shallow-repository']).trim() === 'true') {
      const message = 'git-dates: shallow clone, so posts and docs get no dates from git (check out with fetch-depth: 0)';
      if (process.env.CI) throw new Error(message);
      console.warn(message);
      return dates;
    }
    const log = git([
      'log',
      '--first-parent',
      '--diff-merges=first-parent',
      '--no-renames',
      `--since=${GIT_DATES_SINCE}`,
      '--format=@%cI',
      '--name-status',
      '--',
      'src/content/posts',
      'src/content/docs',
    ]);
    // Newest commit first: the first sighting of a file is its last change, an `A` line its arrival.
    let at: Date | undefined;
    const last = new Map<string, Date>();
    for (const line of log.split('\n')) {
      if (line.startsWith('@')) {
        at = new Date(line.slice(1));
        continue;
      }
      const [status, path] = line.split('\t');
      if (!at || !path) continue;
      if (!last.has(path)) last.set(path, at);
      if (status === 'A') dates.set(path, { created: at });
    }
    for (const [path, changed] of last) {
      const entry = dates.get(path) ?? {};
      if (!entry.created || changed.getTime() !== entry.created.getTime()) entry.updated = changed;
      dates.set(path, entry);
    }
  } catch (e) {
    if (process.env.CI) throw e;
    console.warn(`git-dates: ${(e as Error).message}`);
  }
  return dates;
}

/** Dates for a content file, by its repository path (an entry's `filePath`). */
export function gitDates(path: string | undefined): GitDates {
  if (!path) return {};
  cache ??= read();
  return cache.get(path.replace(/^\.\//, '')) ?? {};
}
