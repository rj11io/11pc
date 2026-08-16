"""Swaps the signal colour in an existing asset, changing nothing else.

Built for ai.rj11.io on 2026-08-02. Its green measured 2.06:1 against its light
ground, under the 3:1 a non-text graphic needs, which the sub-brand hue table in
images/README.md had just made visible. This produces the same cards with a
green that passes.

Why not just redraw them
------------------------

brand-og-and-favicons-v1.py can draw a card like this from parameters, and that
is the right tool for a new brand. It is the wrong tool here. Rebuilding the
existing ai card from parameters and diffing it against the real one shows
15,428 pixels of difference: the mark's anti-aliased edges resolve differently,
and the domain row sits about seven pixels across, because the row in the live
file was positioned by the earlier symmetric-square pass rather than computed.
Neither is wrong, but both would ride along with a change that is supposed to be
about one colour.

So the colour is replaced in place, and the result differs from its source in
exactly the pixels that carried the old colour.

How the swap works
------------------

A pixel showing the signal is some amount of it over something else: the light
ground in most places, the dark glyph where the square meets the numeral. The
amount is recoverable without knowing what is underneath, because the ground and
the glyph are both neutral greys and the signal is the only chromatic thing on
the card.

Split a colour into its grey part and its colourful part. A neutral pixel has no
colourful part. A pixel that is a fraction of the signal over any neutral base
has exactly that fraction of the signal's colourful part. So:

    amount = how much of the signal's colour vector this pixel carries
    new pixel = old pixel + amount x (new signal - old signal)

which leaves neutral pixels untouched, turns full-strength signal into exactly
the new colour, and moves every blend in between by the right proportion. It
needs no mask, no threshold on which pixels are "the square", and it does not
care what the signal sits on top of.

Run with a Python that has Pillow installed:

    python3 -m venv .venv
    .venv/bin/pip install Pillow
    .venv/bin/python v0/branding/generators/recolour-signal-v1.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

BRANDING_DIR = Path(__file__).resolve().parents[1]
OG_DIR = BRANDING_DIR / "images/og"
FAVICON_DIR = BRANDING_DIR / "images/favicons"

ICO_SIZES = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]

# The house green as it appears on a dark ground. It was carried onto the light
# ai card unchanged, which is the bug.
OLD_GREEN = (43, 200, 143)

# The site's own light-mode --primary, oklch(0.508 0.118 165.612), which is
# #007A55. Not a colour invented for this: globals.css already defines it,
# because the same problem was already solved once for the interface. The dark
# cards use the dark-mode --primary and the light card should use the light-mode
# one. 5.14:1 against #FAFAFA, which clears the 3:1 a graphic needs and the
# 4.5:1 that text needs, so the colour stays usable if it is ever set in type.
NEW_GREEN = (0, 122, 85)


def chroma(colour):
    """The colourful part of a colour: what is left after its grey is removed."""
    grey = sum(colour) / 3
    return tuple(channel - grey for channel in colour)


def recolour(image: Image.Image, old, new) -> tuple[Image.Image, int]:
    source = image.convert("RGB")
    pixels = source.load()
    width, height = source.size

    old_chroma = chroma(old)
    scale = sum(component * component for component in old_chroma)
    if scale == 0:
        raise ValueError("the colour being replaced has no chroma to match on")

    delta = tuple(n - o for n, o in zip(new, old))
    result = Image.new("RGB", source.size)
    out = result.load()
    touched = 0

    for y in range(height):
        for x in range(width):
            pixel = pixels[x, y]
            pixel_chroma = chroma(pixel)
            amount = (
                sum(p * o for p, o in zip(pixel_chroma, old_chroma)) / scale
            )

            if amount <= 0.002:
                out[x, y] = pixel
                continue

            amount = min(1.0, amount)
            out[x, y] = tuple(
                max(0, min(255, round(channel + amount * d)))
                for channel, d in zip(pixel, delta)
            )
            if out[x, y] != pixel:
                touched += 1

    return result, touched


def rgba(image: Image.Image) -> Image.Image:
    """Written RGBA, never as a palette image.

    A palette icon is a smaller file and a broken build: Next.js decodes
    app/favicon.ico itself and rejects frames that are not RGBA, with "The PNG
    is not in RGBA format!". These outputs are not the app's icon today, but
    they are the same kind of object, and one of them being unusable for that
    reason is a trap worth not setting.
    """
    return image.convert("RGBA")


def main() -> None:
    """The card only. Favicons are not this script's job.

    They were, briefly. Recolouring the old icons carried their existing flaws
    across: colours outside the brand's own three, from the resampling that made
    them. brand-og-and-favicons-v1.py builds icons from coverage masks instead,
    so it can draw the ai package clean rather than inheriting that, and it owns
    them now. The card stays here, because a card cannot be redrawn faithfully
    and an icon can.
    """
    source = OG_DIR / "ai-rj11io-favicon-style-inverted-green-og-v3.png"
    destination = OG_DIR / "ai-rj11io-favicon-style-inverted-green-og-v4.png"
    card, touched = recolour(Image.open(source), OLD_GREEN, NEW_GREEN)
    card.save(destination, optimize=True)
    print(f"{destination.name}: {touched} pixels changed")


if __name__ == "__main__":
    main()
