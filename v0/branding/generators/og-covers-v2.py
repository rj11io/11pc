"""Version 2 of the 11blog OG and cover set.

Adds the assets introduced on 2026-07-31: the Blog Platform Docs entry-point
post, and the Build an online presence publication with its two posts.

The drawing code is not repeated here. It is loaded from the v1 generator so the
two versions cannot drift apart visually: same mark, same crop, same title
fitting, same green signal square, same keyword footer. This script only supplies
a new manifest and new output names, so nothing in the v1 set is overwritten.

Run with a Python that has Pillow installed:

    python3 -m venv .venv
    .venv/bin/pip install Pillow
    .venv/bin/python v0/branding/generators/og-covers-v2.py
"""

from __future__ import annotations

import importlib.util
from pathlib import Path

BRANDING_DIR = Path(__file__).resolve().parents[1]
GENERATOR_V1 = Path(__file__).resolve().parent / "blog-platform-og-covers-v1.py"

DOCS_POSTS_DIR = BRANDING_DIR / "images/blog-platform/posts"
PRESENCE_DIR = BRANDING_DIR / "images/online-presence"
PRESENCE_POSTS_DIR = PRESENCE_DIR / "posts"


def load_v1():
    """Load the v1 generator by path, since its filename is not importable."""
    spec = importlib.util.spec_from_file_location("og_covers_v1", GENERATOR_V1)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"could not load {GENERATOR_V1}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


ASSETS = [
    # Blog Platform Docs gains its entry point. Written into the existing v1
    # output directory because it belongs to that set; the filename is new, so
    # no v1 asset is touched.
    (
        "A tour of the platform",
        DOCS_POSTS_DIR / "413-start-here-og-cover-v1.png",
    ),
    # Build an online presence, and its two posts.
    (
        "Build an online presence",
        PRESENCE_DIR / "publication-online-presence-og-cover-v1.png",
    ),
    (
        "Own your platform",
        PRESENCE_POSTS_DIR / "501-own-your-platform-og-cover-v1.png",
    ),
    (
        "Three ways to build your own blog",
        PRESENCE_POSTS_DIR / "502-three-ways-to-build-a-blog-og-cover-v1.png",
    ),
]


def main() -> None:
    v1 = load_v1()
    mark = v1.make_mark()

    for title, path in ASSETS:
        v1.render_card(title, path, mark)
        print(path)


if __name__ == "__main__":
    main()
