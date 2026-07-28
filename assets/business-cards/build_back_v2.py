"""Mosaic business card BACK — matches black front aesthetic.

3.5\" x 2\" @ 300 DPI = 1050 x 600
"""

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
BRANDS = ROOT.parent.parent / "public" / "brands"
ARMATA = ROOT.parent / "linkedin" / "fonts" / "Armata-Regular.ttf"

W, H = 1050, 600
BLACK = (8, 8, 8)
WHITE = (255, 255, 255)
MUTED = (168, 168, 168)

NAME = "SKYE SMITH"
TITLE = "CEO"
URL = "hellomosaic.ai"
PHONE = "208.819.2549"
EMAIL = "skye@hellomosaic.ai"

CLIENTS = [
    ("gucci.png", 0.92),
    ("cabelas.png", 1.0),
    ("bass-pro-shops.png", 1.15),
    ("red-robin.png", 1.05),
]


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        r"C:\Windows\Fonts\consolab.ttf" if bold else r"C:\Windows\Fonts\consola.ttf",
        r"C:\Windows\Fonts\courbd.ttf" if bold else r"C:\Windows\Fonts\cour.ttf",
        str(ARMATA),
        r"C:\Windows\Fonts\arial.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def to_white_transparent(src: Path) -> Image.Image:
    """Dark bg + light mark -> white mark on transparent."""
    im = Image.open(src).convert("RGBA")
    px = im.load()
    w, h = im.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    opx = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            lum = (r + g + b) / 3.0
            # keep light strokes; kill near-black bg
            if lum < 55:
                continue
            strength = min(1.0, (lum - 55) / 170.0)
            alpha = int(round(strength * a))
            if alpha < 10:
                continue
            opx[x, y] = (255, 255, 255, alpha)
    return trim_alpha(out)


def trim_alpha(im: Image.Image, pad: int = 4) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(im.width, r + pad)
    b = min(im.height, b + pad)
    return im.crop((l, t, r, b))


def fit_logo(im: Image.Image, max_w: int, max_h: int) -> Image.Image:
    w, h = im.size
    scale = min(max_w / w, max_h / h)
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    return im.resize((nw, nh), Image.Resampling.LANCZOS)


def build_back() -> Image.Image:
    canvas = Image.new("RGBA", (W, H), BLACK + (255,))
    draw = ImageDraw.Draw(canvas)

    pad_x = 56
    pad_y = 48

    name_font = load_font(34, bold=True)
    title_font = load_font(18)
    contact_font = load_font(17)
    label_font = load_font(13)

    # --- Top: identity left, contact right ---
    draw.text((pad_x, pad_y), NAME, font=name_font, fill=WHITE)
    name_bb = draw.textbbox((pad_x, pad_y), NAME, font=name_font)
    draw.text((pad_x, name_bb[3] + 8), TITLE, font=title_font, fill=MUTED)

    contacts = [URL, PHONE, EMAIL]
    line_gap = 8
    contact_heights = []
    for line in contacts:
        bb = draw.textbbox((0, 0), line, font=contact_font)
        contact_heights.append(bb[3] - bb[1])
    block_h = sum(contact_heights) + line_gap * (len(contacts) - 1)
    y = pad_y + 2
    for line, lh in zip(contacts, contact_heights):
        bb = draw.textbbox((0, 0), line, font=contact_font)
        tw = bb[2] - bb[0]
        draw.text((W - pad_x - tw, y), line, font=contact_font, fill=WHITE)
        y += lh + line_gap

    # Hairline under header
    line_y = max(name_bb[3] + 8 + 18 + 28, y + 10)
    draw.rectangle([pad_x, line_y, W - pad_x, line_y + 1], fill=(55, 55, 55))

    # --- Clients ---
    label = "SELECTED CLIENTS"
    label_y = line_y + 36
    # tracked label
    spacing = 4
    chars = list(label)
    widths = [draw.textbbox((0, 0), ch, font=label_font)[2] for ch in chars]
    total = sum(widths) + spacing * (len(chars) - 1)
    cx = (W - total) / 2
    for ch, cw in zip(chars, widths):
        draw.text((cx, label_y), ch, font=label_font, fill=MUTED)
        cx += cw + spacing

    # Logo row
    logos = []
    for filename, weight in CLIENTS:
        path = BRANDS / filename
        mark = to_white_transparent(path)
        logos.append((mark, weight))

    row_max_h = 78
    gap = 28
    available = W - pad_x * 2 - gap * (len(logos) - 1)
    # weight-proportional widths
    weight_sum = sum(w for _, w in logos)
    targets = [int(available * (w / weight_sum)) for _, w in logos]

    fitted = [fit_logo(im, tw, row_max_h) for (im, _), tw in zip(logos, targets)]
    row_w = sum(im.width for im in fitted) + gap * (len(fitted) - 1)
    row_h = max(im.height for im in fitted)

    # Vertically center logos in remaining space under label
    bottom_pad = 48
    logo_area_top = label_y + 28
    logo_area_bottom = H - bottom_pad
    logo_y = logo_area_top + max(0, (logo_area_bottom - logo_area_top - row_h) // 2)
    x = (W - row_w) // 2

    for im in fitted:
        canvas.alpha_composite(im, (x, logo_y + (row_h - im.height) // 2))
        x += im.width + gap

    return canvas.convert("RGB")


def main() -> None:
    back = build_back()
    assert back.size == (W, H)
    ROOT.mkdir(parents=True, exist_ok=True)
    png = ROOT / "mosaic-business-card-back-v2-1050x600.png"
    jpg = ROOT / "mosaic-business-card-back-v2-1050x600.jpg"
    back.save(png, "PNG", optimize=True)
    back.save(jpg, "JPEG", quality=95, optimize=True)
    desktop = Path.home() / "Desktop" / png.name
    desktop.write_bytes(png.read_bytes())
    print(f"saved {png}")
    print(f"saved {desktop}")


if __name__ == "__main__":
    main()
