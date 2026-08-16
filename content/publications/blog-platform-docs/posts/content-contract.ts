export const contentContract = `
# The content contract

The writing does not live inside the website. It lives in a directory next to it, in plain TypeScript, and the website imports it. This post: why, what the boundary guarantees, and what a replacement website must provide. Map of the documentation set: [Working with the platform](/blog-platform-docs/working-with-the-platform).

## Two directories, one boundary

~~~text
11pc/
├── content/          the writing and its rules
└── v0/www/           the website that renders it
~~~

v0 currently contains only www, the presentation layer that renders the content.

content has no dependency on Next.js, React, or anything in v0/www. Types, data, a small amount of derivation, a validator. Importable from a script, another framework, or a test with nothing else installed.

The dependency runs one way: v0/www imports from content, content imports nothing back. That single rule is the contract. Everything else in this post follows from it.

v0 in the path states intent: the website is version zero of a presentation layer, expected to be replaced. The content is not.

## How the boundary is wired

Two settings in v0/www/tsconfig.json do the work (trimmed here to the boundary entries; the real file has more aliases and Next.js include globs):

~~~json
"paths": {
  "@content/*": ["../../content/*"]
},
"include": ["**/*.ts", "**/*.tsx", "../../content/**/*.ts"]
~~~

- Alias: the website writes @content/registry, not a chain of parent directories.
- Include: content files are type-checked as part of the website's own typecheck. A type mistake in a content file fails the same command that checks the components.
- Rule violations are separate, caught by the build: [Content validation rules](/blog-platform-docs/content-validation).
- The bundler needs matching configuration: [Running and releasing the blog](/blog-platform-docs/running-the-blog).

## The registry is the only door

content/registry.ts is the entry point. Pages import from it. Nothing in the website imports a publication file directly.

Five jobs, in order:

- **Assembles.** Imports each publication into a private array, authoredPublications: everything written, drafts included. Re-exports the author list as blogAuthors.
- **Validates.** Calls the checker at module top level, so importing the registry validates the content. Rule failure is build failure. Runs on the full authored list, before anything is hidden, so drafts meet the same rules as published posts. See [Content validation rules](/blog-platform-docs/content-validation).
- **Filters.** Removes drafts, exports the rest as publications. Both levels: a draft publication takes its posts with it, a draft post disappears from a published publication. Posts of a draft publication get marked as drafts themselves (truth restated), so badges check one flag, not two. The only place in the site where a draft is hidden. See [Adding a publication or post](/blog-platform-docs/adding-content) for how the flag behaves.
- **Derives.** Pre-computes the shapes pages need; no page joins data itself. Every derived export is built from the filtered list, so hiding a draft needs no other change: counts, lists, addresses, previous and next links all follow.
- **Looks things up.** Exports the functions that find one publication, post, or author. These read the filtered list too: a draft's address resolves to nothing, the page returns 404.

Exports:

| Export | What it is |
| --- | --- |
| publications | Every published publication, in editorial order, with its published posts attached. Drafts are already gone |
| blogAuthors | Every author, in full |
| allPosts | Every post from every publication, flattened, with its publication and resolved authors attached |
| publicationPreviews | Every publication without its posts, plus a link, a post count, and its authors |
| postPreviews | Every post without its body or images, for lists and cards |
| authorPreviews | Every author plus a link and how many posts they have written |
| getPublication, getPost, getAuthor | Single-item lookups |
| getPostsByAuthor | Every post preview for one author |
| getPublicationAuthors | The authors of a whole publication |
| getPostPreview | A preview for one post, when you already hold the publication |
| getPostContent, stripLeadingH1 | Small helpers for preparing a body to render |

Everything routes through this file because derivation runs once, at module load, and every page sees the same result. A page reading a publication file directly would resolve author IDs itself, build its own links, and drift the moment the shape changed.

## Why there are preview types

A post carries its whole body and possibly a dozen configured images. A card on the browse page needs the title, the excerpt, the date, and a link.

content/types.ts defines narrower shapes derived from the full ones:

~~~ts
export type PostPreview = Omit<
  PostListItem,
  "content" | "images" | "imageLists" | "authorIds"
>

export type PublicationPreview = Omit<Publication, "posts"> & {
  href: string
  postCount: number
  authors: AuthorPreview[]
}
~~~

- Types cannot drift: built with Omit, so a field added to Post reaches the preview type automatically unless excluded.
- Values are half-covered. publicationPreviews uses a rest spread and follows the type on its own. toPostPreview in the registry writes each field out by hand, so adding a field to Post breaks the typecheck there until the line is added. The compiler catches the omission either way; nothing drifts silently, but there is one function to update, not none.
- Payoff: the browse page is a client component, so everything it receives is serialised and sent to the browser. Handing it postPreviews rather than allPosts keeps every post body out of that payload.
- authorIds is dropped because resolved author details replace it; keeping the raw IDs would invite a second lookup.
- isDraft is kept even though it is false in every production build: the Draft badge reads it on the dev server, where drafts are served on purpose.

A publication preview gains something its full form lacks: an authors list. A publication never declares its authors: that would be a second place for the same fact, and the two would eventually disagree. The registry collects everyone with a byline on at least one of its posts, ordered by post count then name, so the main author leads. Add a post and the publication's authors update on the next build.

## Editorial order is array order

A publication holds its posts as a plain array. That order is the editorial order. Nothing sorts it.

Two features depend on this. The registry records each post's position as editorialIndex while flattening, and the post page finds neighbours from the position the lookup returns:

~~~ts
const previous = publication.posts[postIndex - 1]
const next = publication.posts[postIndex + 1]
~~~

The previous and next links at the foot of a post follow the array, not the dates. Reorder the array, reorder the reading sequence. Intentional: a publication is a series, and a series has an order its author chose.

Those two lines are also why the draft filter rebuilds the posts array rather than only filtering the derived lists. They read positions straight off the publication; a draft left in the array would become a dead link out of a live post. Removing it closes the gap: the chain runs from the post before it to the post after.

Dates are used explicitly where used: the landing page sorts by created date for its "latest" lists, the browse page offers newest and oldest as sort options. Presentation choices layered on top of the editorial order, not replacements for it.

## The two helpers a renderer needs

Post bodies begin with a first-level heading that repeats the title, so the Markdown file reads on its own. The page displays the title itself, so the body's copy has to go:

~~~ts
export function getPostContent(post: Post) {
  return post.content?.trim() || null
}

export function stripLeadingH1(markdown: string) {
  return markdown.replace(/^\\s*#\\s+[^\\n]+\\n+/, "")
}
~~~

- getPostContent returns null rather than an empty string for an empty body, so a page can distinguish "no content" from content that happens to be short. The post page uses that to show an access message instead of an empty article.
- Both live in the content layer, not the website: facts about the content format, not about how it is displayed.

## Replacing the website

The one-way dependency makes a different front end bounded work, not a rewrite. It must provide:

- **A way to import a .md file as a string.** content/markdown.d.ts already declares the shape; the bundler needs a loader that produces it. The current one is three lines.
- **A way to import an image file and read its source, width, and height.** Post image modules rely on this; it is the only other build-time capability the content assumes. Caveat: the type declaration that makes those image imports check today comes from Next.js, through the global reference in v0/www/next-env.d.ts, not from the content directory. A replacement front end must supply its own equivalent declaration.
- **The five routes.** Landing, browse, publication, post, author. content/routes.ts owns their addresses through its link builders; the shape of each page is the front end's to design.
- **A Markdown renderer** handling standard Markdown, the GitHub extensions, the three custom shortcodes, the accordion container, and the bare YouTube URL form. See [Extending the renderer](/blog-platform-docs/extending-the-renderer).

Everything else, including all validation, comes with the content.

## Rules for changing the contract

- **Adding an optional field is safe.** Existing content stays valid, existing pages ignore it. Add a validation rule for it at the same time.
- **Adding a required field changes every publication file.** Do it deliberately, and update [Adding a publication or post](/blog-platform-docs/adding-content) in the same change.
- **Never import from v0/www inside content.** It reverses the dependency and makes the content layer unusable anywhere else. Nothing in the website is worth it.
- **Format knowledge in content, appearance knowledge in the website.** "A body starts with a first-level heading" is format: stripLeadingH1 belongs in content. "A second-level heading has a top margin" is appearance: belongs in the renderer.
- **Keep the registry the only entry point.** If a page needs something the registry does not expose, add a derived export or a lookup function. Do not reach past it.
`
