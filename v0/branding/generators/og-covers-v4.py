"""Version 4 of the 11blog OG and cover set.

Redraws one card after a rename on 2026-08-02: the Build an online presence post
"Three ways to build your own blog" became "Build your own blog". The title is
drawn into the artwork, so a rename means a new file rather than an edit.

As in v2 and v3, the drawing code is not repeated here. It is loaded from the v1
generator so no version can drift away from the others visually: same mark, same
crop, same title fitting, same green signal square, same keyword footer. This
script supplies only a new manifest and a new output name, so nothing in the v1,
v2, or v3 set is overwritten.

One thing to know about the set as a whole. The v2 manifest still lists the old
card, at posts/502-three-ways-to-build-a-blog-og-cover-v1.png, and running v2
again would write that file back. That is deliberate: each version records what
it produced at the time, and editing an old manifest would make it a record of
nothing. The file it writes is simply unused, and nothing imports it.

Run with a Python that has Pillow installed:

    python3 -m venv .venv
    .venv/bin/pip install Pillow
    .venv/bin/python v0/branding/generators/og-covers-v4.py
"""

from __future__ import annotations

import importlib.util
from pathlib import Path

BRANDING_DIR = Path(__file__).resolve().parents[1]
GENERATOR_V1 = Path(__file__).resolve().parent / "blog-platform-og-covers-v1.py"

PRESENCE_POSTS_DIR = BRANDING_DIR / "images/online-presence/posts"


def load_v1():
    """Load the v1 generator by path, since its filename is not importable."""
    spec = importlib.util.spec_from_file_location("og_covers_v1", GENERATOR_V1)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"could not load {GENERATOR_V1}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


ASSETS = [
    # Written into the existing online-presence output directory because it
    # belongs to that set. The filename is new, so no earlier asset is touched.
    # Keeps the 502 prefix: same post, new title.
    (
        "Build your own blog",
        PRESENCE_POSTS_DIR / "502-build-your-own-blog-og-cover-v1.png",
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
