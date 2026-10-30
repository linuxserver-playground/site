/**
 * The documentation's sections: one folder each under src/content/docs/. Shared by the content schema
 * (which validates every page's `section` against this list) and the docs pages. Add a section here, then
 * create its folder.
 */
export interface DocSection {
  id: string;
  title: string;
  description: string;
}

export const DOC_SECTIONS = [
  { id: 'general', title: 'How to', description: 'Running, updating and customising our containers: compose, PUID and PGID, volumes, mods, SWAG and other platforms.' },
  { id: 'contribute', title: 'Contribute', description: 'Fix an image, make a mod, bring an app or improve these pages, with an AI agent or by hand: where to start and what happens to your pull request.' },
  { id: 'selkies', title: 'Selkies', description: 'The Selkies platform behind Webtop and the single-application images: user guide, developer guide and the components that make it up.' },
  { id: 'maintain', title: 'Maintainers', description: 'Reference for the team: image.yml field by field, the version sources and asset checks, and how the generated files, store templates and image pages are produced from the manifest, with the file to edit for each.' },
  { id: 'misc', title: 'Policies', description: 'The support policy, running as non-root or read-only, and how the project is funded.' },
  { id: 'faq', title: 'FAQ', description: 'The questions we get asked most often, with their answers.' },
] as const satisfies readonly DocSection[];

export type DocSectionId = (typeof DOC_SECTIONS)[number]['id'];
export const DOC_SECTION_IDS = DOC_SECTIONS.map((s) => s.id) as [DocSectionId, ...DocSectionId[]];
