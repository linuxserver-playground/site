# Writing for the LinuxServer.io site

The blog and the documentation are Markdown files in this repository. The first half of this guide is about
blog posts, the second about [docs pages](#writing-docs). Posts are Markdown files. You don't need to run anything locally: you can write a post entirely in the
GitHub web editor, and every pull request gets a preview link.

## On the site (team members)

Sign in on the site, then use **New post** on the blog page, or **Edit on the site** at the bottom of any post.
The editor at `/edit/` shows the Markdown on the left and the post on the right. Paste or drop images
into the text and they're saved beside the post.

- **Save** commits to your own branch, `edit/<you>/posts/<slug>`, as you. Nothing is live yet.
- **Open pull request** proposes the post. The site's checks build it, and merging it publishes it. That
  makes the pull request the draft, so there's no `draft: true` to remember.
- **Discard** closes the pull request and deletes the branch.

The first time you use the editor, GitHub asks you to authorise the LinuxServer CI app, so that commits
are yours. Leave `date` out and the post is dated when its pull request merges.

## The quick way

```bash
npm install
npm run new-post        # asks for a title, your GitHub handle and tags
npm run dev             # http://localhost:4321/blog/<your-post>/ (drafts are visible locally)
```

`new-post` creates `src/content/posts/<slug>/index.md` as a draft, adds you to the authors list if
you're new, and prints the URL. When it's ready, remove `draft: true` and open a pull request.

## The no-install way (GitHub web editor)

1. On GitHub, open `src/content/posts/`, choose **Add file → Create new file**.
2. Name it `your-post-title/index.md`. The folder name is the URL: `/blog/your-post-title/`.
   Lower-case, hyphens, no dates.
3. Paste the template below, write, then **Commit changes → Create a new branch → Propose changes**.
4. Drag images into the same folder (**Add file → Upload files**).
5. The pull request builds a preview. A reviewer merges it, and it's live a couple of minutes later.

## Front matter

```markdown
---
title: "Webtop 6.0: now with more otters"
date: 2026-10-22T09:00:00Z
author: thelamer
tags:
  - Webtop
  - announcement
description: One or two sentences for the blog card, search engines and social previews.
hero: ./banner.jpg
heroAlt: An otter sitting at a Linux desktop
images: [webtop]
draft: true
---
```

| Field | | What it does |
| --- | --- | --- |
| `title` | required | Quote it if it contains a colon. |
| `date` | optional | Publish date. Leave it out and the post is dated when its pull request merges (from git). A future date keeps the post hidden until then. |
| `author` | recommended | Your GitHub handle. Links to your author page if you're in `src/content/authors/`. |
| `tags` | recommended | 3–8 tags. Reuse existing ones (see `/blog/tags/`). Product names keep their casing. |
| `description` | recommended | Shown on cards and in search results. Without it the first paragraph is used. |
| `hero` | optional | A landscape image in your folder (about 1600×900), always `./file.jpg`. |
| `heroAlt` | optional | One sentence describing the hero for screen readers. |
| `images` | optional | Image names the post is about. The post then appears on those image pages, and they appear under the post. |
| `featured` | optional | `true` pins the post to the top of the blog and the home page. |
| `draft` | optional | `true` while you work on it. Remove it to publish. |
| `updated` | optional | When you last revised the post. Leave it out and git supplies it from the last merged change. |

The build checks all of this, so a typo in the front matter fails the pull request with a message
that names the file and field. You'll know before anything goes live.

## Writing

- Don't repeat the title as a `# Heading`; the page already shows it. Start with a paragraph or an `## H2`.
- Images: `![What the image shows](./screenshot.png)`. Always write alt text. Add `?link` to make a
  screenshot open full size on click: `![Settings](./settings.png?link)`. Images are resized and converted
  to WebP automatically, so upload originals.
- Code: fenced blocks with a language, e.g. ` ```yaml `. Use `bash`, `yaml`, `nginx`, `json`, `dockerfile`, `ini`, `text`.
- Callouts:

  ```markdown
  > [!WARNING]
  > This deletes your config folder. Back it up first.
  ```

  Also `NOTE`, `TIP`, `IMPORTANT` and `CAUTION`.
- Videos go in `public/media/<your-slug>/` and are embedded with
  `<video controls playsinline preload="metadata" src="/media/<your-slug>/clip.mp4"></video>`.
- Link to other posts as `/blog/<slug>/` and to images as `/images/<name>/`.
- Refer to images as `ghcr.io/linuxserver-playground/<name>:latest`.

## Writing docs

The documentation lives next to the blog, at `src/content/docs/<section>/<slug>.md`, and is published at
`/docs/<section>/<slug>/`. The image pages are **not** here: they are generated from each image's `image.yml`
by the hub, so to fix one, change the manifest. The docs are the hand-written pages around them: how to run
our containers, the Selkies platform, policies and the FAQ.

### On the site (team members)

Sign in on the site, then use **New docs page** on the docs page, or **Edit on the site** at the bottom of
any page. It works the same way as posts (see [On the site](#on-the-site-team-members)): Save commits to
your branch, a pull request publishes it, and merging it makes it live.

### The quick way

```bash
npm run new-doc         # asks for the section and a title
npm run dev             # http://localhost:4321/site/docs/<section>/<slug>/ (drafts are visible locally)
```

`new-doc` creates `src/content/docs/<section>/<slug>.md` as a draft with the front matter filled in and
`order` set after the section's last page. When it's ready, remove `draft: true` and open a pull request.

### The no-install way (GitHub web editor)

1. On GitHub, open `src/content/docs/` and the section folder (`general`, `selkies`, `misc` or `faq`), then
   **Add file → Create new file**.
2. Name it `your-page-title.md`. The file name is the URL: `/docs/general/your-page-title/`. Lower-case,
   hyphens. To edit an existing page, open it on the site and use **Edit this page on GitHub** at the bottom.
3. Paste the template below, write, then **Commit changes → Create a new branch → Propose changes**.
4. Images go in the same folder (**Add file → Upload files**).
5. The pull request builds a preview. A reviewer merges it, and it's live a couple of minutes later.

### Front matter

```markdown
---
title: Running behind Tailscale
description: One or two sentences for the section index, search results and the meta description.
section: general
order: 20
group: Other platforms
updated: 2026-10-24
tags: [networking, vpn]
draft: true
---
```

| Field | | What it does |
| --- | --- | --- |
| `title` | required | Shown as the page heading and in the sidebar. Quote it if it contains a colon. Don't repeat it as a `# Heading`. |
| `description` | required | Shown under the title, on the section index, in the ⌘K palette and in search results. |
| `section` | required | Must be the folder the file is in. The sections are declared in `src/lib/docs-sections.ts`; a new one needs an entry there and a folder. |
| `order` | recommended | Position in the sidebar, lowest first. Pages without one go last. |
| `group` | optional | A sub-heading in the sidebar (e.g. `Other platforms`, `User guide`). Pages with the same group sit together; give them consecutive `order`s. |
| `updated` | optional | When the page last changed. Shown at the bottom and sent to search engines. Leave it out and git supplies it from the last merged change. |
| `tags` | optional | Extra words the ⌘K palette matches. |
| `draft` | optional | `true` while you work on it. Remove it to publish. |
| `aliases` | optional | Old URLs of this page (`/general/old-name/`), for redirects when a page moves. |

A section's own page is its `index.md` (`/docs/<section>/`); it is the "Overview" in the sidebar and the
pages are listed under it. A section without one gets a plain list of its pages.

The build checks all of this, so a typo in the front matter (or a `section` that doesn't match the folder)
fails the pull request with a message that names the file and field.

### Writing

Everything in the blog's [Writing](#writing) section applies: Markdown, fenced code with a language,
images with alt text, `/images/<name>/` and `/docs/<section>/<slug>/` links. In addition:

- **Callouts** take a title after the type, and `-` or `+` to make them collapsible (closed or open):

  ```markdown
  > [!WARNING] Reasonable endeavours
  > We build and test on Docker; Kubernetes is supported on a reasonable endeavours basis.

  > [!TIP]- Bonus: Caddy snippets
  > Hidden until opened.
  ```

- **Tabs** (the old docs' `=== "Docker"` / `=== "Podman"` blocks) are plain headings here, one per variant,
  so every variant is visible, searchable and linkable:

  ```markdown
  ### Docker
  …
  ### Podman
  …
  ```

- **Headings** start at `##`; the title is the `h1`. `##` and `###` build the table of contents on the right.
- **Diagrams**: there is no Mermaid renderer. Describe the flow as a numbered list, or add an SVG with alt text.
- **Images** live next to the page and are written `![What it shows](./diagram.png)`; they are optimised at
  build time. `?link` makes them open full size, as in posts.
- Anchors are generated from the heading text (`## PUID and PGID` → `#puid-and-pgid`), so link to sections
  as `/docs/general/understanding-puid-and-pgid/#puid-and-pgid`.

### Moving or renaming a page

Rename the file, keep the old path in `aliases`, and add a line to `public/_redirects`. The 404 page reads
the aliases and sends visitors from the old address to the new one on hosts without redirect support.

## The weekly spotlight

The home page features one image each week. The images listed in `src/content/spotlight.yaml` take
turns in file order, changing every Monday. Add, remove or reorder entries to change the rotation, and
give an entry a `note` to say why it's worth a look:

```yaml
- id: swag
  note: A sentence or two on why it's worth a look.
  by: thespad
```

Newly added images aren't part of the rotation; they have their own section on the home page.
