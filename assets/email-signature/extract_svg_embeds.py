"""Extract embedded raster images from the Canva SVG export."""

from __future__ import annotations

import base64
import re
from io import BytesIO
from pathlib import Path

from PIL import Image

SVG = Path(r"C:\Users\skyes\Downloads\Gold Monogram Simple Real Estate Business Card.svg")
OUT = Path(r"C:\Users\skyes\Projects\understory-marketing-site\assets\business-cards\logos")

PATTERN = re.compile(
    r"xlink:href=\"data:image/(png|jpeg);base64,([^\"]+)\"",
    re.IGNORECASE,
)


def main() -> None:
    text = SVG.read_text(encoding="utf-8", errors="replace")
    matches = list(PATTERN.finditer(text))
    print(f"embedded images: {len(matches)}")
    for i, m in enumerate(matches):
        raw = base64.b64decode(m.group(2))
        im = Image.open(BytesIO(raw))
        path = OUT / f"_svg_embed_{i}.png"
        im.convert("RGBA").save(path)
        print(f"{i}: {im.size} {im.mode} -> {path.name}")


if __name__ == "__main__":
    main()
