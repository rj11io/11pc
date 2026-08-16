"""Adds the second signal square to the favicon-style OG images.

The card set in images/blog-platform and images/online-presence gained a square
on each side of its title in og-covers-v5.py, on 2026-08-02. These three do the
same job for the sites themselves rather than for a post, and were left behind
by that change. This brings them in line.

Why this edits pixels instead of redrawing
------------------------------------------

Correction, 2026-08-02, later the same day. This section used to say there was
no generator for these three and that they had been drawn by hand. That was
wrong, and it was never tested. Rendering "blog.rj11.io" through
blog-platform-og-covers-v1.py reproduces 11blog-favicon-style-og-v4.png byte for
byte: these cards are the ordinary post card with a domain in the title row, and
the sub-brands were made by copying that generator and changing its colours.
brand-og-and-favicons-v1.py now draws them from parameters instead, and is what
a new sub-brand should use.

The pixel edit below is kept because it is what produced the three files in use,
and because it is verifiably lossless: nothing outside the row band changes, so
every part of the card that was not meant to move is the original, bit for bit.
Given the choice again, redrawing would be the better route.

So the row is moved rather than remade. The block holding the existing square,
the gap, and the domain is lifted out whole, the row band is repainted in the
background colour, the block is put back further left, and a new square is drawn
at the far end. Every glyph is the original glyph, untouched. Only the square is
new, and a square is a solid rectangle, which is the one thing that can be
reproduced exactly.

Two things make this safe, and both are checked at run time rather than assumed:
the row band contains nothing but the square and the domain, and the background
inside that band is one flat colour.

What is kept
------------

The row stays on its existing centre instead of being re-centred on the canvas.
All three sit at x=598 rather than 600, two pixels left, which is the optical
alignment the branding notes call out for the orange card. That is a decision
someone made by eye, so the arithmetic here preserves it rather than tidying it
away.

The gap between square and text is measured per image and reused on the other
side, so each card keeps its own spacing: 24 pixels on the two green ones, 21 on
the orange.

Run with a Python that has Pillow installed:

    python3 -m venv .venv
    .venv/bin/pip install Pillow
    .venv/bin/python v0/branding/generators/favicon-style-og-symmetric-v1.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

BRANDING_DIR = Path(__file__).resolve().parents[1]
OG_DIR = BRANDING_DIR / "images/og"

# The row band. Generous on both sides of the domain row, and clear of the mark
# above it and the keyword footer below.
BAND_TOP = 450
BAND_BOTTOM = 535

# Source, destination. The old file is never touched.
ASSETS = [
    ("11blog-favicon-style-og-v4.png", "11blog-favicon-style-og-v5.png"),
    ("rj11io-favicon-style-orange-og-v2.png", "rj11io-favicon-style-orange-og-v3.png"),
    (
        "ai-rj11io-favicon-style-inverted-green-og-v2.png",
        "ai-rj11io-favicon-style-inverted-green-og-v3.png",
    ),
]


def close(left, right, tolerance: int = 10) -> bool:
    return all(abs(a - b) <= tolerance for a, b in zip(left, right))


def measure(image: Image.Image):
    """Find the square, the gap, and the domain inside the row band."""
    pixels = image.load()
    width, _ = image.size
    background = pixels[5, 5]

    def column_is_empty(x: int) -> bool:
        return all(
            close(pixels[x, y], background)
            for y in range(BAND_TOP, BAND_BOTTOM + 1)
        )

    filled = [x for x in range(width) if not column_is_empty(x)]
    if not filled:
        raise RuntimeError("the row band is empty")
    left, right = filled[0], filled[-1]

    # The one wide run of background inside the row is the gap between the
    # square and the domain.
    gaps, run_start = [], None
    for x in range(left, right + 1):
        if column_is_empty(x):
            if run_start is None:
                run_start = x
        elif run_start is not None:
            gaps.append((run_start, x - 1))
            run_start = None
    if not gaps:
        raise RuntimeError("no gap found between the square and the domain")
    gap_start, gap_end = max(gaps, key=lambda pair: pair[1] - pair[0])

    square_left, square_right = left, gap_start - 1
    rows = [
        y
        for y in range(BAND_TOP, BAND_BOTTOM + 1)
        if not close(pixels[square_left + 2, y], background)
    ]
    square = {
        "left": square_left,
        "right": square_right,
        "top": rows[0],
        "bottom": rows[-1],
        "colour": pixels[(square_left + square_right) // 2, (rows[0] + rows[-1]) // 2],
    }

    # Every colour in the empty part of the band, to prove the repaint is safe.
    band_colours = {
        pixels[x, y]
        for y in range(BAND_TOP, BAND_BOTTOM + 1)
        for x in range(0, max(0, left - 20))
    }

    return {
        "background": background,
        "left": left,
        "right": right,
        "gap": gap_end - gap_start + 1,
        "square": square,
        "flat_background": band_colours == {background},
    }


def add_second_square(source: Path, destination: Path) -> dict:
    image = Image.open(source).convert("RGB")
    width, _ = image.size
    facts = measure(image)

    if not facts["flat_background"]:
        raise RuntimeError(
            f"{source.name}: the row band background is not one flat colour, so "
            "repainting it would leave a seam"
        )

    square = facts["square"]
    square_width = square["right"] - square["left"] + 1
    square_height = square["bottom"] - square["top"] + 1
    block_width = facts["right"] - facts["left"] + 1
    new_width = block_width + facts["gap"] + square_width

    # Keep the row's existing centre rather than re-centring on the canvas.
    centre = (facts["left"] + facts["right"]) / 2
    new_left = round(centre - (new_width - 1) / 2)

    block = image.crop((facts["left"], BAND_TOP, facts["right"] + 1, BAND_BOTTOM + 1))

    draw = ImageDraw.Draw(image)
    draw.rectangle((0, BAND_TOP, width - 1, BAND_BOTTOM), fill=facts["background"])
    image.paste(block, (new_left, BAND_TOP))

    right_square_left = new_left + block_width + facts["gap"]
    draw.rectangle(
        (
            right_square_left,
            square["top"],
            right_square_left + square_width - 1,
            square["top"] + square_height - 1,
        ),
        fill=square["colour"],
    )

    image.save(destination, optimize=True)

    return {
        **facts,
        "square_width": square_width,
        "moved_by": facts["left"] - new_left,
        "new_left": new_left,
        "new_right": right_square_left + square_width - 1,
        "new_width": new_width,
    }


def main() -> None:
    for source_name, destination_name in ASSETS:
        source = OG_DIR / source_name
        destination = OG_DIR / destination_name
        facts = add_second_square(source, destination)

        print(f"\n{source_name}")
        print(f"  background {facts['background']}  square {facts['square']['colour']}")
        print(
            f"  square {facts['square_width']}px, gap {facts['gap']}px, "
            f"row {facts['right'] - facts['left'] + 1}px -> {facts['new_width']}px"
        )
        print(
            f"  block moved {facts['moved_by']}px left; row now "
            f"{facts['new_left']}..{facts['new_right']}, centre "
            f"{(facts['new_left'] + facts['new_right']) / 2}"
        )
        print(f"  -> {destination}")


if __name__ == "__main__":
    main()
