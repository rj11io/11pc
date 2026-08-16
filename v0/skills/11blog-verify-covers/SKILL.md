---
name: 11blog-verify-covers
description: Verify imported 11blog cover and Open Graph images against their 11brands v1 source run - byte-identical, 1200 by 630, wired into a record, and recorded in SOURCES.md. Use after generating or importing covers, or when auditing existing covers against their recorded source.
---

# Verify 11blog covers

Checks that every imported cover is exactly what 11brands generated and that
the blog actually uses and records it. Verify the whole set a generation run
produced, not one file at a time.

## Configure

Read ELEVENBRANDS_DIR from the repository-root .env.brand-assets.local file.
Stop if it is missing. The source of truth for each cover is the run stamp and
source file recorded in the nearest SOURCES.md.

## Checks, per consumer file

1. **Byte-identical to source.** Compare against the file in
   $ELEVENBRANDS_DIR/v1/integrations/<stamp>/<key>/og-content/:

~~~bash
cmp "$ELEVENBRANDS_DIR/v1/integrations/<stamp>/<key>/og-content/<source>.png" \
  content/publications/<pubId>/assets/<consumer>.png
~~~

   Any difference means the consumer file was modified after copying, which is
   forbidden: re-copy from the run, never fix the copy in place.

2. **Dimensions are 1200 by 630:**

~~~bash
.venv/bin/python - <<'EOF'
from PIL import Image
print(Image.open("<consumer>.png").size)
EOF
~~~

   Run it with the 11brands venv at $ELEVENBRANDS_DIR/v1/scripts/.venv, which
   is the one guaranteed to have Pillow. sips -g pixelWidth -g pixelHeight
   works too.

3. **Wired.** The file is statically imported where its post or publication
   record is defined, and coverImage points at its .src. An asset no record
   imports is dead weight; either wire it or remove it.

4. **Recorded.** The nearest SOURCES.md names the brand key, run stamp, source
   file, consumer file, and the title drawn. A cover whose origin is not written
   down cannot be verified next time.

5. **Title is inside budget and matches the file.** The recorded title must be
   37 characters or fewer, and slugifying it must give the source filename minus
   its -og-content suffix. Checks 1 and 2 cannot catch an overflowing title: the
   card is still byte-identical and still 1200 by 630, it just has text running
   off both edges. This check is the only one that can.

   A mismatch between the slug and the source filename means the record and the
   image disagree about what was drawn. Trust the image, fix the record.

6. **Palette and composition** are 11brands' responsibility, guaranteed by
   check 1: a byte-identical copy of a generated file cannot have drifted. Do
   not re-measure colours here; if a source image itself looks wrong, report it
   to the 11brands operator instead of touching it.

## Report

List every file checked with pass or fail per check, quote the run stamp, and
state plainly anything skipped or unverifiable.
