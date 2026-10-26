/**
 * The website editor's side of the control plane ("The website editor" in control's README, control/editor.py):
 * shapes, the credentialed calls, and what the editor knows about the two content trees (paths, URLs, the
 * templates for a new page or post, and the light front matter checks it can make before the site's own
 * build validates the change in its pull request). Browser-safe: no astro:* imports.
 */
import { parse as parseYaml, YAMLParseError } from 'yaml';
import { CONTROL_URL, ControlError, controlApi, fetchControl } from './control';
import { DOC_SECTIONS } from './docs-sections';

export interface EditPull {
  number: number;
  title: string;
  url: string;
  branch: string;
  /** The entry's Markdown file, for branches the editor made. */
  path: string | null;
  draft: boolean;
  checks: 'pending' | 'success' | 'failure' | null;
  updated_at: string | null;
}

export interface EditorStatus {
  authenticated: boolean;
  member: boolean;
  login: string | null;
  /** Whether the member has given the editor its own GitHub authorisation. */
  authorized: boolean;
  /** Whether GitHub lets them push to the site repo; edits need it. */
  can_push: boolean;
  repo: string;
  base: string | null;
  edits: EditPull[];
}

export interface EditorEntry {
  path: string;
  kind: 'doc' | 'post';
  key: string;
  /** False for a new entry. */
  exists: boolean;
  /** Whether it is on the default branch, i.e. live. */
  published: boolean;
  content: string;
  branch: string;
  /** Whether `content` came from the member's edit branch. */
  on_branch: boolean;
  base: string;
  /** The commit the content was read at; the next save must name it. */
  head: string;
  images: string[];
  raw_base: string;
  pull: EditPull | null;
}

export interface SaveResult { ok: boolean; action_id: number; detail: string; branch: string | null; head: string | null; commit_url: string | null }
export interface PublishResult { ok: boolean; action_id: number; detail: string; pull: EditPull | null }
export interface Asset { name: string; data: string }

/** The editor's own GitHub authorisation, on the control plane, then back to `next`. */
export const authorizeUrl = (next: string) => `${CONTROL_URL}/edit/authorize?next=${encodeURIComponent(next)}`;

export const getStatus = () => fetchControl<EditorStatus>('editor/status');
export const getEntry = (path: string) => fetchControl<EditorEntry>(`editor/entry?path=${encodeURIComponent(path)}`);

/** A POST to the editor: rejects with the control plane's reason (409 conflict, 413 too large, …). */
async function post<T>(action: 'save' | 'publish' | 'discard' | 'revoke', body: object, csrf: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(controlApi(`editor/${action}`), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf, Accept: 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ControlError(0, 'The control plane could not be reached. Your text is still here; try again.');
  }
  if (res.status === 204) return undefined as T;
  const data = (await res.json().catch(() => ({}))) as T & { detail?: unknown };
  if (res.status === 401) throw new ControlError(401, 'Your session has expired. Sign in again; your text stays in this tab.');
  if (res.status === 429) throw new ControlError(429, 'Too many saves in the last hour. Try again later.');
  if (!res.ok) throw new ControlError(res.status, typeof data.detail === 'string' ? data.detail : `The control plane answered ${res.status}.`);
  return data;
}

export const saveEntry = (body: { path: string; content: string; head: string; message?: string; assets?: Asset[] }, csrf: string) => post<SaveResult>('save', body, csrf);
export const publishEntry = (path: string, title: string | undefined, csrf: string) => post<PublishResult>('publish', { path, title }, csrf);
export const discardEntry = (path: string, csrf: string) => post<PublishResult>('discard', { path }, csrf);
export const revokeEditor = (csrf: string) => post<void>('revoke', {}, csrf);

// ---------------------------------------------------------------------------------------------------
// The two content trees (src/content.config.ts)

export type Kind = 'doc' | 'post';
export const SECTIONS = DOC_SECTIONS;
export const docFile = (section: string, slug: string) => `src/content/docs/${section}/${slug}.md`;
export const postFile = (slug: string) => `src/content/posts/${slug}/index.md`;
export const DOC_SLUG = /^[a-z0-9][a-z0-9-]*$/;
export const POST_SLUG = /^[a-z0-9][a-z0-9_-]*$/;
export const IMAGE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}\.(png|jpe?g|gif|webp)$/i;
export const IMAGE_MAX = 5 * 1024 * 1024;

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
    .replace(/-$/, '');
}

/** `?doc=general/swag` or `?post=webtop-7` → the Markdown file; null for anything else. */
export function pathFromQuery(params: URLSearchParams): string | null {
  const doc = params.get('doc');
  if (doc) {
    const [section, slug, ...rest] = doc.split('/');
    return !rest.length && SECTIONS.some((s) => s.id === section) && DOC_SLUG.test(slug ?? '') ? docFile(section, slug) : null;
  }
  const slug = params.get('post');
  return slug && POST_SLUG.test(slug) ? postFile(slug) : null;
}

/** The editor's own URL for an entry (root-relative, without the base). */
export function editorQuery(path: string): string {
  const doc = path.match(/^src\/content\/docs\/([^/]+)\/([^/]+)\.md$/);
  if (doc) return `?doc=${doc[1]}/${doc[2]}`;
  const post = path.match(/^src\/content\/posts\/([^/]+)\/index\.md$/);
  return post ? `?post=${post[1]}` : '';
}

/** Where the entry lives on the site once published (root-relative, without the base). */
export function livePath(path: string): string | null {
  const doc = path.match(/^src\/content\/docs\/([^/]+)\/([^/]+)\.md$/);
  if (doc) return doc[2] === 'index' ? `/docs/${doc[1]}/` : `/docs/${doc[1]}/${doc[2]}/`;
  const post = path.match(/^src\/content\/posts\/([^/]+)\/index\.md$/);
  return post ? `/blog/${post[1]}/` : null;
}

const yamlString = (s: string) => JSON.stringify(s);

export function docTemplate(title: string, section: string): string {
  return `---
title: ${yamlString(title)}
description: ${yamlString('One or two sentences: what this page covers and who it is for.')}
section: ${section}
order: 100
---

Start with what the reader is trying to do, then show them how.

## First step

Write it here.
`;
}

export function postTemplate(title: string, author: string | null): string {
  return `---
title: ${yamlString(title)}
${author ? `author: ${author}\n` : ''}description: ${yamlString('One or two sentences for cards, search engines and feeds.')}
tags: []
---

The first paragraph is the excerpt when there is no description.

## A heading

Write here. Paste or drop images into the editor to add them beside the post.
`;
}

// ---------------------------------------------------------------------------------------------------
// Front matter: split, parse and checked lightly (the site's build is the real check)

export interface Parsed {
  data: Record<string, unknown>;
  body: string;
  /** A YAML error, or a missing front matter block. */
  error: string | null;
}

export function splitFrontMatter(text: string): Parsed {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!m) return { data: {}, body: text, error: 'The file must start with front matter between two --- lines.' };
  try {
    const data = parseYaml(m[1]) ?? {};
    if (typeof data !== 'object' || Array.isArray(data)) return { data: {}, body: text.slice(m[0].length), error: 'Front matter must be YAML keys and values.' };
    return { data: data as Record<string, unknown>, body: text.slice(m[0].length), error: null };
  } catch (e) {
    const where = e instanceof YAMLParseError && e.linePos ? ` (line ${e.linePos[0].line + 1})` : '';
    return { data: {}, body: text.slice(m[0].length), error: `Front matter is not valid YAML${where}: ${(e as Error).message.split('\n')[0]}` };
  }
}

const isDate = (v: unknown) => v instanceof Date || (typeof v === 'string' && !Number.isNaN(Date.parse(v)));

/** What the build would refuse, as far as the editor can tell; empty means it looks right. */
export function problems(kind: Kind, path: string, parsed: Parsed, images: Set<string>): string[] {
  if (parsed.error) return [parsed.error];
  const d = parsed.data;
  const out: string[] = [];
  if (typeof d.title !== 'string' || !d.title.trim()) out.push('`title` is required.');
  if (kind === 'doc') {
    if (typeof d.description !== 'string' || !d.description.trim()) out.push('`description` is required on a docs page.');
    const folder = path.split('/')[3];
    if (d.section !== folder) out.push(`\`section\` must be \`${folder}\`, the folder the page is in.`);
    if (d.order !== undefined && !Number.isInteger(d.order)) out.push('`order` must be a whole number.');
  } else {
    if (d.date !== undefined && !isDate(d.date)) out.push('`date` must be a date (or left out: the merge dates it).');
    if (d.tags !== undefined && !(Array.isArray(d.tags) && d.tags.every((t) => typeof t === 'string'))) out.push('`tags` must be a list of words.');
    if (typeof d.hero === 'string' && d.hero.startsWith('./') && !images.has(d.hero.slice(2))) out.push(`\`hero\` names ${d.hero}, which is not in the post's folder.`);
  }
  if (d.updated !== undefined && !isDate(d.updated)) out.push('`updated` must be a date (or left out: git knows).');
  for (const key of ['tags', 'aliases', 'images'] as const) {
    if (d[key] !== undefined && !Array.isArray(d[key])) out.push(`\`${key}\` must be a list.`);
  }
  return out;
}

/** A File as base64, for a save. */
export function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).replace(/^data:[^,]*,/, ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
