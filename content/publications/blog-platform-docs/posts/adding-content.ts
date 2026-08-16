export const addingContent = `
# Adding a publication or post

How to add a publication or post to the blog's internal content system. Markdown syntax and custom renderer behavior: [Markdown reference](/blog-platform-docs/markdown-reference). New to the platform: [Working with the platform](/blog-platform-docs/working-with-the-platform) maps all the documentation.

## Content architecture

Content lives in the repository-level content directory, outside the Next.js application:

~~~text
content/
├── authors.ts
├── drafts.ts
├── markdown.d.ts
├── registry.ts
├── routes.ts
├── types.ts
├── validation.ts
└── publications/
    └── publication-id/
        ├── assets/
        │   ├── publication-cover.png
        │   ├── first-post-cover.png
        │   └── SOURCES.md
        ├── index.ts
        └── posts/
            ├── legacy-post.ts
            └── modular-post/
                ├── assets/
                │   ├── image-thumb.webp
                │   ├── image.webp
                │   └── SOURCES.md
                ├── index.ts
                ├── modular-post.md
                └── modular-post.images.ts
~~~

The registry imports every publication; each publication imports its posts. The application imports the registry through the content boundary and generates the landing, browse, publication, author, and post pages from it.

Two post layouts: a single TypeScript file (existing posts) or a directory module (posts needing dedicated Markdown or related resources). Same extensionless import path for both:

~~~ts
import { firstPost } from "./posts/first-post"
~~~

TypeScript resolves posts/first-post.ts or posts/first-post/index.ts, whichever exists. Never keep both for the same slug: the single file wins during module resolution.

## Publication format

Create a publication module at content/publications/publication-id/index.ts. Directory name and pubId: lowercase kebab-case.

~~~ts
import type { Publication } from "../../types"
import { firstPost } from "./posts/first-post"

export const publicationName: Publication = {
  relId: 5,
  pubId: "publication-id",
  title: "Publication title",
  description: "A short description for browse cards and page metadata.",
  created: "2026-07-22",
  updated: "2026-07-22",
  isNSFW: false,
  isNew: true,
  isFeatured: false,
  isDraft: false,
  tags: ["Topic", "Practice"],
  synopsis: "A longer description shown on the publication page.",
  editorNotes: "Optional editorial context for this publication.",
  coverImage: "/static/path/to-cover.png",
  posts: [firstPost],
}
~~~

Required publication fields: relId, pubId, title, description, created, isNSFW, isNew, isFeatured, isDraft, tags, posts. Rules:

- relId: unique positive integer.
- pubId: unique, URL-safe.
- Dates: YYYY-MM-DD. updated cannot be earlier than created.
- isDraft: true while unfinished (see Drafts below).

Add the publication to the authoredPublications array in content/registry.ts, in editorial listing position:

~~~ts
import { publicationName } from "./publications/publication-id"

const authoredPublications: Publication[] = [
  blogPlatformDocs,
  // …the existing publications, in their editorial order…
  publicationName,
]
~~~

## Post format

### Modular post format

Recommended format for a resource-backed post: a directory at content/publications/publication-id/posts/post-slug. Directory, Markdown filename, and slug: lowercase kebab-case.

The directory's index.ts is the post entry point. It owns the metadata and explicitly imports every resource the post uses:

~~~ts
import type { Post } from "../../../../types"

import content from "./first-post.md"
import { firstPostImageLists, firstPostImages } from "./first-post.images"
import postCover from "./assets/first-post-og-cover.png"

export const firstPost = {
  postId: 501,
  slug: "first-post",
  title: "Post title",
  excerpt: "A short summary for browse cards and metadata.",
  created: "2026-07-22",
  updated: "2026-07-22",
  authorIds: ["rj11io"],
  isNSFW: false,
  isNew: true,
  isFeatured: false,
  isDraft: false,
  tags: ["Topic", "Practice"],
  coverImage: postCover.src,
  content,
  images: firstPostImages,
  imageLists: firstPostImageLists,
} satisfies Post
~~~

Both satisfies Post and a plain Post annotation type-check; the Markdown reference post uses the annotation. The .md file contains only the raw Markdown body, leading H1 included. Raw Markdown imports: typed by content/markdown.d.ts, converted to strings by the application's Markdown loader.

Optional first-post.images.ts holds the post's named single images and multi-image list configurations. Local files: statically imported from the sibling assets directory. The build assigns hashed URLs; the content contract stays independent of the rendering application.

~~~ts
import type { PostImageLists, PostImages } from "../../../../types"

import localThumbnail from "./assets/image-thumb.webp"
import localImage from "./assets/image.webp"

export const firstPostImages = {
  "local-example": {
    src: localImage.src,
    thumbnailSrc: localThumbnail.src,
    width: localImage.width,
    height: localImage.height,
    alt: "Descriptive alternative text",
    title: "Local image",
    subtitle: "Post-owned WebP",
  },
  "remote-example": {
    src: "https://images.example.com/photo-2000.webp",
    thumbnailSrc: "https://images.example.com/photo-960.webp",
    width: 2000,
    height: 1333,
    alt: "Descriptive alternative text",
    title: "Remote image",
    subtitle: "External HTTPS URL",
  },
} satisfies PostImages

export const firstPostImageLists = {
  highlights: {
    layout: "quilted",
    variant: "title-inside",
    images: [
      firstPostImages["local-example"],
      firstPostImages["remote-example"],
    ],
  },
} satisfies PostImageLists
~~~

Reference configured single images and lists from the post's Markdown by key:

~~~md
@[image](local-example)
@[image](remote-example)
@[image-list](highlights)
~~~

The renderer resolves each key against the current post only. PostImage fields:

- src: larger lightbox source.
- thumbnailSrc: inline or gallery preview.
- width, height: reserve the aspect ratio before the file loads.

Local and remote sources share the same native img rendering, fullscreen lightbox, zoom, and pan. Content images are plain img elements, not next/image, which would need every remote host allow-listed up front. Author photographs, always from the public directory, are the one place the site uses next/image. Record the photographer, original page, and licence for a downloaded image in the SOURCES.md beside it: that file is the attribution record.

Remote image sources: HTTPS required. Prefer explicit thumbnail and full-size CDN URLs over an original multi-megabyte file. Native img elements mean remote hosts need no Next.js image allowlist. Keep a SOURCES.md beside downloaded assets: photographer, original page, license, download date.

Standard Markdown can reference a remote image URL directly:

~~~md
![Remote image description](https://images.example.com/photo.webp "Optional title")
~~~

Direct Markdown URLs: fine for simple external images. Named image registry: preferred when dimensions, separate thumbnail and lightbox sources, or reuse in an image list matter.

The list configuration selects the quilted or masonry layout and one of the image-only, title-inside, or title-below variants. A list can mix local and remote entries; opening any image uses the shared carousel.

No configured images or multi-image lists: omit images, imageLists, and the .images.ts file.

### Legacy single-file format

Existing posts can keep their body at content/publications/publication-id/posts/post-slug.ts, exporting the Markdown body as a TypeScript template string, leading H1 included:

~~~ts
export const firstPost = \`
# Post title

The Markdown body.
\`
~~~

Add metadata and the imported content to the publication's posts array:

~~~ts
{
  postId: 501,
  slug: "post-slug",
  title: "Post title",
  excerpt: "A short summary for browse cards and metadata.",
  created: "2026-07-22",
  updated: "2026-07-22",
  authorIds: ["rj11io"],
  isNSFW: false,
  isNew: true,
  isFeatured: false,
  isDraft: false,
  tags: ["Topic", "Practice"],
  content: firstPost,
}
~~~

Legacy and modular posts coexist in one publication. Modular post: added directly to posts. Legacy Markdown export: assigned to the content field of its publication-owned post object.

Required post fields: postId, title, created, authorIds, isNSFW, isNew, isFeatured, isDraft, tags. The type marks content optional, but the validator rejects a post without a non-empty body: content is required in practice, caught by the build rather than the compiler. Rules:

- Use a slug whenever possible; it becomes the public URL.
- postId: unique positive integer within the publication.
- Every author ID must exist in content/authors.ts. Every post needs at least one author.

Two required flags are easy to set and forget:

- isNew: puts a New badge on cards and the post page. Nothing ages it out; clear it by hand when the post stops being new.
- isNSFW: puts an Adult badge on the same surfaces. Does nothing else, hides nothing.

## Drafts

Set isDraft to true on a post or publication not ready to be read. The live site leaves it out entirely: gone from the home page, browse indexes, every count, and previous and next links; its address returns 404, not an empty page.

The filter runs once, in content/registry.ts, immediately after validation. Both levels are filtered; a draft publication takes its posts with it regardless of their own flags. Nothing else in the site knows drafts exist, so nothing else changes to keep one hidden.

Validation runs before the filter: a draft is checked by the same rules as a published post. That is the point of the flag over the older habit of leaving a publication out of the registry: an unfinished post cannot quietly rot, and its postId and slug stay reserved against collision with something live.

### Reading a draft

Drafts are served on the dev server and left out of a production build: npm run dev shows the draft, npm run build never does. Anything rendered from a draft carries a Draft badge, on browse cards and on the publication and post pages, so a local draft cannot pass for a published post.

A post inside a draft publication carries the badge too, even with its own isDraft set to false: the registry marks it, since it is not published either. So leave a draft publication's posts alone; one edit on the publication reveals the whole thing when ready.

To share one: set SHOW_DRAFTS=1 on a Vercel preview environment. Drafts then publish at the preview address, enough for someone else to read the post without it appearing on the live site. Never set it on production. The flag lives in content/drafts.ts.

### Two rules the validator enforces

A draft cannot also be featured. The two contradict each other, and the symptom is confusing: the featured list is built from content the filter already removed, so a post promoted to the home page is simply absent from it.

A published publication needs at least one published post. An empty posts array fails; a posts array made entirely of drafts fails. Either would render a page with no posts and a browse card claiming 0 posts. Set isDraft on the publication as well until one of its posts is ready.

### One thing to check by hand

Nothing validates links in post prose: drafting a post another post links to leaves a link to a 404. Before drafting an already-published post, search the content directory for the slug and remove or reword any link found. Drafting something public also deserves a redirect: see [URLs, slugs, and redirects](/blog-platform-docs/urls-and-redirects).

## Post body rules

Start the body with one H1 matching the post title. The standard post page uses the post title for the page header and strips this leading H1 from the rendered body; do not repeat it in the article content.

Use H2 through H5 for article sections. They receive stable IDs and appear in the table of contents. Duplicate headings get numbered IDs. H6: parsed and rendered, not in the table of contents. A heading inside an accordion renders as a heading but gets no anchor ID and stays out of the table of contents (a copied link would point into collapsed content).

Blank line between paragraphs, headings, lists, quotes, tables, and code blocks. Raw .md files use backticks normally. Legacy TypeScript template strings: escape any literal backticks in the post body.

## Supported Markdown components

The renderer supports normal Markdown: paragraphs, emphasis, strong text, strikethrough, inline code, headings, links, images, blockquotes, unordered and ordered lists, task-list checkboxes, horizontal rules, tables, fenced code blocks, hard line breaks.

The remark-gfm plugin adds autolink literals, footnotes, strikethrough, tables, and task lists. Executable reference for each form: [Markdown reference](/blog-platform-docs/markdown-reference).

Custom YouTube embed: a standalone shortcode with an 11-character video ID:

~~~text
@[youtube](dQw4w9WgXcQ)
~~~

YouTube watch, embed, and youtu.be URLs are also recognized as standalone paragraphs: pasting a video link on its own line embeds the player, intended or not. To keep a plain link, put it inside a sentence or write it as a Markdown link.

Accordion: a collapsible section whose body is ordinary Markdown:

~~~text
:::accordion[The visible summary line]
Any Markdown, including the other components.
:::
~~~

The [Markdown reference](/blog-platform-docs/markdown-reference) shows both forms and what belongs inside one.

## Links and images

Internal links: root-relative paths:

~~~md
[Browse the posts](/browse/posts)
[Jump to a section](#section-heading)
~~~

Root-relative links stay inside the Next.js router. Hash links use native anchor navigation. Absolute HTTP and HTTPS links: external, open in a new tab.

Standard Markdown images: site-served files or external HTTPS URLs:

~~~md
![Descriptive alt text](/static/blog-authors/rj-pic.png)
![Remote image](https://images.example.com/photo.webp)
~~~

### Where an image file belongs

Three places an image can live. The difference matters.

**A post's own directory**, at posts/post-slug/assets/. For images used inside one post's body. They sit beside the writing that uses them and are deleted with it. Reference from that post's .images.ts file, as in the modular post format above.

**The publication's directory**, at publications/publication-id/assets/. For images belonging to the publication as a whole, and for cover images of legacy single-file posts, which have no directory of their own. Import in the publication's index.ts:

~~~ts
import publicationCover from "./assets/publication-cover.png"
import firstPostCover from "./assets/first-post-cover.png"

export const publicationName: Publication = {
  coverImage: publicationCover.src,
  posts: [
    {
      postId: 501,
      slug: "first-post",
      coverImage: firstPostCover.src,
    },
  ],
}
~~~

**The site's public directory**, at v0/www/public/static/. For files belonging to the site, not any publication: author photographs and anything else referenced from content/authors.ts, plus the site-wide link-preview fallback under static/og/. Addressed root-relative, public part of the path dropped, one directory per purpose:

~~~text
v0/www/public/
└── static/
    └── blog-authors/
        └── rj-pic.png     addressed as /static/blog-authors/rj-pic.png
~~~

New directories under static: lowercase kebab-case.

**Prefer the first two.** An imported file gets a hashed name at build time; a wrong import is a build error, not a broken image on a published page. A root-relative string is checked far less: the validator confirms the source is root-relative or HTTPS, nothing confirms the file exists. Everything in the public directory is published whether referenced or not, so unused files accumulate there unnoticed.

Keep a SOURCES.md beside any assets directory recording where the files came from: photographer and licence for a photograph, generator and version for a generated asset.

### Cover images are also link previews

A coverImage does two jobs: the cover shown on the site, and the Open Graph image used when the address is shared (a page takes its Open Graph image straight from that field). No separate field for either.

Draw covers at 1200 by 630 when possible. That is the frame most social networks show and the ratio the page-top banner uses, so a cover at that size shows whole rather than cropped.

No cover-generation or verification tooling is bundled. Create or source the asset separately, import it from the content directory, and record its origin, licence, dimensions, and any text drawn into it in the nearest SOURCES.md. Keep older versioned covers when a public page has used them because social networks cache image URLs.

Other shapes still appear and a cover must survive them: the sixteen-by-nine card in a list, and the square thumbnail beside a row or a previous and next link. Both take a slice out of the middle. Keep anything that must stay readable near the centre; treat the outer edges as decoration you can afford to lose. Inspect the image at each crop because the build validates the source string, not the composition.

A link preview needs an absolute address. The site supplies one through metadataBase in the root layout, set to the production domain. Without it the framework falls back to localhost and every preview points at a machine not on the internet.

A cover is optional; a page without one is still shareable. The root layout declares a site-wide fallback image, kept at v0/www/public/static/og/, and any page without its own image inherits it: the landing page, the browse page, author pages, and any publication or post with no cover. The choice is a specific preview versus a generic one, never a preview versus nothing.

Caution when editing a page's metadata: the fallback works because a page with no cover omits the Open Graph block entirely. Setting it to undefined is not the same: it replaces the inherited value instead of deferring to it, leaving the page with no preview image at all. Add the block conditionally; check the tag afterwards by reading the page source.

Provide useful alt text unless the image is genuinely decorative. Modular posts: prefer post-owned assets and the @[image](image-key) shortcode when an image needs separate thumbnail and lightbox sources.

## Deliberately unsupported formats

No YAML frontmatter, MDX, or raw HTML in posts: the application enables none of them. Single newlines do not become visible line breaks; use two trailing spaces or a new paragraph for a hard break.

## Publishing checklists

Adding a post and adding a publication are different jobs. Use the matching checklist. Adding a post never touches content/registry.ts; adding a publication always does.

### Adding a post

1. Choose the legacy single-file format or create a modular post directory with index.ts and a raw .md file.
2. Use a postId unique within the publication, a URL-safe slug, valid ISO dates, and existing author IDs.
3. Start the post body with its matching H1.
4. Use H2-H5 for navigable sections.
5. Put body images and their source record in the modular post's assets directory. A legacy post's cover goes in the publication's assets directory instead (a legacy post has no directory of its own).
6. Put named single-image and image-list configurations in the post's .images.ts file when needed.
7. Give configured images dimensions, useful alt text, and separate thumbnail and lightbox sources where practical.
8. Optionally add a coverImage, imported rather than written as a path. It doubles as the post's link preview.
9. Check component syntax against the [Markdown reference](/blog-platform-docs/markdown-reference).
10. Add the post to its publication's posts array, in reading position.
11. Set isDraft to true if the post is not ready to be read; the build then leaves it out. Set isFeatured to false while it is a draft; the two together fail validation.
12. Run typecheck, lint, and build, all from v0/www (the root package.json has none of these scripts). The build runs the content validator and generates the new route; a passing typecheck alone proves nothing about the content.

### Adding a publication

1. Create content/publications/publication-id/index.ts: lowercase kebab-case directory name, matching pubId.
2. Use an unused positive relId, a pubId that is not authors, browse, or publications, and valid ISO dates.
3. Write the title, description, and tags. Add the optional synopsis and editorNotes if the publication needs them.
4. Optionally add a coverImage imported from the publication's assets directory, with a SOURCES.md recording where it came from.
5. Add at least one post, following the post checklist above. Validation rejects a published publication with no posts.
6. Import the publication in content/registry.ts and add it to the authoredPublications array.
7. Set isDraft to true if the publication is not ready. Same if every post in it is still a draft; validation requires this rather than suggests it.
8. Run typecheck, lint, and build from v0/www.

Rules behind each step, and the exact message thrown when one fails: [Content validation rules](/blog-platform-docs/content-validation).
`
