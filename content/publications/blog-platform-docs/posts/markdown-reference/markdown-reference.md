# Markdown reference

## Prose and inline formatting

This paragraph demonstrates **bold text**, _italic text_, ~~strikethrough text~~, `inline code`, an [internal blog link](/browse/posts), and an [external reference](https://example.com).

### Lists and tasks

- First unordered item
- Second unordered item with nested detail:
  - Nested unordered item
  - Another nested item

1. First ordered item
2. Second ordered item
   1. Nested ordered item
   2. Another nested ordered item

- [x] Publish renderer contract
- [ ] Add more field examples

### Quotes, rules, and images

> Good Markdown rendering keeps authoring simple while preserving a polished reading surface.

---

#### Post-owned local image

Configured by the post module. Local thumbnail plus a larger local lightbox source.

@[image](workspace-overview)

#### Remote URL image

Standard Markdown image, loaded from an external HTTPS URL. Same lightbox behavior.

![An open book resting on a wooden surface](https://picsum.photos/id/24/2000/743.webp "Remote image from Lorem Picsum")

### Tables

| Component | Status | Notes |
| --- | --- | --- |
| Tables | Supported | Via remark-gfm |
| Task lists | Supported | Read-only checkboxes |
| Autolinks | Supported | https://example.com/docs |

Wide tables scroll horizontally inside their own frame on narrow screens. The page never stretches.

### Code blocks

#### Inline `code` heading

Verifies renderer and TOC IDs stay aligned when heading text contains inline code.

```tsx
type Post = {
  title: string
  authorIds: string[]
}

export function PostTitle({ title }: Pick<Post, "title">) {
  return <h1>{title}</h1>
}
```

~~~bash
npm run typecheck
npm run lint
~~~

Label every fence. Header labels come from a map in code-block.tsx.

- No language tag: plain block. No highlighting, no header bar, no copy button.
- Language missing from the map: raw identifier shown in the header.
- Language unknown to the highlighter: plain text fallback, no failure.

### YouTube embeds

@[youtube](dQw4w9WgXcQ)

The shortcode takes the eleven-character video ID. A paragraph that is only a YouTube address (a watch, embed, or youtu.be URL on its own line) also embeds the player, intended or not. Want a plain link? Put the address inside a sentence or write it as a Markdown link.

## Accordions

Collapses a block of content behind a summary line. The one container component: everything between the fences is ordinary Markdown, rendered by the same components as the rest of the post. Lists, code blocks, images, and embeds all work inside.

Directive syntax, not a shortcode: a shortcode is one line, an accordion has a body.

~~~text
:::accordion[The summary line readers click]
Any Markdown, including other components.
:::
~~~

Live, with a configured image inside:

:::accordion[A configured image, inside an accordion]
The body holds ordinary Markdown. **Bold**, `inline code`, and links render as
they do anywhere else, and so do the component shortcodes:

@[image](workspace-overview)
:::

Add `{open}` after the label to start it expanded:

~~~text
:::accordion[Starts expanded]{open}
Useful when the collapse is an invitation to skim, not a wall.
:::
~~~

:::accordion[Starts expanded]{open}
Useful when the collapse is an invitation to skim, not a wall.
:::

Three rules:

- Title required. Use the `[label]` form, or `{title="..."}` as an attribute. The label wins when both are present.
- Nesting: the **outer** block takes four colons, the inner keeps three.
- Headings inside an accordion render but get no anchor id and stay out of the table of contents (a copied link would point into collapsed content). Keep section headings outside.

Open and close is the browser's own details element: no JavaScript, works with the keyboard, find-in-page reaches into a closed accordion in most browsers.

### Colons at the start of a word

Accordion syntax makes the parser treat **any** word starting with one or two colons as a directive, anywhere in prose. The renderer puts the text back, so `:root` or `::before` in a sentence survives. An attribute block in curly braces, or a bracketed label attached to one, does not round-trip exactly. Colon-prefixed word rendering strangely? Wrap it in inline code: that bypasses the directive parser entirely.

### When something is wrong

Component syntax mistakes are loud in development, quiet in production.

- Dev server: a missing image or list key, an accordion with no title, and a misspelled container name all show a red warning box.
- Published site: the image and list render nothing; the accordion and unknown container render their body without the wrapper.

Check the dev server or a build before publishing. The live page will not tell you.

## Multi-image lists

One browsable unit for a related collection. These demos mix optimized local WebP assets with one remote image. Select any image to open the shared fullscreen viewer: carousel, zoom, and pan cover the whole group.

Title-inside and title-below variants pull each image's title and subtitle fields from the post's images configuration. No title, nothing shown. Fill both fields when using a titled variant.

### Quilted image list

Quilted: dense arrangement of varied tile sizes creates hierarchy.

#### Image only

@[image-list](quilted:image-only)

#### Title inside

@[image-list](quilted:title-inside)

#### Title below

@[image-list](quilted:title-below)

### Masonry image list

Masonry: each image keeps its natural aspect ratio in balanced columns.

#### Image only

@[image-list](masonry:image-only)

#### Title inside

@[image-list](masonry:title-inside)

#### Title below

@[image-list](masonry:title-below)

## Links and line breaks

- [This hash link](#heading-depth) jumps within the post.
- Internal paths like [the browse page](/browse/posts) stay in the app router.
- External links like [the project reference](https://example.com) open in a new tab.
- The new-tab rule covers http and https only. Mailto links and the email autolinks below open in the same tab.

This line ends with two spaces  
so the next line becomes an explicit hard break.

## GFM extensions

Autolink literals: www.example.com, https://example.com, and contact@example.com work without link syntax.

Footnotes are supported with a reference[^gfm-note].

[^gfm-note]: Footnotes are parsed by remark-gfm and rendered with backlinks. The generated Footnotes heading at the foot of the post is styled like any other heading but does not appear in the table of contents.

### Heading depth

#### H4 detail heading

Verifies fourth-level headings appear in the table of contents.

##### H5 detail heading

Verifies fifth-level headings render with stable IDs.

###### H6 fallback heading

H6 parses but stays out of the table of contents: the blog's custom heading treatment covers H2 through H5 only. An H6, or an H1 anywhere past the first line, renders with browser default styling and no anchor id. Stay inside H2 through H5 for sections. The single leading H1 is different: every post starts with one matching its title, and the page strips it and renders the title itself.
