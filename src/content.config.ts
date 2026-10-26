import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse as parseYaml } from 'yaml';
import { DOC_SECTION_IDS } from './lib/docs-sections';

/**
 * Blog posts: one folder per post, src/content/posts/<slug>/index.md, images alongside.
 * The folder name is the URL: /blog/<slug>/. See CONTRIBUTING.md for the author guide.
 */
const posts = defineCollection({
  loader: glob({
    base: './src/content/posts',
    pattern: '**/index.md',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Leave it out and the post is dated when it lands on main (its pull request's merge; src/lib/git-dates.ts). */
      date: z.coerce.date().optional(),
      /** Leave it out and git says when the post last changed. */
      updated: z.coerce.date().optional(),
      /** Handle or name. Matched against src/content/authors/ (file name or aliases); unknown names still display. */
      author: z.string().optional(),
      /** One or two sentences for cards, search engines and feeds. Falls back to the first paragraph. */
      description: z.string().optional(),
      tags: z.array(z.string()).default([]),
      /** Relative path to the hero image, e.g. ./banner.png. Used for the hero, the card and og:image. */
      hero: image().optional(),
      heroAlt: z.string().optional(),
      /** Image names this post is about, e.g. [webtop, swag]. The post is listed on those image pages. */
      images: z.array(z.string()).default([]),
      /** Pin to the top of the blog and the home page. */
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      /** Hide the post after this date (Grav's unpublish_date). */
      expires: z.coerce.date().optional(),
    }),
});

/** One YAML file per author, src/content/authors/<id>.yaml. Author pages live at /blog/authors/<id>/. */
const authors = defineCollection({
  loader: glob({ base: './src/content/authors', pattern: '*.yaml' }),
  schema: z.object({
    name: z.string(),
    github: z.string().optional(),
    role: z.enum(['team', 'alumni', 'guest']).default('team'),
    bio: z.string().optional(),
    /** Other spellings used in post front matter, e.g. [Spad, spad]. */
    aliases: z.array(z.string()).default([]),
  }),
});

/**
 * The weekly spotlight: images that take turns, one per week, in file order (src/content/spotlight.yaml).
 * Each entry's id is an image name.
 */
const spotlight = defineCollection({
  // Collections don't keep file order, so each entry records its position for the rotation to sort by.
  loader: file('./src/content/spotlight.yaml', {
    parser: (text) => (parseYaml(text) as { id: string }[]).map((entry, position) => ({ ...entry, position })),
  }),
  schema: z.object({
    position: z.number(),
    /** A sentence or two from the team about why this image is worth a look. */
    note: z.string().optional(),
    by: z.string().optional(),
  }),
});

/**
 * Documentation: src/content/docs/<section>/<slug>.md, one file per page, images alongside. The URL is
 * /docs/<section>/<slug>/; a file called index.md is the section's own page at /docs/<section>/. Sections
 * are declared in src/lib/docs-sections.ts. See CONTRIBUTING.md, "Writing docs".
 */
const docs = defineCollection({
  loader: glob({
    base: './src/content/docs',
    pattern: '**/*.md',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string().min(1),
    /** One or two sentences: shown on the section index, in search results and in the meta description. */
    description: z.string().min(1),
    /** Must be the folder the file is in; a typo here fails the build. */
    section: z.enum(DOC_SECTION_IDS),
    /** Position in the section's sidebar, lowest first. */
    order: z.number().int().default(100),
    /** Optional sub-heading in the sidebar, e.g. "Other platforms". Pages with the same group sit together. */
    group: z.string().optional(),
    /** Leave it out and git says when the page last changed (src/lib/git-dates.ts). */
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    /** Old URLs of this page (path only, e.g. /general/swag/), for the 404 page's redirect map. */
    aliases: z.array(z.string().regex(/^\/.*\/$/, 'an alias is a path that starts and ends with "/"')).default([]),
  }),
});

/**
 * Image documentation: each image's README, one file per `##` section, written by scripts/refresh-data.mjs from
 * the hub's api/v1/catalog/<name>/docs.json into src/content/imagedocs/<image>/<order>-<section>.md. Generated;
 * never edit these files, change the image's image.yml or the builder templates instead.
 */
const imagedocs = defineCollection({
  loader: glob({
    base: './src/content/imagedocs',
    pattern: '*/*.md',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    image: z.string(),
    /** Slug of the heading, stable across images: application-setup, support-info, updating-info. */
    section: z.string(),
    title: z.string(),
    order: z.number().int(),
  }),
});

/**
 * Mod documentation: the `docs` of each mod's mod.yml, written by scripts/refresh-data.mjs from the hub's
 * api/v1/mods.json into src/content/moddocs/<branch>.md and rendered on /mods/<branch>/. Generated; change the
 * mod.yml on the docker-mods branch instead.
 */
const moddocs = defineCollection({
  loader: glob({ base: './src/content/moddocs', pattern: '*.md', generateId: ({ entry }) => entry.replace(/\.md$/, '') }),
  schema: z.object({ branch: z.string() }),
});

export const collections = { posts, authors, spotlight, docs, imagedocs, moddocs };
