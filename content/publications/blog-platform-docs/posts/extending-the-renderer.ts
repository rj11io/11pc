export const extendingTheRenderer = `
# Extending the renderer

The blog adds four pieces of syntax to Markdown: a named image, an image list, a YouTube embed, an accordion container. First three are shortcodes, written and built the same way. The accordion is a directive, covered in its own section below. This post explains both shapes so you can add another.

To use the existing syntax, read [Markdown reference](/blog-platform-docs/markdown-reference) instead. This post is for changing the renderer. Documentation map: [Working with the platform](/blog-platform-docs/working-with-the-platform).

## The shape of a shortcode

A shortcode is a paragraph containing only an at sign, a name in square brackets, and an argument in round brackets:

~~~md
@[image](workspace-overview)
@[image-list](quilted:title-below)
@[youtube](dQw4w9WgXcQ)
~~~

Already valid Markdown. A parser reads it as two nodes: plain text "@", then a link with label "image" and address "workspace-overview". No parser changes needed. All the work is recognising that pair and swapping it for something else.

Recognition happens in a remark plugin. Remark is the blog's Markdown parser; a plugin is a function that walks the parsed document and edits it before it becomes HTML. All plugins live in one file: v0/www/app/(blog)/components/markdown-utils.ts.

## The five steps

Adding a component touches two files: plugin in markdown-utils.ts, component in markdown.tsx. Neither is long.

Example: a callout, a short highlighted note, written as @[callout](note) followed by the text.

### Step 1: write the plugin

The plugin visits every paragraph, checks the shortcode shape, rewrites on match:

~~~ts
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

const calloutTonePattern = /^(?:note|warning)$/

export const remarkCallout: Plugin = () => (tree) => {
  visit(tree, "paragraph", (node) => {
    const paragraph = node as MarkdownNode
    const [prefix, link, ...rest] = paragraph.children ?? []

    if (
      prefix?.type !== "text" ||
      prefix.value !== "@" ||
      link?.type !== "link" ||
      markdownText(link).toLocaleLowerCase() !== "callout" ||
      !link.url ||
      !calloutTonePattern.test(link.url)
    ) {
      return
    }

    paragraph.data = {
      hName: "callout-block",
      hProperties: { tone: link.url },
    }
    paragraph.children = rest
  })
}
~~~

Four points:

- **Strict guard.** First child must be the exact text "@", second a link, link label the shortcode name, address present and valid. Anything else is left alone. Prevents a paragraph mentioning an email address or a bracketed word from being read as a shortcode.

- **Validate the argument before use.** The three existing plugins test the link address against a pattern: an eleven-character video ID for YouTube; for images and lists, a key of letters and digits joined by hyphens, underscores, or colons. The renderer's key pattern accepts capitals, the content validator rejects them, so keys are lowercase in practice. Do the same. Stops a typo becoming a broken element; for embedded content, stops arbitrary text reaching an attribute.

- **hName replaces the element.** data.hName makes remark render the paragraph as an element with that name instead of a paragraph. Name is yours; keep it hyphenated so it cannot collide with a real HTML tag.

- **Children decide whether text survives.** Image, image list, and YouTube plugins set children to an empty array: the shortcode is the whole content. The callout keeps the rest: the note's text follows the shortcode. One guard the image and image-list plugins add that the example omits: they reject a paragraph with anything after the shortcode, by checking rest is empty. A component that discards its children should do the same, or trailing text silently disappears.

### Step 2: keep property names lowercase

Property names set through hProperties reach the component lowercase, always. Hence videoid, imagekey, and listkey, not videoId, imageKey, or listKey.

Write the property lowercase in the plugin, read it lowercase in the component. A capital letter in hProperties means the component receives nothing and renders nothing, with no error. Most common failure here.

### Step 3: register the plugin

Add the plugin to the list inside the Markdown component in markdown.tsx:

~~~tsx
<ReactMarkdown
  remarkPlugins={[
    remarkGfm,
    remarkDirective,
    remarkAccordion,
    remarkYouTube,
    remarkPostImage,
    remarkImageList,
    remarkCallout,
  ]}
  components={components as Components}
>
  {content}
</ReactMarkdown>
~~~

Order is load-bearing; the comment beside the array in markdown.tsx records why:

- remarkDirective parses directive syntax. remarkAccordion must run straight after it, before the shortcode plugins, so a shortcode inside an accordion body is still found.
- Shortcode plugin order is free: each requires a different link label. One caveat: remarkYouTube also matches a paragraph that is nothing but a YouTube URL, no label involved.
- Put a new shortcode plugin at the end, with the others.

### Step 4: write the component

Add an entry to the components object, keyed by the exact hName:

~~~tsx
function CalloutBlock({ tone, children }: MarkdownElementProps) {
  return (
    <div
      className={
        tone === "warning"
          ? "my-8 border-l-2 border-destructive bg-destructive/5 py-4 pl-5"
          : "my-8 border-l-2 border-primary bg-muted/40 py-4 pl-5"
      }
    >
      <p className="leading-8 text-muted-foreground">{children}</p>
    </div>
  )
}
~~~

Register it alongside the others:

~~~tsx
const components = {
  // ...existing entries
  "youtube-embed": YouTubeEmbed,
  "post-image": (props: MarkdownElementProps) => (
    <ConfiguredPostImage {...props} images={images} />
  ),
  "image-list": (props: MarkdownElementProps) => (
    <PostImageList {...props} imageLists={imageLists} />
  ),
  "post-accordion": PostAccordion,
  "unknown-directive": UnknownDirective,
  "callout-block": CalloutBlock,
} satisfies Partial<Components> & {
  "youtube-embed": (props: MarkdownElementProps) => ReactNode
  "post-image": (props: MarkdownElementProps) => ReactNode
  "image-list": (props: MarkdownElementProps) => ReactNode
  "post-accordion": (props: MarkdownElementProps) => ReactNode
  "unknown-directive": (props: MarkdownElementProps) => ReactNode
  "callout-block": (props: MarkdownElementProps) => ReactNode
}
~~~

Two details:

- The new element name goes in the type after satisfies: the renderer's own list of known components excludes invented element names. The whole object is passed with a cast at the point of use, same reason. Add the entry in both places or typecheck fails.
- Add the new property to the shared props type at the top of the file:

~~~ts
type MarkdownElementProps = {
  children?: ReactNode
  href?: string
  src?: string
  alt?: string
  className?: string
  videoid?: string
  title?: string
  imagekey?: string
  listkey?: string
  open?: boolean
  inaccordion?: string
  directivename?: string
  tone?: string
}
~~~

The open field shows hProperties values are not always strings: the accordion plugin sets open as a real boolean, and the node type in markdown-utils.ts allows string or boolean. The lowercase rule from step 2 applies either way.

### Step 5: decide what a mistake looks like

If the component takes a key that must exist elsewhere, copy the image components' pattern. A missing key shows a red box in development, renders nothing on the published site:

~~~tsx
if (!image) {
  return process.env.NODE_ENV === "development" ? (
    <div className="my-8 border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
      Image &quot;{imagekey}&quot; is not configured for this post.
    </div>
  ) : null
}
~~~

Reasoning: the author sees the mistake immediately, the reader never sees a broken component. If a validation rule could catch the mistake instead, prefer that. See [Content validation rules](/blog-platform-docs/content-validation).

## Containers are directives, not shortcodes

A shortcode is one line becoming one element. It cannot wrap a body of Markdown: the plugin would have to guess where the body ends by scanning siblings, and that guess breaks on the first nesting.

Containers use remark-directive, which parses a fenced block into a node whose children are ordinary Markdown:

~~~text
:::accordion[The summary line]
A body. Other components keep working here.
:::
~~~

The plugin, remarkAccordion in markdown-utils.ts, only maps that node to an hName, same as step 1. Children need no handling: react-markdown renders them back through the same components object, which makes nesting free. The accordion is the first container; a callout or a tabbed block would follow the same path.

Rule: **shortcodes are for leaf embeds, directives are for containers.** Do not add a paired open and close shortcode.

Two costs of remark-directive, both already paid in remarkAccordion. Extend it rather than starting a second directive plugin:

- Loading it makes ANY colon-prefixed word a directive, and an unhandled directive renders as nothing. Prose like :root in the design tokens post would silently vanish. remarkAccordion turns unhandled text and leaf directives back into the colons and name the author wrote. Close, not perfect: a bracketed label survives as its text, an attribute block in curly braces is not reconstructed.
- An unknown container name, like the typo :::acordion, becomes a development-only warning box that still renders its children in production, same policy as step 5.

One interaction: extractMarkdownHeadings skips every container subtree, and remarkAccordion marks every heading inside any container (recognised or misspelled) so it renders without an anchor id and the duplicate-id counters in the two passes stay aligned. A new container whose headings SHOULD appear in the table of contents needs both sides changed together: the skip in markdown-headings.ts and the marking in markdown-utils.ts.

## Components that need post data

The image and image list components need data the Markdown does not contain: the post's configured images. They get it by closure. The components object is built inside the Markdown function, which receives images and imageLists as arguments; a small wrapper passes them through:

~~~tsx
"image-list": (props: MarkdownElementProps) => (
  <PostImageList {...props} imageLists={imageLists} />
),
~~~

For post-level configuration: add a field to the Post type in content/types.ts, a validation rule for it, a parameter on Markdown, and a wrapper like the one above. That is the full path from content file to rendered element.

## What not to do

- **No raw HTML support.** The renderer does not enable it; enabling it lets content inject arbitrary markup. A new component is the supported way to add a new shape.

- **No MDX.** MDX lets a post import and run components directly. That collapses the boundary the content layer depends on; content stops being plain data. See [The content contract](/blog-platform-docs/content-contract).

- **No skipping the argument check.** Every existing plugin validates its argument before putting it in an attribute. A YouTube ID goes straight into a URL; unvalidated, it is a hole.

- **No client components unless needed.** The renderer runs on the server. A callout, a table, an embed frame: all fine as server components. Reach for "use client" only for state or an event handler, and read [How pages are rendered](/blog-platform-docs/rendering-model) first.

## Checklist

0. Decide the shape: a leaf embed is a shortcode (five steps above); a component with a Markdown body is a directive (extend remarkAccordion's pattern).
1. Write the plugin in markdown-utils.ts: strict guard, validated argument.
2. Hyphenated hName, all-lowercase property names.
3. Add the plugin to the remarkPlugins array in markdown.tsx.
4. Add the property to MarkdownElementProps.
5. Add the component to the components object and to the type after satisfies.
6. Decide how a missing or malformed argument behaves, in development and in production.
7. Document the syntax in [Markdown reference](/blog-platform-docs/markdown-reference), with a live example so the reference stays executable.
8. Run typecheck, lint, and build.
`
