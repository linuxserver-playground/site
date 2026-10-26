/**
 * The website editor's side of the control plane ("The website editor" in control's README, control/editor.py):
 * shapes, the credentialed calls, and what the editor knows about the two content trees (paths, URLs, the
 * templates for a new page or post, and the light front matter checks it can make before the site's own
 * build validates the change in its pull request). Browser-safe: no astro:* imports.
 */
import { isMap, parse as parseYaml, parseDocument, YAMLParseError } from 'yaml';
import { withBase } from './base';
import { CONTROL_URL, ControlError, controlApi, fetchControl } from './control';
import { DOC_SECTIONS } from './docs-sections';

export interface EditPull {
  number: number;
  title: string;
  url: string;
  branch: string;
  draft: boolean;
  checks: 'pending' | 'success' | 'failure' | null;
  updated_at: string | null;
}

export interface EditorStatus {
  authenticated: boolean;
  member: boolean;
  login: string | null;
  /** Push access to the site repo: whether the pages show the editing buttons. */
  can_edit: boolean;
  /** Whether the member has given the editor its own GitHub authorisation (needed to save or delete). */
  authorized: boolean;
  repo: string;
  base: string;
}

/** An open edit of an entry, by anyone: its branch, and its pull request once there is one. */
export interface Pending {
  path: string;
  kind: 'doc' | 'post';
  key: string;
  branch: string;
  /** Who started it. */
  owner: string;
  change: 'new' | 'edit' | 'delete';
  title: string | null;
  head: string;
  updated_at: string | null;
  pull: EditPull | null;
}

export interface EditorEntry {
  path: string;
  kind: 'doc' | 'post';
  key: string;
  /** False for a new entry (or one this edit deletes). */
  exists: boolean;
  /** Whether it is on the default branch, i.e. live. */
  published: boolean;
  content: string;
  /** The edit branch saves go to: the one opened, or the member's own. */
  branch: string;
  owner: string;
  /** Whether `content` came from that branch. */
  on_branch: boolean;
  base: string;
  /** The commit the content was read at; the next save must name it. */
  head: string;
  images: string[];
  /** Videos in the entry's media folder. */
  media: string[];
  /** Site path the entry's videos are served at. */
  media_url: string;
  raw_base: string;
  /** The repo at `head`, for root-relative files: `/media/x` is `<raw_root>public/media/x`. */
  raw_root: string;
  /** Other open edits of this entry, which could be joined instead. */
  others: string[];
  pull: EditPull | null;
}

export interface SaveResult { ok: boolean; action_id: number; detail: string; branch: string | null; head: string | null; commit_url: string | null }
export interface PublishResult { ok: boolean; action_id: number; detail: string; pull: EditPull | null }
export interface Uploaded { name: string; kind: 'image' | 'video'; sha: string; target: string; url: string }
export interface Removal { path: string; branch: string; title: string | null; files: string[] }

/** The editor's own GitHub authorisation, on the control plane, then back to `next`. */
export const authorizeUrl = (next: string) => `${CONTROL_URL}/edit/authorize?next=${encodeURIComponent(next)}`;

const q = (params: Record<string, string | null | undefined>) =>
  Object.entries(params)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join('&');

export const getStatus = () => fetchControl<EditorStatus>('editor/status');
export const getPending = () => fetchControl<{ edits: Pending[] }>('editor/pending').then((r) => r.edits);
export const getEntry = (path: string, branch?: string | null) => fetchControl<EditorEntry>(`editor/entry?${q({ path, branch })}`);
export const getRemoval = (path: string, branch?: string | null) => fetchControl<Removal>(`editor/removal?${q({ path, branch })}`);

/** A POST to the editor: rejects with the control plane's reason (409 conflict, 413 too large, …). */
async function post<T>(action: 'upload' | 'save' | 'publish' | 'delete' | 'discard' | 'revoke', body: object, csrf: string): Promise<T> {
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

export const uploadFile = (path: string, name: string, data: string, csrf: string) => post<Uploaded>('upload', { path, name, data }, csrf);
export const saveEntry = (body: { path: string; content: string; head: string; branch?: string; message?: string; files?: { name: string; sha: string }[] }, csrf: string) =>
  post<SaveResult>('save', body, csrf);
export const publishEntry = (path: string, branch: string, title: string | undefined, csrf: string) => post<PublishResult>('publish', { path, branch, title }, csrf);
export const deleteEntry = (path: string, branch: string | null, title: string | undefined, message: string | undefined, csrf: string) =>
  post<PublishResult>('delete', { path, branch, title, message }, csrf);
export const discardEntry = (path: string, branch: string, csrf: string) => post<PublishResult>('discard', { path, branch }, csrf);
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
export const VIDEO_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}\.(mp4|webm)$/i;
export const VIDEO_MAX = 50 * 1024 * 1024;

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

/** The editor's query for an entry, on an open edit's branch when given. */
export function editorQuery(path: string, branch?: string | null): string {
  const doc = path.match(/^src\/content\/docs\/([^/]+)\/([^/]+)\.md$/);
  const post = path.match(/^src\/content\/posts\/([^/]+)\/index\.md$/);
  const base = doc ? `?doc=${doc[1]}/${doc[2]}` : post ? `?post=${post[1]}` : '';
  return base && branch ? `${base}&branch=${encodeURIComponent(branch)}` : base;
}

/** The editor's URL (with the base) for an entry. */
export const editorUrl = (path: string, branch?: string | null) => withBase(`/edit/${editorQuery(path, branch)}`);

/** Where the entry lives on the site once published (root-relative, without the base). */
export function livePath(path: string): string | null {
  const doc = path.match(/^src\/content\/docs\/([^/]+)\/([^/]+)\.md$/);
  if (doc) return doc[2] === 'index' ? `/docs/${doc[1]}/` : `/docs/${doc[1]}/${doc[2]}/`;
  const post = path.match(/^src\/content\/posts\/([^/]+)\/index\.md$/);
  return post ? `/blog/${post[1]}/` : null;
}

const yamlString = (s: string) => JSON.stringify(s);

export function docTemplate(title: string, section: string, group?: string | null): string {
  return `---
title: ${yamlString(title)}
description: ${yamlString('One or two sentences: what this page covers and who it is for.')}
section: ${section}
${group ? `group: ${yamlString(group)}\n` : ''}order: 100
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

/** The front matter block and the body of a file; `fm` is null when there is none. */
export function splitFile(text: string): { fm: string | null; body: string } {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  return m ? { fm: m[1], body: text.slice(m[0].length) } : { fm: null, body: text };
}

export const joinFile = (fm: string, body: string) => `---\n${fm.replace(/\n+$/, '')}\n---\n${body.startsWith('\n') ? '' : '\n'}${body}`;

/**
 * Set (or with `undefined`, empty string or empty list, remove) one front matter key, keeping every other key, its
 * order and its comments. Answers the whole file; the file is returned unchanged when its YAML does not parse.
 */
export function setFrontMatter(text: string, key: string, value: unknown): string {
  const { fm, body } = splitFile(text);
  const doc = parseDocument(fm ?? '');
  if (doc.errors.length) return text;
  if (!isMap(doc.contents)) doc.contents = doc.createNode({}) as unknown as typeof doc.contents;
  const empty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
  if (empty) doc.delete(key);
  else doc.set(key, value);
  return joinFile(String(doc), body);
}
