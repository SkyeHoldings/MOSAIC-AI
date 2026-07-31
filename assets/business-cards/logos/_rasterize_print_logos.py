"""Rasterize Wikimedia SVGs → clean print PNGs for the card back."""

from __future__ import annotations

import re
import shutil
from pathlib import Path

import fitz
import numpy as np
from PIL import Image

LOGOS = Path(__file__).resolve().parent


def svg_to_rgba(svg_path: Path, scale: float = 8.0) -> Image.Image:
    doc = fitz.open(svg_path)
    page = doc[0]
    pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=True)
    im = Image.frombytes("RGBA", (pix.width, pix.height), pix.samples)
    doc.close()
    return im


def trim_alpha(im: Image.Image, pad: int = 12) -> Image.Image:
    arr = np.array(im)
    ys, xs = np.where(arr[:, :, 3] > 8)
    if len(xs) == 0:
        return im
    x0, x1 = int(xs.min()), int(xs.max()) + 1
    y0, y1 = int(ys.min()), int(ys.max()) + 1
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(im.width, x1 + pad)
    y1 = min(im.height, y1 + pad)
    return im.crop((x0, y0, x1, y1))


def edge_report(path: Path) -> None:
    im = Image.open(path).convert("RGBA")
    hist = im.getchannel("A").histogram()
    print(
        f"{path.name}: {im.size[0]}x{im.size[1]} "
        f"transparent={hist[0]} semi={sum(hist[1:255])} opaque={hist[255]}"
    )


def prepare_cabelas() -> Path:
    # Prefer the clip-path-fixed Wikimedia SVG (inline fills) if present
    fixed = LOGOS / "_cabelas_wikimedia_fixed.svg"
    src_path = fixed if fixed.exists() else LOGOS / "official_cabelas.svg"
    src = src_path.read_text(encoding="utf-8")

    # Yellow wordmark only — gray shadows muddy on white card stock
    # Remove gray-filled shapes (multiline-safe)
    clean = re.sub(
        r'<path[^>]*fill="#54534A"[^>]*>.*?</path>',
        "",
        src,
        flags=re.DOTALL,
    )
    clean = re.sub(
        r'<path[^>]*fill="#54534A"[^/]*/>',
        "",
        clean,
        flags=re.DOTALL,
    )
    clean = re.sub(
        r'<path class="st1"[^>]*>.*?</path>',
        "",
        clean,
        flags=re.DOTALL,
    )
    clean = re.sub(
        r'<path class="st1"[^/]*/>',
        "",
        clean,
        flags=re.DOTALL,
    )
    clean = re.sub(
        r'<polyline class="st1"[^/]*/>',
        "",
        clean,
        flags=re.DOTALL,
    )
    # Ensure yellow paths have inline fill (PyMuPDF ignores CSS classes)
    clean = clean.replace('class="st0"', 'fill="#FFCB05"')
    clean = clean.replace("clip-path:url(#SVGID_2_);", "")
    clean = re.sub(r'\.st0\{[^}]*\}', "", clean)
    clean = re.sub(r'\.st1\{[^}]*\}', "", clean)

    out = LOGOS / "official_cabelas_print.svg"
    out.write_text(clean, encoding="utf-8")
    return out


def prepare_redrobin() -> Path:
    src = (LOGOS / "official_redrobin.svg").read_text(encoding="utf-8")
    # Drop orange tagline; keep red script + dark swoosh
    clean = re.sub(
        r'<path d="[^"]*" transform="[^"]*" fill="#f9a70d"/>',
        "",
        src,
        count=1,
    )
    out = LOGOS / "official_redrobin_print.svg"
    out.write_text(clean, encoding="utf-8")
    return out


def main() -> None:
    jobs = [
        (prepare_cabelas(), LOGOS / "official_cabelas.png", 10.0),
        (prepare_redrobin(), LOGOS / "official_redrobin.png", 12.0),
    ]
    for svg, out_png, scale in jobs:
        bak = out_png.with_name(out_png.stem + "_pre_vector_bak.png")
        if out_png.exists():
            shutil.copy2(out_png, bak)
        im = trim_alpha(svg_to_rgba(svg, scale=scale), pad=12)
        im.save(out_png, "PNG", optimize=True)
        edge_report(out_png)
        print(f"  wrote {out_png.name} from {svg.name}")


if __name__ == "__main__":
    main()
