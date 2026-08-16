"""Version 3 of the 11blog OG and cover set.

Adds the asset introduced on 2026-07-31 alongside the share actions: the Blog
Platform Docs post about supporting the platform.

As in v2, the drawing code is not repeated here. It is loaded from the v1
generator so no version can drift away from the others visually: same mark, same
crop, same title fitting, same green signal square, same keyword footer. This
script supplies only a new manifest and a new output name, so nothing in the v1
or v2 set is overwritten.

Run with a Python that has Pillow installed:

    python3 -m venv .venv
    .venv/bin/pip install Pillow
    .venv/bin/python v0/branding/generators/og-covers-v3.py
"""

from __future__ import annotations

import importlib.util
from pathlib import Path

BRANDING_DIR = Path(__file__).resolve().parents[1]
GENERATOR_V1 = Path(__file__).resolve().parent / "blog-platform-og-covers-v1.py"

DOCS_POSTS_DIR = BRANDING_DIR / "images/blog-platform/posts"


def load_v1():
    """Load the v1 generator by path, since its filename is not importable."""
    spec = importlib.util.spec_from_file_location("og_covers_v1", GENERATOR_V1)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"could not load {GENERATOR_V1}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


ASSETS = [
    # Written into the existing v1 output directory because it belongs to that
    # set. The filename is new, so no earlier asset is touched.
    (
        "Supporting the platform",
        DOCS_POSTS_DIR / "414-supporting-the-platform-og-cover-v1.png",
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
