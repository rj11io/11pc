"""Version 5 of the 11blog OG and cover set: the whole set, redrawn.

Two changes to the card, decided on 2026-08-02:

1. A second signal square on the right of the title. The single square read as a
   bullet pointing at the title; the pair reads as a frame around it, and it
   centres the row against the mark and the footer, which were already centred.

2. The domain, blog.rj11.io, as a masthead above the mark. Social networks show
   the source host beside a card already, so this is for everywhere they do not:
   a screenshot, an embed that renders the image alone, the image reused on its
   own.

Unlike v2, v3, and v4, this version cannot borrow v1's render_card, because the
drawing itself is what changed. Everything else still comes from v1 — the mark,
the colours, the font, the geometry of the title row — so a v5 card is a v1 card
plus those two additions and nothing else. Only the drawing lives here; if you
are adding an asset rather than changing the design, add a manifest-only version
on top of this one the way v2 did on top of v1.

Every output name ends -v2, so no earlier file is overwritten. The whole set is
redrawn because a design change that reached only some cards would be worse than
not making it.

Run with a Python that has Pillow installed:

    python3 -m venv .venv
    .venv/bin/pip install Pillow
    .venv/bin/python v0/branding/generators/og-covers-v5.py
"""

from __future__ import annotations

import importlib.util
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

BRANDING_DIR = Path(__file__).resolve().parents[1]
GENERATOR_V1 = Path(__file__).resolve().parent / "blog-platform-og-covers-v1.py"

DOCS_DIR = BRANDING_DIR / "images/blog-platform"
DOCS_POSTS_DIR = DOCS_DIR / "posts"
PRESENCE_DIR = BRANDING_DIR / "images/online-presence"
PRESENCE_POSTS_DIR = PRESENCE_DIR / "posts"

DOMAIN = "blog.rj11.io"

# Title row geometry, unchanged from v1: an 18 pixel square, a 20 pixel gap,
# then the title. v5 repeats the gap and the square on the far side, so the row
# is 38 pixels wider than it was and the widest allowed row stays 1040. No title
# in the set is close to that limit; the longest builds a row of 856.
SQUARE = 18
GAP = 20
MAX_ROW = 1040
TITLE_TOP = 477
TITLE_MIDDLE = 486

# The masthead mirrors the keyword footer rather than hugging the top edge: the
# footer sits 49 pixels off the bottom, so this sits 48 off the top. The two
# read as a matched pair framing the card, which is the point of putting it up
# there instead of in a corner.
MASTHEAD_MIDDLE = 56
MASTHEAD_SIZE = 15
MASTHEAD_TRACKING = 4


def load_v1():
    """Load the v1 generator by path, since its filename is not importable."""
    spec = importlib.util.spec_from_file_location("og_covers_v1", GENERATOR_V1)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"could not load {GENERATOR_V1}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


v1 = load_v1()


def font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(v1.SANS_MONO, size)


def text_width(draw: ImageDraw.ImageDraw, value: str, size: int) -> int:
    box = draw.textbbox((0, 0), value, font=font(size))
    return box[2] - box[0]


def draw_tracked(
    draw: ImageDraw.ImageDraw,
    value: str,
    centre_x: float,
    middle_y: int,
    size: int,
    fill: tuple[int, int, int],
    tracking: int,
) -> None:
    """Draw one glyph at a time so the text can carry extra letter spacing.

    Pillow has no tracking of its own. The domain needs it: unspaced, twelve
    characters at this size look dropped into the space rather than placed in
    it, and the site's own labels are letter spaced, so this matches them.
    """
    glyphs = [(character, text_width(draw, character, size)) for character in value]
    total = sum(width for _, width in glyphs) + tracking * (len(glyphs) - 1)
    x = centre_x - total / 2

    for character, width in glyphs:
        draw.text((x, middle_y), character, font=font(size), fill=fill, anchor="lm")
        x += width + tracking


def fit_title(
    draw: ImageDraw.ImageDraw, title: str
) -> tuple[ImageFont.FreeTypeFont, int, int]:
    """v1's fit_title, widened to leave room for the second square."""
    fixed = SQUARE + GAP + GAP + SQUARE

    for size in range(42, 27, -1):
        width = text_width(draw, title, size)
        if fixed + width <= MAX_ROW:
            return font(size), fixed + width, width

    width = text_width(draw, title, 28)
    return font(28), fixed + width, width


def render_card(title: str, destination: Path, mark: Image.Image) -> None:
    image = Image.new("RGB", (v1.WIDTH, v1.HEIGHT), v1.BACKGROUND)
    draw = ImageDraw.Draw(image)
    image.paste(mark, (425, 42), mark)

    draw_tracked(
        draw,
        DOMAIN,
        v1.WIDTH / 2,
        MASTHEAD_MIDDLE,
        MASTHEAD_SIZE,
        v1.MUTED,
        MASTHEAD_TRACKING,
    )

    title_font, row_width, title_width = fit_title(draw, title)
    row_start = round(v1.WIDTH / 2 - row_width / 2)

    draw.rectangle(
        (row_start, TITLE_TOP, row_start + SQUARE - 1, TITLE_TOP + SQUARE - 1),
        fill=v1.PRIMARY,
    )
    title_left = row_start + SQUARE + GAP
    draw.text(
        (title_left, TITLE_MIDDLE),
        title,
        font=title_font,
        fill=v1.FOREGROUND,
        anchor="lm",
    )
    right_square = title_left + title_width + GAP
    draw.rectangle(
        (
            right_square,
            TITLE_TOP,
            right_square + SQUARE - 1,
            TITLE_TOP + SQUARE - 1,
        ),
        fill=v1.PRIMARY,
    )

    draw.text(
        (v1.WIDTH / 2, 574),
        v1.KEYWORDS,
        font=font(15),
        fill=v1.MUTED,
        anchor="mm",
    )

    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, optimize=True)


# Every card in the set. The titles are the ones the registry carries, with one
# deliberate exception: the Blog Platform Docs publication card says "Blog
# Platform", as it has since v1. That predates the publication's rename and is
# carried forward here rather than changed, because changing what a card says is
# an editorial decision and this version is a design change.
ASSETS = [
    ("Blog Platform", DOCS_DIR / "publication-blog-platform-og-cover-v2.png"),
    ("Markdown reference", DOCS_POSTS_DIR / "401-markdown-reference-og-cover-v2.png"),
    ("Adding a publication or post", DOCS_POSTS_DIR / "402-adding-content-og-cover-v2.png"),
    ("Content validation rules", DOCS_POSTS_DIR / "403-content-validation-og-cover-v2.png"),
    ("The content contract", DOCS_POSTS_DIR / "404-content-contract-og-cover-v2.png"),
    ("How pages are rendered", DOCS_POSTS_DIR / "405-rendering-model-og-cover-v2.png"),
    ("Extending the renderer", DOCS_POSTS_DIR / "406-extending-the-renderer-og-cover-v2.png"),
    ("Design tokens and theming", DOCS_POSTS_DIR / "407-design-tokens-og-cover-v2.png"),
    ("Accessibility contract", DOCS_POSTS_DIR / "408-accessibility-contract-og-cover-v2.png"),
    ("URLs, slugs, and redirects", DOCS_POSTS_DIR / "409-urls-and-redirects-og-cover-v2.png"),
    ("Running and releasing the blog", DOCS_POSTS_DIR / "410-running-the-blog-og-cover-v2.png"),
    ("Search, tags, and discovery", DOCS_POSTS_DIR / "411-search-and-discovery-og-cover-v2.png"),
    ("Authors and bylines", DOCS_POSTS_DIR / "412-authors-and-bylines-og-cover-v2.png"),
    ("A tour of the platform", DOCS_POSTS_DIR / "413-start-here-og-cover-v2.png"),
    ("Supporting the platform", DOCS_POSTS_DIR / "414-supporting-the-platform-og-cover-v2.png"),
    ("Build an online presence", PRESENCE_DIR / "publication-online-presence-og-cover-v2.png"),
    ("Own your platform", PRESENCE_POSTS_DIR / "501-own-your-platform-og-cover-v2.png"),
    ("Build your own blog", PRESENCE_POSTS_DIR / "502-build-your-own-blog-og-cover-v2.png"),
]


def main() -> None:
    mark = v1.make_mark()

    for title, path in ASSETS:
        render_card(title, path, mark)
        print(path)

    print(render_contact_sheet([path for _, path in ASSETS]))


def render_contact_sheet(paths: list[Path]) -> Path:
    """v1's contact sheet, written under a v2 name beside the v1 one."""
    from math import ceil

    columns = 3
    rows = ceil(len(paths) / columns)
    thumb_width, thumb_height, gutter = 360, 189, 12
    sheet = Image.new(
        "RGB",
        (
            gutter + columns * (thumb_width + gutter),
            gutter + rows * (thumb_height + gutter),
        ),
        (24, 24, 24),
    )

    for index, path in enumerate(paths):
        row, column = divmod(index, columns)
        preview = Image.open(path).convert("RGB").resize(
            (thumb_width, thumb_height), Image.Resampling.LANCZOS
        )
        sheet.paste(
            preview,
            (
                gutter + column * (thumb_width + gutter),
                gutter + row * (thumb_height + gutter),
            ),
        )

    destination = DOCS_DIR / "contact-sheet-v2.png"
    sheet.save(destination, optimize=True)
    return destination


if __name__ == "__main__":
    main()
