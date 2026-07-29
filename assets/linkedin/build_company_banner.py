"""LinkedIn Company Page cover — brands only (no Mosaic lockup).

Upload: 4200 x 700 JPEG. LinkedIn already shows the company logo
over the cover, so the banner is just the client brands strip.
"""

from __future__ import annotations

import importlib.util
import os
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT.parent
SIG = ASSETS / "email-signature"
CARDS = ASSETS / "business-cards"
SUPPLY_MONO = CARDS / "fonts" / "supply" / "PPSupplyMono-Regular.otf"
ARMATA = ROOT / "fonts" / "Armata-Regular.ttf"

W, H = 4200, 700
BLACK = (8, 8, 8)
MUTED = (200, 200, 200)

BRANDS_LABEL = "BRANDS WE'VE WORKED WITH"


def _load_sig():
    spec = importlib.util.spec_from_file_location(
        "build_signature", SIG / "build_signature.py"
    )
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules["build_signature"] = mod
    spec.loader.exec_module(mod)
    return mod


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        str(SUPPLY_MONO),
        r"C:\Windows\Fonts\consola.ttf",
        r"C:\Windows\Fonts\cour.ttf",
        str(ARMATA),
        r"C:\Windows\Fonts\arial.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def build() -> Image.Image:
    sig = _load_sig()
    canvas = Image.new("RGBA", (W, H), BLACK + (255,))
    draw = ImageDraw.Draw(canvas)

    label_font = load_font(88)

    # Brand marks — medium size, comfortable gaps
    row_max_h = int(H * 0.38)
    prepared: list[Image.Image] = []
    for path, mode, height_frac in sig.CLIENTS:
        if not path.exists():
            continue
        im = sig.prepare_client(path, mode)
        th = max(32, int(row_max_h * height_frac * 0.9))
        ar = im.width / max(1, im.height)
        tw = max(1, int(round(th * ar)))
        prepared.append(sig.fit_logo(im, tw, th))

    brand_gap = 100
    logos_w = sum(im.width for im in prepared) + brand_gap * max(0, len(prepared) - 1)

    chars = list(BRANDS_LABEL)
    letter_spacing = 12
    widths = [draw.textbbox((0, 0), ch, font=label_font)[2] for ch in chars]
    label_w = sum(widths) + letter_spacing * (len(chars) - 1)
    label_bb = draw.textbbox((0, 0), "Xy", font=label_font)
    label_h = label_bb[3] - label_bb[1]

    gap_label_row = 22
    block_w = max(label_w, logos_w)
    block_h = label_h + gap_label_row + row_max_h

    # Center the brands cluster (leave room on left for LinkedIn company logo overlay)
    # Bias slightly right so the page logo doesn't cover Gucci
    origin_x = (W - block_w) // 2 + 80
    origin_y = (H - block_h) // 2

    lx = origin_x + (block_w - label_w) // 2
    ly = origin_y
    for ch, cw in zip(chars, widths):
        draw.text((lx, ly), ch, font=label_font, fill=MUTED)
        lx += cw + letter_spacing

    row_y = origin_y + label_h + gap_label_row
    x = origin_x + (block_w - logos_w) // 2
    for im in prepared:
        py = row_y + (row_max_h - im.height) // 2
        canvas.alpha_composite(im, (int(x), py))
        x += im.width + brand_gap

    return canvas.convert("RGB")


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    final = build()
    assert final.size == (W, H)

    out_jpg = ROOT / "mosaic-linkedin-company-banner-4200x700.jpg"
    out_png = ROOT / "mosaic-linkedin-company-banner-4200x700.png"
    preview = ROOT / "mosaic-linkedin-company-banner-preview.png"

    rgb = final.convert("RGB")
    rgb.save(out_jpg, "JPEG", quality=92, optimize=True, progressive=True, subsampling=1)
    rgb.save(out_png, "PNG", optimize=True)
    rgb.resize((1128, 188), Image.Resampling.LANCZOS).save(preview, "PNG", optimize=True)

    downloads = Path.home() / "Downloads"
    for src in (out_jpg, out_png, preview):
        (downloads / src.name).write_bytes(src.read_bytes())
        print(f"downloads {downloads / src.name}")

    print(f"saved {out_jpg} {final.size} — use this JPG on LinkedIn")


if __name__ == "__main__":
    main()
