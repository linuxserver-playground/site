/**
 * The documentation: src/content/docs/<section>/<slug>.md, rendered at /docs/<section>/<slug>/. Sections
 * are declared in docs-sections.ts (shared with the content schema); a section's optional index.md is its
 * own page at /docs/<section>/. See CONTRIBUTING.md, "Writing docs".
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { withBase } from './base';
import { DOC_SECTIONS, type DocSectionId } from './docs-sections';
import { gitDates } from './git-dates';
import { LINKS } from './site';

export type Doc = CollectionEntry<'docs'>;

export const isSectionIndex = (doc: Doc) => doc.id.split('/')[1] === 'index';
/** "swag" for general/swag.md; "index" for a section's index.md. */
export const docSlug = (doc: Doc) => doc.id.split('/').slice(1).join('/');

export const sectionPath = (id: DocSectionId | string) => `/docs/${id}/`;
/** Root-relative path, without the base. */
export const docPath = (doc: Doc) => (isSectionIndex(doc) ? sectionPath(doc.data.section) : `/docs/${doc.data.section}/${docSlug(doc)}/`);
export const docUrl = (doc: Doc) => withBase(docPath(doc));
export const sectionUrl = (id: DocSectionId | string) => withBase(sectionPath(id));
/** The file on GitHub, for "Edit this page". */
export const docEditUrl = (doc: Doc) => `${LINKS.repo}/edit/main/src/content/docs/${doc.id}.md`;

const byOrder = (a: Doc, b: Doc) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title);

let cache: Promise<Doc[]> | undefined;
/**
 * Every published page, sorted by section, then order, then title. Drafts show in `astro dev` only. A page
 * without `updated` takes it from git (git-dates.ts).
 * A page whose `section` does not match its folder fails the build, with the file named.
 */
export function getDocs(): Promise<Doc[]> {
  return (cache ??= getCollection('docs').then((all) => {
    for (const doc of all) {
      const folder = doc.id.split('/')[0];
      if (doc.id.split('/').length !== 2) {
        throw new Error(`src/content/docs/${doc.id}.md: docs live exactly one folder deep, src/content/docs/<section>/<slug>.md`);
      }
      if (folder !== doc.data.section) {
        throw new Error(`src/content/docs/${doc.id}.md: front matter says "section: ${doc.data.section}" but the file is in "${folder}/"`);
      }
    }
    const order = new Map(DOC_SECTIONS.map((s, i) => [s.id, i]));
    return all
      .filter((d) => !d.data.draft || import.meta.env.DEV)
      .map((d) => (d.data.updated ? d : { ...d, data: { ...d.data, updated: gitDates(d.filePath).updated ?? gitDates(d.filePath).created } }))
      .sort((a, b) => order.get(a.data.section)! - order.get(b.data.section)! || byOrder(a, b));
  }));
}

export interface DocGroup {
  /** Sub-heading in the sidebar; pages without a `group` come first, unnamed. */
  name?: string;
  pages: Doc[];
}

export interface SectionView {
  id: DocSectionId;
  title: string;
  description: string;
  path: string;
  url: string;
  /** The section's index.md, when it has one. */
  intro?: Doc;
  /** Every page but the intro, in sidebar order. */
  pages: Doc[];
  groups: DocGroup[];
  /** Intro (or the section itself) first, then the pages: the reading order for prev/next. */
  sequence: Doc[];
}

function groupPages(pages: Doc[]): DocGroup[] {
  const groups: DocGroup[] = [];
  for (const page of pages) {
    const name = page.data.group;
    const last = groups[groups.length - 1];
    if (last && last.name === name) last.pages.push(page);
    else groups.push({ name, pages: [page] });
  }
  // Pages without a group always lead, however they are ordered.
  return [...groups.filter((g) => !g.name), ...groups.filter((g) => g.name)];
}

/** Sections that have at least one page, in the order of DOC_SECTIONS. */
export async function getSections(): Promise<SectionView[]> {
  const docs = await getDocs();
  return DOC_SECTIONS.flatMap((s) => {
    const mine = docs.filter((d) => d.data.section === s.id);
    if (!mine.length) return [];
    const intro = mine.find(isSectionIndex);
    const pages = mine.filter((d) => !isSectionIndex(d)).sort(byOrder);
    return [{ ...s, path: sectionPath(s.id), url: sectionUrl(s.id), intro, pages, groups: groupPages(pages), sequence: intro ? [intro, ...pages] : pages }];
  });
}

export async function getSection(id: string): Promise<SectionView | undefined> {
  return (await getSections()).find((s) => s.id === id);
}

export function prevNext(doc: Doc, section: SectionView): { prev?: Doc; next?: Doc } {
  const i = section.sequence.findIndex((d) => d.id === doc.id);
  return { prev: section.sequence[i - 1], next: section.sequence[i + 1] };
}

/**
 * Old URL (lower-cased path, trailing slash) -> new root-relative path, from every page's `aliases`.
 * The 404 page uses it to send visitors from the retired docs site to the right page.
 */
export function docRedirects(docs: Doc[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const doc of docs) {
    for (const alias of doc.data.aliases) {
      const key = alias.toLowerCase();
      if (map[key] && map[key] !== docPath(doc)) {
        throw new Error(`src/content/docs/${doc.id}.md: alias ${alias} is already used by ${map[key]}`);
      }
      map[key] = docPath(doc);
    }
  }
  return map;
}
