export const renderingModel = `
# How pages are rendered

Every page is built before anyone visits. No per-request assembly, no database queries, almost none of the page-producing code sent to the browser. This post covers the mechanism, the exceptions, and the costs.

## Everything is built ahead of time

The four content-varying routes declare their addresses at build time and refuse anything else:

~~~tsx
export const dynamicParams = false

export function generateStaticParams() {
  return allPosts.map((post) => ({
    pubId: post.publicationId,
    postId: post.slug ?? String(post.postId),
  }))
}
~~~

Publication, author, and browse routes do the same with their own lists. dynamicParams false: an unlisted address is a 404, never rendered on demand. See [URLs, slugs, and redirects](/blog-platform-docs/urls-and-redirects). Each route also exports generateMetadata, building the page title, description, and link-preview tags from the same registry data at the same time.

Possible because content is imported code, not fetched data. The registry assembles and validates everything before any page function runs, so a page is a function from in-memory data to markup.

The trade: publishing requires a build. No way to add a post to a running site.

## Server by default

Components run on the server unless marked. Starting a file with "use client" pulls it, plus everything it imports, into the code sent to the browser.

Twenty-one hand-written entries opt in, each with a reason:

| File | Why it runs in the browser |
| --- | --- |
| browse.tsx | Search text, tag filters, sort, and layout state |
| publication-browser.tsx | The same controls, plus tabs |
| content-index.tsx | Tracks the reading position to highlight the active heading |
| copy-code-button.tsx | Writes to the clipboard |
| copy-link-button.tsx | Writes to the clipboard, in the share row |
| native-share-button.tsx | Opens the device share sheet, where there is one |
| bookmark-button.tsx | Saves or removes one publication or post |
| bookmarks-provider.tsx | Scopes the LSDB client to bookmark-enabled islands |
| markdown-image.tsx | Opens the fullscreen viewer |
| cover-image.tsx | Tracks whether a photo loaded, and opens the viewer |
| image-lightbox.tsx | Zoom, pan, swipe, and keyboard navigation |
| multi-image-list.tsx | Selection state for a gallery, and focus return |
| masonry-image-list.tsx | Opens the viewer from a masonry gallery |
| quilted-image-list.tsx | Opens the viewer from a quilted gallery |
| theme-provider.tsx | Reads and sets the colour mode |
| theme-toggle.tsx | The button that switches mode |
| hooks/use-persisted-preference.ts | Builds the store behind each remembered preference |
| hooks/use-view-mode.ts | The list-or-cards choice |
| hooks/use-sort-order.ts | The content and author sort choices |
| hooks/use-mounted.ts | Answers whether the first render is over |
| hooks/use-bookmarks.ts | Reads, writes, and subscribes to browser-local bookmarks |

Vendored components under components/ui carry the same directive (generator output). Most are never imported, so never ship. One does: the dialog, which the image viewer is built on. See [Design tokens and theming](/blog-platform-docs/design-tokens) for what that directory is.

Everything else runs server-only, including the Markdown renderer and every page. The renderer still emits interactive islands (an inline image, a gallery): those are the client components in the table, imported at the leaves. The parsing and the component map never ship.

The pattern: interactive parts are small and pushed to the leaves. A page is a server component rendering mostly server components, with a few islands inside. The post page sends no JavaScript of its own. What ships: the sidebar, the cover image, one copy button per fenced code block, the copy-link and share-sheet buttons in the share row, and the image components for any post with images.

### The share row is a worked example

The share actions at the foot of a post are the clearest case, because they are a mixture:

- Six of the eight controls: links to a page a social network owns. Links need no JavaScript, so the component rendering them, v0/www/app/components/share-actions.tsx, is an ordinary server component.
- Two need the browser: one writes the address to the clipboard, one opens the device's share sheet. Each is a separate small file marked "use client".

Written the obvious way, as one browser component wrapping everything, the whole row ships as JavaScript and the six links stop working until scripts load. Split, the row renders and works from the prerendered markup; the two buttons arrive later.

The share sheet button is the one control whose existence depends on the device. Most desktop browsers have no share sheet, so it renders nothing there. That test cannot run at build time, so it cannot run during first render either: the server would guess one answer, the browser might have another, and the two sets of markup would disagree. It renders nothing at first and appears after hydration, using v0/www/hooks/use-mounted.ts to know when. The colour theme toggle solves the same problem the same way.

### One consequence to watch for

A function exported from a "use client" file cannot be called on the server. Rendered or passed as a prop: yes. Invoked: no.

This is why the helper turning a title into initials sits in its own file, v0/www/components/media/cover-monogram.ts, with a comment explaining it. Server pages call it directly to compute a value; it could not live in cover-image.tsx beside the component using the result.

Need a helper on both sides: move it to a file with no "use client" marker.

## Code highlighting never reaches the browser

The code block is an async server component:

~~~tsx
export async function CodeBlock({ code, language }) {
  const html = await highlight(code, language)
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
~~~

Shiki, the highlighter, runs during the build. Its themes and language grammars are large; none reach the browser. The reader receives already-coloured markup. The block ships two small things of its own, the header bar's language label and the copy button (a client component). The highlighting never ships.

Every token carries both a light and a dark colour; the stylesheet picks between them. Switching mode recolours code without re-highlighting anything. See [Design tokens and theming](/blog-platform-docs/design-tokens).

Unknown languages fall back to plain text rather than failing, so a fenced block labelled with something Shiki does not recognise still renders.

## The image viewer loads on first click

The fullscreen viewer is the largest interactive component in the codebase, and most pages that could open it never do. So it is not in the initial download. Every component that can open it (cover image, inline post image, galleries) uses the same wrapper and renders the viewer only once opened:

~~~tsx
const ImageLightbox = dynamic(
  () => import("./image-lightbox").then((module) => module.ImageLightbox),
  { ssr: false }
)
~~~

Fetched when a reader first clicks a zoomable image. The comment in each file states the reason: a reader who never enlarges an image should never download the dialog.

ssr false: not rendered on the server either. Correct for something that only exists in response to a click.

## Plain image elements, on purpose

Next.js has an image component that optimises and resizes images. The blog does not use it for content images. Cover art, post images, gallery items: all plain image elements, with the objecting lint rule switched off at each of those lines.

Reason, stated in a comment in cover-image.tsx: content can point at any host, and the optimising component requires every host listed in configuration up front. Content needing a configuration change before it can reference an image breaks the boundary between content and website. See [The content contract](/blog-platform-docs/content-contract).

Author photographs live in the site's own public directory and are known ahead of time, so they do use the optimising component.

Cost: three things become manual.

**Dimensions.** Post images carry width and height in their configuration; those fields are required and validated. Without them the page jumps as each image arrives. Covers configured images only: a plain Markdown image written as ![alt](url) passes no dimensions through, so it can still shift the page as it loads. One more reason to prefer the named-image form.

**Thumbnails.** An image can carry a separate smaller source for inline or gallery use, with the full-size file loaded only in the viewer. No automatic resizing: both files prepared by hand.

**Load state.** The generated cover art sits behind every cover; the photograph fades in over it. The component must know whether the photograph loaded, failed, or is still arriving.

### The cached-image problem

That last point hides a bug that only appears on a second visit.

A cached image can finish loading before React attaches its handlers. The load event fires into nothing; the component waits forever for news that already happened. Fix: read the element as it attaches:

~~~tsx
function readOnAttach(image: HTMLImageElement | null) {
  if (!image?.complete) return
  report(image.naturalWidth > 0 ? "loaded" : "failed")
}
~~~

An element already complete has finished, one way or the other. A natural width of zero means it failed; checking the width distinguishes the two.

Related trick in the same component: the photograph's key is set to its source. Changing the key makes React treat it as a new element, so the pending state restarts on its own, no reset logic needed.

## The browse page reads its state from the route

The browse page shows one of three content types, chosen by path segment: /browse/posts, /browse/publications, /browse/authors. The route resolves the segment on the server and passes it down as an ordinary prop:

~~~tsx
<Browse
  contentType={content}
  authors={authorPreviews}
  posts={postPreviews}
  publications={publicationPreviews}
/>
~~~

It used to work the other way. The content type was a query parameter, read in the browser with a hook that suspends, so the page needed a Suspense boundary or the build refused to prerender. Moving the choice into the path removed the hook, and the boundary went with it. Rule: a value the server already knows should be resolved on the server and handed down.

The rest of the browse state (search text, selected tags, sort) is ordinary component state, not in the address.

## A reader preference the server cannot know

Three pieces of view state outlive the page: the card-or-list layout, how posts and publications are sorted, and how authors are sorted. Each lives in the browser's local storage, read through the same small store: built by v0/www/hooks/use-persisted-preference.ts, configured in use-view-mode.ts and use-sort-order.ts.

Each is shared by every list on the page, so choosing a layout or order on the browse page also applies inside a publication. Authors keep their own sort because none of its options mean anything for a post.

The same reasoning applies to any preference added next.

The obvious alternative is a cookie. A cookie arrives with the request, so the server could read it and render the right layout and order immediately, no correction afterwards. Closed here: reading a cookie in a server component makes the page dynamic, and these pages are prerendered. One preference would cost the whole static-generation model.

So the value is read in the browser, and the server renders the default. The store is read with useSyncExternalStore; the third argument is what the server renders and what hydration compares against:

~~~tsx
const value = React.useSyncExternalStore(
  subscribe,
  read,
  () => defaultValue
)
~~~

Passing the default there keeps the markup identical on both sides: no hydration mismatch. React reads the real value immediately after hydrating and re-renders if it differs.

Visible cost: a flash. A reader who prefers list sees cards for one frame. Cards and list produce genuinely different markup, not the same markup styled differently, so no CSS can fix it ahead of hydration. The alternative, a blocking script in the document head as the colour theme uses, is not worth it for a layout toggle.

Three details in that store, and the argument for one store rather than three copies:

- The stored value is validated against the list of allowed values on the way in. A hand-edited or stale entry falls back to the default instead of rendering nothing.
- Read and write are wrapped in try blocks, because storage throws outright in some privacy modes. A blocked browser loses the memory, keeps a working page.
- The store listens for the browser's storage event, so changing a preference in one tab updates every other open tab.

Getting those right once is the whole argument for the factory.

Note what is passed in: previews, not full posts. Everything handed to a browser component is serialised and sent over the network; the preview types keep every post body out of that payload.

## Bookmarks are local reader data

Publications and posts can be bookmarked without changing the content registry. A bookmark is reader-owned browser data, stored by @rj11io/lsdb-react in the bookmarks-v1 collection under this local-storage key:

~~~text
lsdb:11pc:bookmarks-v1
~~~

Each record carries its generated identifier, target type, stable target key, current address, and save time. Publication keys use publication: followed by the publication ID. Post keys use post: followed by the publication ID and numeric post ID. The numeric ID stays stable if a post slug changes; the address remains available for a future saved-items view.

Only detail pages write bookmarks. The browse page reads the same collection to offer Saved only for posts and publications. Cards stay ordinary links, and authors are not bookmarkable.

The provider is not mounted at the root. A detail-page button owns one small provider, while the browse route wraps only its browser component. That keeps LSDB out of pages that do not use it and preserves the server-component boundary around the rest of the site.

Construction is safe during prerendering, but storage access waits for the browser. The server and hydration render bookmark controls in their neutral disabled state; the hook reads the collection after mounting and then enables them. Writes notify other consumers on the page and storage events update other tabs.

The integration is fail-soft. Records are checked before use and duplicate target keys collapse to one visible bookmark. Malformed or invalid stored data is ignored and treated as empty. If local storage is blocked or a write is refused, the bookmark controls become unavailable and Saved only stops applying. Routes, content, search, feeds, and static generation continue unchanged.

## Markdown is parsed twice

The post page parses each body twice, on purpose:

- Once to collect the headings for the sidebar, in markdown-headings.ts.
- Once to render, in markdown.tsx.

One pass would mean the renderer collecting headings as a side effect and the sidebar waiting for it: a data dependency between two otherwise independent components. Two passes over a body already in memory, during a build, costs nothing worth optimising.

Both passes generate heading identifiers with the same factory:

~~~ts
export function createHeadingIdFactory() {
  const occurrences = new Map<string, number>()

  return (label: string) => {
    /* slugify, then number any repeat */
  }
}
~~~

It strips accents, lowercases, replaces anything not a letter or digit with a hyphen, trims stray hyphens from the ends, falls back to the word section when nothing survives, and appends a number to repeats so two identical headings get distinct identifiers. The sidebar and the renderer both use it and both walk the document in the same order, so links and targets always agree. One subtlety keeps the walks in step: both passes skip the inside of container directives, so a heading inside an accordion neither gets an anchor nor advances the duplicate counter. [Extending the renderer](/blog-platform-docs/extending-the-renderer) explains the machinery.

Changing how identifiers are made changes both callers together, and old links to old anchors break. Same problem as renaming a slug, one level down.

## What this buys, and what it costs

Buys: pages that are files, no server work per request, almost no JavaScript on a reading page, a build that fails loudly when content is wrong.

Costs: publishing needs a build, content cannot change at request time, image handling is manual work at authoring time.

Both lists are short; that is the point. Considering this approach for another blog, the deciding question: willing to run a build to publish? If yes, most of the rest follows.
`
