# Blog Platform OG and cover set

**Superseded.** This directory records the v0 pipeline only. The live cover set
is now v4, generated in the separate 11brands repository (v1) via
`generate_integration.py`. The `-v1.png` and `-v2.png` files here are kept as
history; nothing uses them.

Every `-v2.png` file here comes from og-covers-v5.py and was what the site
imported before the move to 11brands. The `-v1.png` files record what came
before that.

Version 1 contained one publication image and one image for each of the twelve
posts registered in content/publications/blog-platform-docs/index.ts at the
time, plus two added later: the entry point from og-covers-v2.py, and the
support post from og-covers-v3.py. Version 2 redrew all fifteen at once, because
a design change that reached only some cards would be worse than not making it.

Every asset is 1200 × 630. The banner at the top of a page uses that same 40:21
ratio and shows a card whole. Smaller surfaces crop it: the 16:9 card in a list
takes a slice off the top and bottom, the square thumbnail beside a row takes a
harder one off both sides. Titles stay in a central safe area. The masthead and
the keyword footer are full-width-only; the square crops both away.

Visual system, per the approved line-free OG direction:

- `#0A0A0A` background
- centered extra-large-dot `11` mark
- muted, letter-spaced `blog.rj11.io` masthead above the mark (v2)
- `#2BC88F` square each side of the title (v2; v1 had one, on the left)
- white mono title
- muted `AI / SOFTWARE / PRODUCT / ENGINEERING / TECHNOLOGY` footer
- no borders, grid lines, gradients, rounded corners, or placeholder imagery

The masthead sits 48 pixels below the top edge, the keyword footer 49 above the
bottom, so the two read as a matched pair framing the card. That is why the
domain is centred up there rather than tucked in a corner, the other candidate,
which fought the centred composition.

Each entry below is the `-v2` file. The matching `-v1` file sits beside it in
the same directory.

## Publication

- `publication-blog-platform-og-cover-v2.png`: Blog Platform Docs

## Posts

- `posts/401-markdown-reference-og-cover-v2.png`: Markdown reference
- `posts/402-adding-content-og-cover-v2.png`: Adding a publication or post
- `posts/403-content-validation-og-cover-v2.png`: Content validation rules
- `posts/404-content-contract-og-cover-v2.png`: The content contract
- `posts/405-rendering-model-og-cover-v2.png`: How pages are rendered
- `posts/406-extending-the-renderer-og-cover-v2.png`: Extending the renderer
- `posts/407-design-tokens-og-cover-v2.png`: Design tokens and theming
- `posts/408-accessibility-contract-og-cover-v2.png`: Accessibility contract
- `posts/409-urls-and-redirects-og-cover-v2.png`: URLs, slugs, and redirects
- `posts/410-running-the-blog-og-cover-v2.png`: Running and releasing the blog
- `posts/411-search-and-discovery-og-cover-v2.png`: Search, tags, and discovery
- `posts/412-authors-and-bylines-og-cover-v2.png`: Authors and bylines
- `posts/413-start-here-og-cover-v2.png`: A tour of the platform
- `posts/414-supporting-the-platform-og-cover-v2.png`: Supporting the platform

Mismatch between artwork and registry: the publication card reads "Blog
Platform", the publication is titled "Blog Platform Docs". The wording predates
that rename and was carried through the v2 redraw unchanged, because changing
what a card says is an editorial decision rather than a design one. Worth
deciding on.

## Process files

- `contact-sheet-v2.png` previews the whole v2 set, all fifteen cards.
- `contact-sheet-v1.png` previews the v1 set, minus the two covers added after
  it was made.
- `../../generators/og-covers-v5.py` regenerates the v2 set and holds the
  drawing code. `blog-platform-og-covers-v1.py` still regenerates v1, and v5
  borrows its mark, colours, and font so the two cannot drift apart.
- Create a new versioned generator and output names for future explorations; do
  not overwrite either set.
