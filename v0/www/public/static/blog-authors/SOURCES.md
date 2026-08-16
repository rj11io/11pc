# Author photograph sources

The 11ai icon entry preserves inherited 11blog and 11brands provenance. That generation tooling is not bundled with 11pc.

Files here are addressed root-relative as /static/blog-authors/<file> from
content/authors.ts. Nothing validates these paths: after changing one, open an
author page and check the image loaded.

## 11ai-icon-v2.png

The 11ai author avatar, generated on 2026-08-11 in the main 11blog dark style
through 11brands v1 and copied here without modification. It is the brand's
512 favicon master.

- Brand: `11blog` (`v1/brands/11blog/config.json`)
- Generator: `v1/scripts/generate_integration.py`, source `11blog`
- Run: `v1/integrations/20260811-124226/11blog/favicons/`
- Source file: `icon-512.png`
- Dimensions: 512 × 512, RGBA

Do not resize, re-encode, or palette-convert it; a palette-mode PNG breaks
Next.js builds. The previous 11ai-icon.png it replaces was removed; git history
keeps it.

## rj-pic.png

Personal photograph of Ricardo Jorge, provided by the operator. Not generated.
