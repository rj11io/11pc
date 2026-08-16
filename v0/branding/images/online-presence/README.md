# Build an online presence OG and cover set

One publication image and one image for each of the two posts in the Build an
online presence publication, registered in
`content/publications/online-presence/index.ts`.

**Superseded.** This directory records the v0 pipeline only. Cover and OG
generation has moved to the separate 11brands repository (v1), via
`generate_integration.py`. Every `-v2.png` file here comes from og-covers-v5.py
and was what the site imported before that move. The `-v1.png` files record what
came before that. Both are kept as history.

og-covers-v5.py draws both publications' cards, so this set is visually
identical to the Blog Platform Docs set: same mark, same crop, same title
fitting, same green squares, same masthead, same keyword footer.

Every asset is 1200 × 630 and doubles as its Open Graph image and its website
cover. The banner at the top of a page uses that same 40:21 ratio and shows a
card whole; the 16:9 card crop and the square thumbnail crop both take a slice
out of the middle, so the title sits in a central safe area. The masthead and
the keyword footer are full-width-only; the square crop loses both.

## Publication

- `publication-online-presence-og-cover-v2.png`: Build an online presence

## Posts

- `posts/501-own-your-platform-og-cover-v2.png`: Own your platform
- `posts/502-build-your-own-blog-og-cover-v2.png`: Build your own blog

## History of the 502 card

Drawn three times in one day. The filenames alone do not explain it:

1. `502-three-ways-to-build-a-blog-og-cover-v1.png`, from og-covers-v2.py.
2. `502-build-your-own-blog-og-cover-v1.png`, from og-covers-v4.py, when the
   post was renamed on 2026-08-02. The title is drawn into the picture, so a
   rename needs a new file.
3. `502-build-your-own-blog-og-cover-v2.png`, from og-covers-v5.py, in the
   design change later the same day.

The 502 prefix survives all three because it is the same post throughout.

The v2 and v4 manifests still name their own outputs and would write them back
if run again. Those files are unused, and leaving the old manifests alone keeps
each one an honest record of what it produced.

## Regenerating

Needs Pillow, which is not installed system-wide:

```bash
python3 -m venv .venv
.venv/bin/pip install Pillow
.venv/bin/python v0/branding/generators/og-covers-v5.py
```

That one command redraws both publications' v0 sets. Do not overwrite either
set for a new exploration. Add a new versioned generator and new output names,
as each version here did before it.
