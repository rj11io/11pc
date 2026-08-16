from __future__ import annotations

from math import ceil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


BRANDING_DIR = Path(__file__).resolve().parents[1]
MARK_PATH = BRANDING_DIR / "images/logos/11blog-mark-xl-dot-centered.png"
OUTPUT_DIR = BRANDING_DIR / "images/blog-platform"
POSTS_DIR = OUTPUT_DIR / "posts"

SANS_MONO = "/System/Library/Fonts/SFNSMono.ttf"

WIDTH = 1200
HEIGHT = 630
BACKGROUND = (10, 10, 10)
FOREGROUND = (250, 250, 250)
PRIMARY = (43, 200, 143)
MUTED = (161, 161, 161)
KEYWORDS = "AI / SOFTWARE / PRODUCT / ENGINEERING / TECHNOLOGY"

PUBLICATION = (
    "Blog Platform",
    OUTPUT_DIR / "publication-blog-platform-og-cover-v1.png",
)

POSTS = [
    (
        "Markdown reference",
        POSTS_DIR / "401-markdown-reference-og-cover-v1.png",
    ),
    (
        "Adding a publication or post",
        POSTS_DIR / "402-adding-content-og-cover-v1.png",
    ),
    (
        "Content validation rules",
        POSTS_DIR / "403-content-validation-og-cover-v1.png",
    ),
    (
        "Search, tags, and discovery",
        POSTS_DIR / "411-search-and-discovery-og-cover-v1.png",
    ),
    (
        "Authors and bylines",
        POSTS_DIR / "412-authors-and-bylines-og-cover-v1.png",
    ),
    (
        "The content contract",
        POSTS_DIR / "404-content-contract-og-cover-v1.png",
    ),
    (
        "How pages are rendered",
        POSTS_DIR / "405-rendering-model-og-cover-v1.png",
    ),
    (
        "Extending the renderer",
        POSTS_DIR / "406-extending-the-renderer-og-cover-v1.png",
    ),
    (
        "Design tokens and theming",
        POSTS_DIR / "407-design-tokens-og-cover-v1.png",
    ),
    (
        "Accessibility contract",
        POSTS_DIR / "408-accessibility-contract-og-cover-v1.png",
    ),
    (
        "URLs, slugs, and redirects",
        POSTS_DIR / "409-urls-and-redirects-og-cover-v1.png",
    ),
    (
        "Running and releasing the blog",
        POSTS_DIR / "410-running-the-blog-og-cover-v1.png",
    ),
]


def make_mark() -> Image.Image:
    source = (
        Image.open(MARK_PATH)
        .convert("RGB")
        .crop((247, 247, 1007, 1007))
        .resize((350, 350), Image.Resampling.LANCZOS)
    )
    mark = Image.new("RGBA", source.size)
    source_pixels = source.load()
    mark_pixels = mark.load()

    for y in range(source.height):
        for x in range(source.width):
            red, green, blue = source_pixels[x, y]
            maximum = max(red, green, blue)
            alpha = 0 if maximum <= 12 else min(255, max(0, (maximum - 8) * 3))
            mark_pixels[x, y] = (red, green, blue, alpha)

    return mark


def fit_title(
    draw: ImageDraw.ImageDraw,
    title: str,
    max_row_width: int = 1040,
) -> tuple[ImageFont.FreeTypeFont, int]:
    for size in range(42, 27, -1):
        font = ImageFont.truetype(SANS_MONO, size)
        box = draw.textbbox((0, 0), title, font=font)
        text_width = box[2] - box[0]
        row_width = 18 + 20 + text_width
        if row_width <= max_row_width:
            return font, row_width

    font = ImageFont.truetype(SANS_MONO, 28)
    box = draw.textbbox((0, 0), title, font=font)
    return font, 18 + 20 + box[2] - box[0]


def render_card(title: str, destination: Path, mark: Image.Image) -> None:
    image = Image.new("RGB", (WIDTH, HEIGHT), BACKGROUND)
    draw = ImageDraw.Draw(image)
    image.paste(mark, (425, 42), mark)

    title_font, row_width = fit_title(draw, title)
    row_start = round(WIDTH / 2 - row_width / 2)
    draw.rectangle((row_start, 477, row_start + 17, 494), fill=PRIMARY)
    draw.text(
        (row_start + 38, 486),
        title,
        font=title_font,
        fill=FOREGROUND,
        anchor="lm",
    )

    keyword_font = ImageFont.truetype(SANS_MONO, 15)
    draw.text(
        (WIDTH / 2, 574),
        KEYWORDS,
        font=keyword_font,
        fill=MUTED,
        anchor="mm",
    )

    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, optimize=True)


def render_contact_sheet(paths: list[Path]) -> Path:
    columns = 3
    rows = ceil(len(paths) / columns)
    thumb_width = 360
    thumb_height = 189
    gutter = 12
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
            (thumb_width, thumb_height),
            Image.Resampling.LANCZOS,
        )
        x = gutter + column * (thumb_width + gutter)
        y = gutter + row * (thumb_height + gutter)
        sheet.paste(preview, (x, y))

    destination = OUTPUT_DIR / "contact-sheet-v1.png"
    sheet.save(destination, optimize=True)
    return destination


def main() -> None:
    mark = make_mark()
    assets = [PUBLICATION, *POSTS]

    for title, path in assets:
        render_card(title, path, mark)
        print(path)

    print(render_contact_sheet([path for _, path in assets]))


if __name__ == "__main__":
    main()
