export const urlsAndRedirects = `
# URLs, slugs, and redirects

One file builds every address. Redirects preserve an address after it has shipped. This post covers: how URLs are built, how a post is found from one, what to do on a rename. Doc map: [Working with the platform](/blog-platform-docs/working-with-the-platform).

## One file owns every URL shape

content/routes.ts is the only place that knows the site's address shapes:

~~~ts
export const browseContentTypes = ["posts", "publications", "authors"] as const
export const defaultBrowseContentType: BrowseContentType = "posts"
export const browseHref = "/browse"

export function browseContentHref(contentType: BrowseContentType) {
  return \`\${browseHref}/\${contentType}\`
}

export function publicationHref(pubId: string) {
  return \`/\${encodeURIComponent(pubId)}\`
}

export function authorHref(authorId: string) {
  return \`/authors/\${encodeURIComponent(authorId)}\`
}

export function postHref(pubId: string, post: Pick<Post, "postId" | "slug">) {
  return \`\${publicationHref(pubId)}/\${encodeURIComponent(post.slug ?? String(post.postId))}\`
}
~~~

Pages, cards, breadcrumbs, next-and-previous links: all call these functions. Two exceptions: the header's home link (a literal slash), and redirect sources in next.config.ts (incoming addresses, plain strings, never rebuilt by a helper). Changing a live address shape is a one-file change; the compiler finds every caller.

Two properties:

- Every piece is escaped. An identifier with an unusual character cannot break the address.
- A post falls back to its numeric ID when it has no slug. This is what makes slugs optional.

The addresses on the site:

| Address | What it shows |
| --- | --- |
| / | The landing page |
| /browse/posts | The searchable index of posts |
| /browse/publications | The searchable index of publications |
| /browse/authors | The searchable index of authors |
| /{pubId} | One publication and its posts |
| /{pubId}/{slug} | One post |
| /authors/{authorId} | One author and everything they have written |

Publications sit at the top level, no prefix. Deliberate. Reason for the reserved-word rule below.

Browse has three addresses, content type as a path segment, not a query parameter. Two consequences: each of the three is built ahead of time with its own title and description; an unrecognised type such as /browse/drafts is a 404, not a page quietly showing something else.

/browse alone redirects to /browse/posts. No link inside the site points there: every one calls browseContentHref, so site navigation never passes through that redirect. It exists for external links and hand-typed addresses.

## How a post URL is resolved

Request for /blog-platform-docs/adding-content: the registry looks up the publication by ID, then searches its posts for a match on slug or numeric ID as text:

~~~ts
const postIndex = publication.posts.findIndex(
  (post) => post.slug === postKey || String(post.postId) === postKey
)
~~~

Looks like two working addresses per post. It is not.

The lookup accepts either form; only one is built as a page. The route lists its addresses:

~~~ts
postId: post.slug ?? String(post.postId),
~~~

A post with a slug contributes only its slug. Nothing outside that list exists: /blog-platform-docs/402 returns 404 even though the lookup would resolve it. Every post currently has a slug, so no numeric address exists on the site.

The numeric branch matters only for a post with no slug; then it is that post's single address. Rule: one address per post, slug if present, number otherwise.

The lookup also returns the post's array position, used for the previous and next links at the foot of a post. Editorial order is array order. See [The content contract](/blog-platform-docs/content-contract).

## Reserved publication IDs

Publications live at the top level, so a publication ID could collide with a real route. Three words refused outright:

~~~text
authors
browse
publications
~~~

A publication using one would be shadowed by the same-name route and unreachable. The validator rejects it with "browse: pubId conflicts with a reserved route" before the site builds.

New top-level route: add its name to reservedPublicationIds in content/validation.ts in the same change. Forgotten, it surfaces much later as a publication that will not open.

## Only known addresses exist

The four content routes (publication, post, author, browse) each list their addresses ahead of time and refuse everything else. Post page:

~~~tsx
export const dynamicParams = false

export function generateStaticParams() {
  return allPosts.map((post) => ({
    pubId: post.publicationId,
    postId: post.slug ?? String(post.postId),
  }))
}
~~~

generateStaticParams lists every address to build. dynamicParams false: anything off the list is a 404, never rendered on demand.

Three consequences:

- **New content requires a build.** No way to add a post to a running site. Intended trade: the site is a set of files, nothing generated at request time.
- **A draft has no address.** The list comes from the registry, drafts already removed. Nothing is built, the path is a 404 like any other unknown address. No page checks a flag; no half-published state. See [Adding a publication or post](/blog-platform-docs/adding-content).
- **A typo in a link is caught as a 404, not as a broken page.** Not checked: links written inside post prose. /blog-platform-docs/does-not-exist builds happily and 404s for the reader. Click the internal links you write.

## Internal and external links in prose

The renderer sorts links into three kinds in v0/www/app/(blog)/components/markdown.tsx, test defined in markdown-utils.ts:

- Starts with a hash: plain anchor, browser handles it, jumps within the page.
- Starts with a single forward slash: internal, app navigation, no page reload.
- Anything else: external, new tab, rel noopener noreferrer.

The internal test excludes two lookalikes:

~~~ts
export function isInternalHref(href: string) {
  return (
    href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/\\\\")
  )
}
~~~

Two slashes: a full address to another site with the scheme left off. Slash then backslash: a known trick browsers may read the same way. Both leave the site while looking internal; both excluded.

Author rule: write internal links as root-relative paths, starting with a slash.

## Redirects start from a clean baseline

Redirects live in v0/www/next.config.ts. 11pc starts with one convenience rule, not copied address history:

~~~ts
{ source: "/browse", destination: "/browse/posts", permanent: true }
~~~

No internal link pays for it because components call browseContentHref with the final path. It exists for hand-typed and external links.

## Renaming without breaking links

Changing a publication ID or post slug changes its public address. Once that address has shipped, add its redirect in the same change. The examples below are illustrative, not current 11pc history.

### Renaming a publication

A publication needs two rules, one for its page and one for every post below it:

~~~ts
{ source: "/old-series/:postId", destination: "/new-series/:postId", permanent: true },
{ source: "/old-series", destination: "/new-series", permanent: true },
~~~

Then:

1. Change pubId and rename its directory to match.
2. Search content for the old ID. Prose links are plain text; the compiler will not update them.
3. Run build, open both old forms, confirm they land on the current pages.

### Renaming a post slug

A post needs one rule:

~~~ts
{ source: "/example-publication/old-title",
  destination: "/example-publication/new-title", permanent: true }
~~~

The numeric ID is not a fallback address, so the redirect is the only thing preserving the old link. Search separately for the old slug and title. Links in prose and text drawn into an image do not fail a build.

permanent true sends a 308. Browsers and search engines record the move as final. Put specific rules above general patterns because the first matching source wins.

### Removing or drafting published content

Deleting content leaves its address returning 404 (the styled page covered in [Feeds, crawlers, and the 404 page](/blog-platform-docs/feeds-and-crawlers)). Setting isDraft on previously published content does the same. If the address was public, redirect it somewhere useful and search post prose for incoming links.

Content that has never shipped needs no redirect. Do not import another site's address history into a new copy.

## When a path is not enough

Every helper in content/routes.ts returns a path starting with a slash: enough for links inside the site. Two things need the whole address, host and all: link previews social networks read, and the share links on post and publication pages.

The host lives in v0/www/lib/site.ts, once, as siteOrigin, with absoluteUrl beside it to join the two halves:

~~~tsx
absoluteUrl(postHref(publication.pubId, post))
~~~

routes.ts decides the path; site.ts prepends the host. Never assemble a path inside absoluteUrl and never write the host anywhere else.

The origin is a build-time constant. A link shared from a preview therefore points at the permanent site, not at a preview address that will disappear.

## Rules of thumb

- Choose the slug carefully at the start. It is the address; changing it costs a redirect after publication.
- Never delete a redirect for an address 11pc actually published.
- Keep specific rules above general ones.
- Build paths by calling the helpers in content/routes.ts. Full address needed: wrap the result in absoluteUrl.
- After any rename, check the old address by hand.
`
