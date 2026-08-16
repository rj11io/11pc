"""One brand's Open Graph card and its complete favicon package.

Adds intel.rj11.io on 2026-08-02, the third sub-brand after www.rj11.io in
orange and ai.rj11.io in inverted green. Dark ground, red signal.

Why this generator exists
-------------------------

The sub-brand cards were previously made by copying the card generator and
editing its colour constants, which left no record of which colours produced
which file. This takes the brand as data instead: a name, a domain, and three
colours. Adding a fourth sub-brand is a new entry in BRANDS, not a new script.

It draws the same card the post covers use, at the same geometry, so a sub-brand
card and a post card are the same object with different text. That was verified
rather than assumed: rendering "blog.rj11.io" through the v1 generator
reproduces 11blog-favicon-style-og-v4.png byte for byte.

The one difference from a post card is the row. A post card puts its title
between two squares and the domain above the mark as a masthead. A sub-brand
card is *about* the domain, so the domain takes the title row and there is no
masthead; repeating it would be the only thing on the card said twice.

Recolouring the mark
--------------------

The mark master is white on near-black with a green square. Three colours have
to change at once, so each pixel is sorted into glyph or square by hue rather
than by position: the square is the only part of the artwork where green leads,
at any opacity, including its anti-aliased edge. Coverage is read from the
channel that carries the colour, which keeps the edges smooth instead of
stair-stepping them.

Run with a Python that has Pillow installed:

    python3 -m venv .venv
    .venv/bin/pip install Pillow
    .venv/bin/python v0/branding/generators/brand-og-and-favicons-v1.py
"""

from __future__ import annotations

import importlib.util
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

BRANDING_DIR = Path(__file__).resolve().parents[1]
GENERATOR_V1 = Path(__file__).resolve().parent / "blog-platform-og-covers-v1.py"
MARK_PATH = BRANDING_DIR / "images/logos/11blog-mark-xl-dot-centered.png"
OG_DIR = BRANDING_DIR / "images/og"
FAVICON_DIR = BRANDING_DIR / "images/favicons"

# Card geometry, all from the v1 generator, with the second square added.
SQUARE = 18
GAP = 20
MAX_ROW = 1040
TITLE_TOP = 477
TITLE_MIDDLE = 486
KEYWORD_MIDDLE = 574
MARK_ORIGIN = (425, 42)
MARK_SIZE = 350
MARK_CROP = (247, 247, 1007, 1007)

# Favicon geometry, measured off the two existing packages so a new one lands in
# the same place: the artwork scaled to fit a 462 by 368 box inside 512, which
# leaves roughly 25 pixels either side and 72 above and below.
ICON_MASTER = 512
ICON_BOX = (462, 368)
ICON_SIZES = [512, 192, 180, 32, 16]
ICO_SIZES = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]


def load_v1():
    spec = importlib.util.spec_from_file_location("og_covers_v1", GENERATOR_V1)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"could not load {GENERATOR_V1}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


v1 = load_v1()


class Brand:
    def __init__(
        self,
        key,
        domain,
        og_filename,
        background,
        foreground,
        accent,
        footer,
        note,
        package="v1",
    ):
        self.key = key
        self.domain = domain
        # Which favicon package directory to write. Brands whose earlier package
        # is already published get the next number rather than an overwrite.
        self.package = package
        # Spelled out rather than built from the key and the hue. The existing
        # names are not quite systematic enough to derive, and a filename is a
        # thing people search for.
        self.og_filename = og_filename
        self.background = background
        self.foreground = foreground
        self.accent = accent
        # The keyword line. Its own field because it cannot simply be the muted
        # grey the dark cards use: #A1A1A1 on a light ground is 2.48:1, and this
        # is text, which needs 4.5:1.
        self.footer = footer
        self.note = note


BRANDS = [
    Brand(
        key="blog-rj11io",
        domain="blog.rj11.io",
        # Favicons only. The card for this one is
        # og/11blog-favicon-style-og-v5.png, which is live and correct.
        og_filename=None,
        background=(10, 10, 10),
        foreground=(250, 250, 250),
        accent=(43, 200, 143),
        footer=(161, 161, 161),
        note="The main blog. Its favicon is what v0/www/app/favicon.ico ships.",
    ),
    Brand(
        key="intel-rj11io",
        domain="intel.rj11.io",
        og_filename="intel-rj11io-favicon-style-red-og-v1.png",
        background=(10, 10, 10),
        foreground=(250, 250, 250),
        # A clear red rather than a deep one. The sibling sub-brand is orange at
        # #F97316, and at 16 pixels a dark crimson would read as brown beside
        # it; this stays separable at favicon size. Measures 5.26:1 against the
        # ground, comfortably past the 3:1 a non-text graphic needs.
        accent=(239, 68, 68),
        footer=(161, 161, 161),  # 7.66:1 on this ground
        note="Dark intel sub-brand OG with a red signal",
    ),
    Brand(
        key="cv-rj11io",
        domain="cv.rj11.io",
        og_filename="cv-rj11io-favicon-style-inverted-blue-og-v1.png",
        # Light, like ai.rj11.io: the same ground, glyph, and footer grey, so
        # the two inverted cards are one pair rather than two one-offs.
        background=(250, 250, 250),
        foreground=(10, 10, 10),
        # Blue 600, not the 500 that would match the orange and red on the dark
        # cards. On a light ground 500 measures 3.52:1, which clears the 3:1
        # minimum by so little that any later tweak to the ground breaks it.
        # 600 measures 4.95:1, which also happens to clear the stricter 4.5:1
        # text threshold, so the colour stays usable if it is ever set in type.
        #
        # This is the mistake the inverted green card already makes, at 2.06:1,
        # and the reason a light brand cannot simply reuse a dark brand's hue.
        accent=(37, 99, 235),
        footer=(103, 103, 103),  # 5.42:1 on this ground
        note="Light CV sub-brand OG with a blue signal",
    ),
    # The two brands that predate this generator. Favicons only: both cards are
    # live and correct, and redrawing a card from parameters does not reproduce
    # it. Their earlier packages were drawn by another tool and carry colours
    # outside their own three-colour triangle, which is what these replace.
    Brand(
        key="ai-rj11io",
        domain="ai.rj11.io",
        og_filename=None,
        package="v2",
        background=(250, 250, 250),
        foreground=(10, 10, 10),
        accent=(0, 122, 85),  # the darkened green, 5.14:1
        footer=(103, 103, 103),
        note="Light AI sub-brand, green signal",
    ),
    Brand(
        key="www-rj11io",
        domain="www.rj11.io",
        og_filename=None,
        package="v2",
        # Warm black and warm white, which is what makes this brand its own
        # rather than the blog's palette with a different accent.
        background=(12, 9, 7),
        foreground=(250, 248, 246),
        accent=(249, 115, 22),
        footer=(161, 161, 161),
        note="Warm-black main site, orange signal",
    ),
]


def build_masks():
    """The mark master split into two coverage maps: the numeral, and the square.

    Not a recoloured picture. Two greyscale masks saying how much of each part
    covers each pixel, which is what makes resizing safe further down. Pixels are
    sorted by hue, because green leading is the only thing that distinguishes the
    signal square from the numeral, at any opacity. The two never overlap: the
    square does not touch the numeral in the master, which was checked rather
    than assumed.
    """
    source = Image.open(MARK_PATH).convert("RGB")
    pixels = source.load()
    glyph = Image.new("L", source.size, 0)
    accent = Image.new("L", source.size, 0)
    glyph_out, accent_out = glyph.load(), accent.load()

    for y in range(source.height):
        for x in range(source.width):
            red, green, blue = pixels[x, y]
            brightest = max(red, green, blue)
            if brightest <= 12:
                continue

            if green > red + 18 and green > blue + 8:
                # Full strength square reads 200 on the green channel.
                accent_out[x, y] = min(255, round(green * 255 / 200))
            else:
                glyph_out[x, y] = min(255, round(brightest * 255 / 250))

    return glyph, accent


def compose(masks, box, size, brand, ground=None):
    """Paint the mark at a given size, on a solid ground, without overshoot.

    The masks are resized and the colours applied afterwards, never the other way
    round. Resizing a picture of the mark rings: Lanczos overshoots at every hard
    edge, so a downscale invents pixels darker than the ground, brighter than the
    numeral, and more saturated than the signal. Small sizes suffer worst, which
    is why the old 16 pixel icon carried a #2FE0A1 square the brand never had.

    Resizing coverage instead cannot do that. Each output pixel is a blend of
    three exact brand colours, so every value it can take lies between them.
    Ringing in a mask is clamped back to nothing-or-everything before it is used,
    which costs a shade of edge softness and buys a picture that stays in gamut.
    """
    glyph, accent = (mask.crop(box).resize(size, Image.Resampling.LANCZOS)
                     for mask in masks)
    glyph_px, accent_px = glyph.load(), accent.load()

    ground = ground or brand.background
    tile = Image.new("RGB", size, ground)
    out = tile.load()

    for y in range(size[1]):
        for x in range(size[0]):
            g = glyph_px[x, y] / 255
            a = accent_px[x, y] / 255
            if g == 0 and a == 0:
                continue

            # Clamp the pair back onto the simplex. Ringing can push the two a
            # little past full coverage between them; without this the surplus
            # would be paid for by the ground going negative.
            total = g + a
            if total > 1:
                g, a = g / total, a / total

            out[x, y] = tuple(
                round(
                    ground[channel] * (1 - g - a)
                    + brand.foreground[channel] * g
                    + brand.accent[channel] * a
                )
                for channel in range(3)
            )

    return tile


def font(size):
    return ImageFont.truetype(v1.SANS_MONO, size)


def text_width(draw, value, size):
    box = draw.textbbox((0, 0), value, font=font(size))
    return box[2] - box[0]


def render_og(brand: Brand, masks, destination: Path) -> None:
    image = Image.new("RGB", (v1.WIDTH, v1.HEIGHT), brand.background)
    draw = ImageDraw.Draw(image)
    # Composed on the card's own ground and pasted opaquely, which is exact
    # because they are the same colour.
    image.paste(
        compose(masks, MARK_CROP, (MARK_SIZE, MARK_SIZE), brand), MARK_ORIGIN
    )

    fixed = SQUARE + GAP + GAP + SQUARE
    for size in range(42, 27, -1):
        width = text_width(draw, brand.domain, size)
        if fixed + width <= MAX_ROW:
            break

    row_start = round(v1.WIDTH / 2 - (fixed + width) / 2)
    draw.rectangle(
        (row_start, TITLE_TOP, row_start + SQUARE - 1, TITLE_TOP + SQUARE - 1),
        fill=brand.accent,
    )
    text_left = row_start + SQUARE + GAP
    draw.text(
        (text_left, TITLE_MIDDLE),
        brand.domain,
        font=font(size),
        fill=brand.foreground,
        anchor="lm",
    )
    right = text_left + width + GAP
    draw.rectangle(
        (right, TITLE_TOP, right + SQUARE - 1, TITLE_TOP + SQUARE - 1),
        fill=brand.accent,
    )

    draw.text(
        (v1.WIDTH / 2, KEYWORD_MIDDLE),
        v1.KEYWORDS,
        font=font(15),
        fill=brand.footer,
        anchor="mm",
    )

    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, optimize=True)


def render_favicons(brand: Brand, masks, directory: Path) -> list[Path]:
    """Every size composed from the masks at that size, not resampled from 512.

    A 16 pixel icon made by shrinking a finished 512 pixel picture inherits every
    artefact of that shrink and adds its own. Composing each size from the
    coverage masks means one resize instead of two, and the colours are applied
    after it, so no size can drift out of gamut.
    """
    box = union_box(masks)
    artwork_width, artwork_height = box[2] - box[0], box[3] - box[1]

    directory.mkdir(parents=True, exist_ok=True)
    names = {
        512: "icon-512.png",
        192: "icon-192.png",
        180: "apple-touch-icon.png",
        32: "favicon-32x32.png",
        16: "favicon-16x16.png",
    }

    written = []
    for size in ICON_SIZES:
        icon = icon_at(masks, box, artwork_width, artwork_height, size, brand)
        icon.convert("RGBA").save(directory / names[size], optimize=True)
        written.append(directory / names[size])

    # Every frame inside the .ico is composed at its own size and handed over
    # ready-made. Pillow only uses a supplied frame when it matches a requested
    # size exactly; for anything it does not find it falls back to thumbnail(),
    # which resamples the largest frame and puts the overshoot straight back. An
    # earlier version of this let it do that, and the 32 pixel frame came out
    # carrying pure black and pure white, neither of which is a brand colour.
    ico = directory / "favicon.ico"
    frames = [
        icon_at(masks, box, artwork_width, artwork_height, w, brand).convert("RGBA")
        for w, _ in sorted(ICO_SIZES, reverse=True)
    ]
    frames[0].save(ico, format="ICO", sizes=ICO_SIZES, append_images=frames[1:])
    written.append(ico)
    return written


def union_box(masks):
    """The artwork's bounds: whatever either mask covers."""
    boxes = [mask.getbbox() for mask in masks]
    return (
        min(b[0] for b in boxes),
        min(b[1] for b in boxes),
        max(b[2] for b in boxes),
        max(b[3] for b in boxes),
    )


def icon_at(masks, box, artwork_width, artwork_height, size, brand):
    """One square icon, artwork scaled to fit the shared margin and centred."""
    scale = min(
        ICON_BOX[0] / artwork_width, ICON_BOX[1] / artwork_height
    ) * (size / ICON_MASTER)
    target = (
        max(1, round(artwork_width * scale)),
        max(1, round(artwork_height * scale)),
    )

    icon = Image.new("RGB", (size, size), brand.background)
    icon.paste(
        compose(masks, box, target, brand),
        ((size - target[0]) // 2, (size - target[1]) // 2),
    )
    return icon


"""Everything is written RGBA, and that is not a style choice.

An earlier version of this file saved these as 256 colour palette images, which
is a valid PNG and about a third smaller. It also breaks the build. Next.js
decodes app/favicon.ico itself and refuses anything whose embedded frames are
not RGBA:

    Format error decoding Ico: The PNG is not in RGBA format!

The .ico has to be RGBA because a real consumer requires it. The PNGs are RGBA
too, for consistency, and because any of them could be dropped into app/ later
and meet the same decoder. The alpha channel is a constant 255 across an opaque
icon, so it compresses to almost nothing and the size difference is small.
"""


def main() -> None:
    masks = build_masks()

    for brand in BRANDS:
        # A brand with no og_filename gets favicons only. The main blog's card
        # already exists and is live, and redrawing it here would produce a
        # near-identical file for no reason.
        if brand.og_filename:
            og = OG_DIR / brand.og_filename
            render_og(brand, masks, og)
            print(og)

        directory = FAVICON_DIR / f"{brand.key}-{brand.package}"
        for path in render_favicons(brand, masks, directory):
            print(path)


if __name__ == "__main__":
    main()
