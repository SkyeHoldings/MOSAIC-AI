"""Render traced Cabela's SVG via Chrome headless for a sharp PNG."""

from __future__ import annotations

import subprocess
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent
LOGOS = ROOT.parent / "business-cards" / "logos"
SVG = LOGOS / "_cab_traced.svg"
HTML = ROOT / "_cab_render.html"
SHOT = ROOT / "_cab_chrome.png"
OUT = LOGOS / "official_cabelas.png"
QC = ROOT / "_qc_cab_hires.png"
CHROME = Path.home() / "AppData/Local/Google/Chrome/Application/chrome.exe"

W, H = 1600, 520


def main() -> None:
    svg = SVG.read_text(encoding="utf-8")
    # Force viewBox + responsive width so Chrome scales smoothly
    if "viewBox" not in svg:
        svg = svg.replace(
            '<svg version="1.1"',
            '<svg version="1.1" viewBox="0 0 351 106"',
            1,
        )
    svg = svg.replace('width="351"', 'width="1400"').replace('height="106"', 'height="422"')

    HTML.write_text(
        f"""<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<style>
  html,body {{ margin:0; background:#000; width:{W}px; height:{H}px; overflow:hidden; }}
  .wrap {{ width:{W}px; height:{H}px; display:flex; align-items:center; justify-content:center; }}
  svg {{ display:block; }}
</style></head>
<body><div class="wrap">{svg}</div></body></html>
""",
        encoding="utf-8",
    )

    url = HTML.as_uri()
    if SHOT.exists():
        SHOT.unlink()
    cmd = [
        str(CHROME),
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        f"--window-size={W},{H}",
        f"--screenshot={SHOT}",
        url,
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    print("shot", SHOT.exists(), SHOT.stat().st_size if SHOT.exists() else 0)

    im = Image.open(SHOT).convert("RGBA")
    arr = np.array(im)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    # keep yellow + near-black outline; drop pure black page
    yellow = (r > 160) & (g > 120) & (b < 120) & (g > b + 15)
    outline = (r + g + b < 90) & (np.abs(r.astype(int) - g.astype(int)) < 25)
    keep = yellow | outline
    # soften: keep any non-black saturated pixel near yellow
    near = (r + g + b > 40) & ~((r < 30) & (g < 30) & (b < 30))
    # Actually on black bg, ink is yellow+dark outline only
    alpha = np.zeros(a.shape, dtype=np.uint8)
    alpha[yellow] = 255
    alpha[outline] = 255
    # anti-alias: keep mid yellows
    mid = (r > 100) & (g > 70) & (b < 140) & (g > b) & ~yellow
    alpha[mid] = np.maximum(alpha[mid], ((r[mid].astype(np.int16) - 60) * 2).clip(0, 255).astype(np.uint8))

    out_arr = arr.copy()
    out_arr[:, :, 3] = alpha
    out = Image.fromarray(out_arr, "RGBA")
    ys, xs = np.where(alpha > 20)
    out = out.crop(
        (
            max(0, int(xs.min()) - 6),
            max(0, int(ys.min()) - 6),
            min(out.width, int(xs.max()) + 7),
            min(out.height, int(ys.max()) + 7),
        )
    )
    out.save(OUT)
    out.save(QC)
    print("saved", OUT, out.size)


if __name__ == "__main__":
    main()
