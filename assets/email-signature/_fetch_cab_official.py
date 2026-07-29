"""Download official Wikimedia Cabela's SVG and rasterize via Chrome."""

from __future__ import annotations

import subprocess
import time
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent
LOGOS = ROOT.parent / "business-cards" / "logos"
OUT = LOGOS / "official_cabelas.png"
QC = ROOT / "_qc_cab_hires.png"
SVG = LOGOS / "_cabelas_wikimedia.svg"
HTML = ROOT / "_cab_wiki_render.html"
SHOT = ROOT / "_cab_wiki_chrome.png"
CHROME = Path.home() / "AppData/Local/Google/Chrome/Application/chrome.exe"
UA = {"User-Agent": "MosaicSignatureBot/1.0 (local build; contact skye@hellomosaic.ai)"}

SVG_URL = "https://upload.wikimedia.org/wikipedia/commons/4/4a/Cabela%27s_Logo.svg"
PNG_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Cabela%27s_Logo.svg/2560px-Cabela%27s_Logo.svg.png"
W, H = 1800, 600


def fetch(url: str, dest: Path) -> None:
    req = urllib.request.Request(url, headers=UA)
    for attempt in range(4):
        try:
            data = urllib.request.urlopen(req, timeout=40).read()
            dest.write_bytes(data)
            print("fetched", url, "->", dest.name, len(data))
            return
        except Exception as e:
            print("retry", attempt, e)
            time.sleep(1.5 * (attempt + 1))
    raise SystemExit(f"failed {url}")


def main() -> None:
    fetch(SVG_URL, SVG)
    # Also grab large PNG as backup
    png_path = LOGOS / "_cabelas_wikimedia_2560.png"
    try:
        fetch(PNG_URL, png_path)
    except SystemExit:
        print("2560 png unavailable, continuing with SVG only")

    svg = SVG.read_text(encoding="utf-8")
    # Ensure it scales
    if "viewBox" not in svg and "<svg" in svg:
        svg = svg.replace("<svg", '<svg viewBox="0 0 300 100"', 1)
    HTML.write_text(
        f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
html,body{{margin:0;background:#000;width:{W}px;height:{H}px;overflow:hidden}}
.wrap{{width:{W}px;height:{H}px;display:flex;align-items:center;justify-content:center}}
svg{{width:1500px;height:auto;display:block}}
</style></head>
<body><div class="wrap">{svg}</div></body></html>""",
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
            "--force-device-scale-factor=1",
            f"--window-size={W},{H}",
            f"--screenshot={SHOT}",
            HTML.as_uri(),
        ],
        check=True,
        capture_output=True,
    )

    shot = Image.open(SHOT).convert("RGBA")
    arr = np.array(shot)
    r, g, b = arr[:, :, 0].astype(np.int16), arr[:, :, 1].astype(np.int16), arr[:, :, 2].astype(np.int16)
    brightness = np.maximum(np.maximum(r, g), b)
    page = brightness < 14
    alpha = np.clip(brightness.astype(np.float32) * 1.25, 0, 255).astype(np.uint8)
    alpha[page] = 0
    # yellow cores opaque
    yellow = (r > 160) & (g > 110) & (b < 140) & (g > b)
    alpha[yellow] = 255
    out = arr.copy()
    out[:, :, 3] = alpha
    im = Image.fromarray(out, "RGBA")
    ys, xs = np.where(alpha > 10)
    im = im.crop(
        (
            max(0, int(xs.min()) - 10),
            max(0, int(ys.min()) - 10),
            min(im.width, int(xs.max()) + 11),
            min(im.height, int(ys.max()) + 11),
        )
    )
    im.save(OUT)
    im.save(QC)
    print("saved", OUT, im.size)

    # Prefer Wikimedia PNG if it's the true yellow script and larger/cleaner
    if png_path.exists():
        wiki = Image.open(png_path).convert("RGBA")
        print("wiki png", wiki.size)
        # knockout white
        a = np.array(wiki)
        rr, gg, bb, aa = a[:, :, 0], a[:, :, 1], a[:, :, 2], a[:, :, 3]
        page = (aa < 8) | ((rr > 245) & (gg > 245) & (bb > 245))
        a[page, 3] = 0
        soft = (rr > 230) & (gg > 230) & (bb > 230) & ~page
        a[soft, 3] = np.minimum(a[soft, 3], ((255 - rr[soft]) * 5).clip(0, 255))
        wiki2 = Image.fromarray(a, "RGBA")
        ys, xs = np.where(a[:, :, 3] > 10)
        wiki2 = wiki2.crop((xs.min() - 4, ys.min() - 4, xs.max() + 5, ys.max() + 5))
        wiki2.save(LOGOS / "_cabelas_wikimedia_cut.png")
        # Use wiki PNG if aspect looks like wordmark
        if wiki2.width > wiki2.height * 1.8:
            wiki2.save(OUT)
            wiki2.save(QC)
            print("using wikimedia PNG cut", wiki2.size)


if __name__ == "__main__":
    main()
