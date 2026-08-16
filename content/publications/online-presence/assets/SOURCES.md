# Build an online presence cover and Open Graph images

Generated brand assets, not photographs.

The active v3 set was generated on 2026-08-11 in the main 11blog dark style
through 11brands v1, then copied here without modification.

- Brand: `11blog` (`v1/brands/11blog/config.json`)
- Generator: `v1/scripts/generate_integration.py`, source `11blog`
- Run: `v1/integrations/20260811-205304/11blog/og-content/`
- Dimensions: every file 1200 × 630

| Consumer file | Source file | Title drawn |
| --- | --- | --- |
| `online-presence-og-cover-v3.png` | `build-an-online-presence-og-content.png` | Build an online presence |
| `build-your-own-blog-og-cover-v3.png` | `build-your-own-blog-og-content.png` | Build your own blog |
| `own-your-platform-og-cover-v3.png` | `own-your-platform-og-content.png` | Own your platform |

All three titles are drawn verbatim, at 24, 19, and 17 characters against a
37-character budget.

v3 moves this publication onto the current pipeline. The v2 set was the last
thing in the repository still coming from `v0/branding/generators/og-covers-v5.py`,
a local script that no longer runs: nothing in this repository has a Python
environment for it. The design is unchanged, because 11brands v1 inherited it.

Each file does two jobs. It is the cover shown on the site, and it is the Open
Graph image used in link previews, because a page takes its Open Graph image
from `coverImage`.

The banner at the top of a page uses the same 40:21 ratio, so a file is shown
there whole. The 16:9 card crop and the square thumbnail crop both take a slice
out of the middle, which is why the title sits in a central safe area.

## Replacing these

Every file is brought in with a static import, so renaming or removing one
breaks the build rather than producing a missing image. Add the new version
alongside and update the import.

**Leave the old file in place.** An earlier version of this note said to delete
it. That was wrong, and the generate skill is the authority: shared link
previews cache image URLs, so a superseded file still has to resolve for anyone
holding an old link.

## Renaming a post

The title is drawn into the picture, so a renamed post needs a new file or its
cover keeps announcing the old title in every link preview. Generate it, copy it
in under the new name, and update the import.

`build-your-own-blog-og-cover-v1.png` replaced
`three-ways-to-build-a-blog-og-cover-v1.png` on 2026-08-02 for exactly this
reason. Both are gone, deleted under the old rule before it was corrected.

## Superseded

The v2 set was drawn on 2026-08-02 by `v0/branding/generators/og-covers-v5.py`,
copied from `v0/branding/images/online-presence/`, alongside the Blog platform
docs set of the same day so the two publications stayed visually identical. That
redraw gave the title a green square on each side rather than only on the left,
and put the domain `blog.rj11.io` above the mark as a masthead.

`online-presence-og-cover-v2.png`, `own-your-platform-og-cover-v2.png`, and
`build-your-own-blog-og-cover-v2.png` all stay in place, unused.

The numeric post ID prefix used in that source set is dropped here, so these
filenames do not have to change if posts are renumbered.
