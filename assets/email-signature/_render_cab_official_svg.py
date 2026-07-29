"""Rasterize the official Wikimedia Cabela's SVG crisply via Chrome."""

from __future__ import annotations

import re
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent
LOGOS = ROOT.parent / "business-cards" / "logos"
SVG_SRC = LOGOS / "_cabelas_wikimedia.svg"
SVG_FIX = LOGOS / "_cabelas_wikimedia_fixed.svg"
HTML = ROOT / "_cab_official_render.html"
SHOT = ROOT / "_cab_official_chrome.png"
OUT = LOGOS / "official_cabelas.png"
QC = ROOT / "_qc_cab_hires.png"
CHROME = Path.home() / "AppData/Local/Google/Chrome/Application/chrome.exe"
W, H = 2000, 700


def main() -> None:
    svg = SVG_SRC.read_text(encoding="utf-8")
    # Modernize for Chrome headless
    if "xmlns:xlink" not in svg:
        svg = svg.replace(
            'xmlns="http://www.w3.org/2000/svg"',
            'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"',
        )
    # Drop the broken clip rect that can clip oddly when scaled
    svg = re.sub(r"<clipPath[\s\S]*?</clipPath>", "", svg)
    svg = re.sub(r'clip-path:url\(#SVGID_2_\);', "", svg)
    svg = svg.replace('class="st0"', 'fill="#FFCB05"')
    svg = svg.replace('class="st1"', 'fill="#54534A"')
    SVG_FIX.write_text(svg, encoding="utf-8")

    HTML.write_text(
        f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
  html,body{{margin:0;background:#000;width:{W}px;height:{H}px;overflow:hidden}}
  .wrap{{width:{W}px;height:{H}px;display:flex;align-items:center;justify-content:center}}
  svg{{width:1600px;height:auto;display:block}}
</style></head>
<body>
  <div class="wrap">
    {svg}
  </div>
</body></html>""",
        encoding="utf-8",
    )

    if SHOT.exists():
        SHOT.unlink()
    subprocess.run(
        [
            str(CHROME),
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            "--force-device-scale-factor=2",
            f"--window-size={W},{H}",
            f"--screenshot={SHOT}",
            HTML.as_uri(),
        ],
        check=True,
        capture_output=True,
    )
    print("shot", SHOT.stat().st_size)

    # Screenshot is 2x because of device scale factor
    shot = Image.open(SHOT).convert("RGBA")
    print("shot size", shot.size)
    arr = np.array(shot)
    r, g, b = arr[:, :, 0].astype(np.int16), arr[:, :, 1].astype(np.int16), arr[:, :, 2].astype(np.int16)
    brightness = np.maximum(np.maximum(r, g), b)
    page = brightness < 10
    # Soft alpha preserves Chrome AA
    alpha = np.clip(brightness.astype(np.float32) * 1.15, 0, 255).astype(np.uint8)
    alpha[page] = 0
    yellow = (r > 180) & (g > 140) & (b < 100)
    gray = (np.abs(r - g) < 20) & (np.abs(g - b) < 20) & (r > 40) & (r < 120)
    alpha[yellow] = 255
    alpha[gray & ~page] = np.maximum(alpha[gray & ~page], 220)

    out = arr.copy()
    out[:, :, 3] = alpha
    im = Image.fromarray(out, "RGBA")
    ys, xs = np.where(alpha > 8)
    im = im.crop(
        (
            max(0, int(xs.min()) - 12),
            max(0, int(ys.min()) - 12),
            min(im.width, int(xs.max()) + 13),
            min(im.height, int(ys.max()) + 13),
        )
    )
    im.save(OUT)
    im.save(QC)
    print("saved", OUT, im.size)
    # AA check
    a = np.array(im)
    ys, xs = np.where(a[:, :, 3] > 200)
    y = int(np.median(ys))
    row = a[y, :, 3]
    nz = np.where(row > 0)[0]
    x0 = int(nz[0])
    print("alpha ramp", row[max(0, x0 - 3) : x0 + 12].tolist())


if __name__ == "__main__":
    main()
