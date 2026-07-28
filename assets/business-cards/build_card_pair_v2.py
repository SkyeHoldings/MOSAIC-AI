"""Mosaic business card FRONT + BACK pair.

Matches the black Canva front (tagline + centered barcode lockup)
and the cleaned-up contact/clients back.

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

# Official Mosaic barcode (viewBox 0 0 168 30)
BARS = [
    (0, 3), (6, 2), (11, 5), (19, 2), (24, 3), (30, 2), (35, 6),
    (44, 2), (49, 3), (55, 2), (60, 5), (68, 2), (73, 3), (79, 2),
    (84, 6), (93, 2), (98, 3), (104, 2), (109, 5), (117, 2), (122, 3),
    (128, 2), (133, 6), (142, 2), (147, 3), (153, 2), (158, 5), (165, 3),
]
VB_W = 168.0

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


def draw_logo(
    draw: ImageDraw.ImageDraw,
    x: float,
    y: float,
    logo_w: float,
    barcode_h: float,
    word_font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
    fill=WHITE,
) -> float:
    """Barcode + tracked MOSAIC. Returns total height."""
    scale = logo_w / VB_W
    for bx, bw in BARS:
        left = x + bx * scale
        right = left + bw * scale
        draw.rectangle([left, y, right, y + barcode_h], fill=fill)

    letters = list("MOSAIC")
    gap = max(10, int(barcode_h * 0.38))
    word_y = y + barcode_h + gap
    letter_boxes = [draw.textbbox((0, 0), ch, font=word_font) for ch in letters]
    letter_widths = [b[2] - b[0] for b in letter_boxes]
    letter_h = max(b[3] - b[1] for b in letter_boxes)
    total_letters = sum(letter_widths)
    remaining = max(0, logo_w - total_letters)
    slot = remaining / (len(letters) - 1) if len(letters) > 1 else 0
    cursor = float(x)
    for ch, lw in zip(letters, letter_widths):
        draw.text((cursor, word_y), ch, font=word_font, fill=fill)
        cursor += lw + slot

    return barcode_h + gap + letter_h


def to_white_transparent(src: Path) -> Image.Image:
    im = Image.open(src).convert("RGBA")
    px = im.load()
    w, h = im.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    opx = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            lum = (r + g + b) / 3.0
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
    return im.crop(
        (max(0, l - pad), max(0, t - pad), min(im.width, r + pad), min(im.height, b + pad))
    )


def fit_logo(im: Image.Image, max_w: int, max_h: int) -> Image.Image:
    w, h = im.size
    scale = min(max_w / w, max_h / h)
    return im.resize((max(1, int(w * scale)), max(1, int(h * scale))), Image.Resampling.LANCZOS)


def dark_to_white_transparent(im: Image.Image, thresh: float = 210) -> Image.Image:
    """Dark mark on light/white bg -> white mark on transparent."""
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    opx = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 8:
                continue
            lum = (r + g + b) / 3.0
            darkness = max(0.0, (thresh - lum) / thresh)
            alpha = int(round(darkness * a))
            if alpha < 8:
                continue
            opx[x, y] = (255, 255, 255, min(255, alpha))
    bbox = out.getbbox()
    return out.crop(bbox) if bbox else out


def build_front() -> Image.Image:
    """Black field + tagline + exact Mosaic logo (not a redraw)."""
    canvas = Image.new("RGBA", (W, H), BLACK + (255,))
    draw = ImageDraw.Draw(canvas)

    pad_x = 56
    pad_y = 48
    tag_font = load_font(20)

    draw.text((pad_x, pad_y), "MARKETING +", font=tag_font, fill=WHITE)
    bb = draw.textbbox((pad_x, pad_y), "MARKETING +", font=tag_font)
    draw.text((pad_x, bb[3] + 6), "AI INNOVATION", font=tag_font, fill=WHITE)

    # Exact logo: barcode + MOSAIC from brand master (no tagline under wordmark)
    master = ROOT.parent / "mosaic-logo.png"
    exact = ROOT / "mosaic-logo-exact-white.png"
    if exact.exists():
        logo = Image.open(exact).convert("RGBA")
    else:
        hi = Image.open(master).convert("RGBA")
        logo = dark_to_white_transparent(hi.crop((160, 360, 865, 605)))
        logo.save(exact)

    target_w = 520
    scale = target_w / logo.width
    logo = logo.resize(
        (int(logo.width * scale), int(logo.height * scale)),
        Image.Resampling.LANCZOS,
    )
    lx = (W - logo.width) // 2
    ly = (H - logo.height) // 2 + 6
    canvas.alpha_composite(logo, (lx, ly))
    return canvas.convert("RGB")


def build_back() -> Image.Image:
    canvas = Image.new("RGBA", (W, H), BLACK + (255,))
    draw = ImageDraw.Draw(canvas)

    pad_x = 56
    pad_y = 48

    name_font = load_font(34, bold=True)
    title_font = load_font(18)
    contact_font = load_font(17)
    label_font = load_font(13)

    draw.text((pad_x, pad_y), NAME, font=name_font, fill=WHITE)
    name_bb = draw.textbbox((pad_x, pad_y), NAME, font=name_font)
    draw.text((pad_x, name_bb[3] + 8), TITLE, font=title_font, fill=MUTED)

    contacts = [URL, PHONE, EMAIL]
    line_gap = 8
    contact_heights = []
    for line in contacts:
        bb = draw.textbbox((0, 0), line, font=contact_font)
        contact_heights.append(bb[3] - bb[1])

    y = pad_y + 2
    for line, lh in zip(contacts, contact_heights):
        bb = draw.textbbox((0, 0), line, font=contact_font)
        tw = bb[2] - bb[0]
        draw.text((W - pad_x - tw, y), line, font=contact_font, fill=WHITE)
        y += lh + line_gap

    line_y = max(name_bb[3] + 8 + 18 + 28, y + 10)
    draw.rectangle([pad_x, line_y, W - pad_x, line_y + 1], fill=(55, 55, 55))

    label = "SELECTED CLIENTS"
    label_y = line_y + 36
    spacing = 4
    chars = list(label)
    widths = [draw.textbbox((0, 0), ch, font=label_font)[2] for ch in chars]
    total = sum(widths) + spacing * (len(chars) - 1)
    cx = (W - total) / 2
    for ch, cw in zip(chars, widths):
        draw.text((cx, label_y), ch, font=label_font, fill=MUTED)
        cx += cw + spacing

    logos = [(to_white_transparent(BRANDS / f), w) for f, w in CLIENTS]
    row_max_h = 78
    gap = 28
    available = W - pad_x * 2 - gap * (len(logos) - 1)
    weight_sum = sum(w for _, w in logos)
    targets = [int(available * (w / weight_sum)) for _, w in logos]
    fitted = [fit_logo(im, tw, row_max_h) for (im, _), tw in zip(logos, targets)]
    row_w = sum(im.width for im in fitted) + gap * (len(fitted) - 1)
    row_h = max(im.height for im in fitted)

    logo_area_top = label_y + 28
    logo_y = logo_area_top + max(0, (H - 48 - logo_area_top - row_h) // 2)
    x = (W - row_w) // 2
    for im in fitted:
        canvas.alpha_composite(im, (x, logo_y + (row_h - im.height) // 2))
        x += im.width + gap

    return canvas.convert("RGB")


def save(img: Image.Image, stem: str) -> Path:
    ROOT.mkdir(parents=True, exist_ok=True)
    png = ROOT / f"{stem}.png"
    jpg = ROOT / f"{stem}.jpg"
    img.save(png, "PNG", optimize=True)
    img.save(jpg, "JPEG", quality=95, optimize=True)
    desktop = Path.home() / "Desktop" / png.name
    desktop.write_bytes(png.read_bytes())
    print(f"saved {png}")
    print(f"saved {desktop}")
    return desktop


def main() -> None:
    front = build_front()
    back = build_back()
    assert front.size == (W, H) and back.size == (W, H)
    save(front, "mosaic-business-card-front-v2-1050x600")
    save(back, "mosaic-business-card-back-v2-1050x600")


if __name__ == "__main__":
    main()
