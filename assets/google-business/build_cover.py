"""Google Business Profile cover — 16:9 brand layout with tessellated mosaic visual."""

from __future__ import annotations

import math
import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent
LINKEDIN_FONTS = ROOT.parent / "linkedin" / "fonts" / "Armata-Regular.ttf"
ARMATA = ROOT / "fonts" / "Armata-Regular.ttf"

# Recommended GBP cover size (16:9)
W, H = 1080, 608
SPLIT = int(W * 0.46)
MINT = (236, 235, 232)
INK = (17, 17, 17)
WHITE = (255, 255, 255)

BARS = [
    (0, 3),
    (6, 2),
    (11, 5),
    (19, 2),
    (24, 3),
    (30, 2),
    (35, 6),
    (44, 2),
    (49, 3),
    (55, 2),
    (60, 5),
    (68, 2),
    (73, 3),
    (79, 2),
    (84, 6),
    (93, 2),
    (98, 3),
    (104, 2),
    (109, 5),
    (117, 2),
    (122, 3),
    (128, 2),
    (133, 6),
    (142, 2),
    (147, 3),
    (153, 2),
    (158, 5),
    (165, 3),
]
VB_W = 168.0


def load_font(candidates: list[str], size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def seeded_random(seed: int):
    s = seed

    def rand() -> float:
        nonlocal s
        s = (s * 16807) % 2147483647
        return (s - 1) / 2147483646

    return rand


def _hex_center(col: int, row: int, size: float) -> tuple[float, float]:
    """Pointy-top hex grid center."""
    x = size * math.sqrt(3) * (col + 0.5 * (row & 1))
    y = size * 1.5 * row
    return x, y


def _hex_corners(cx: float, cy: float, size: float, jitter: float, rand) -> list[tuple[float, float]]:
    pts = []
    for i in range(6):
        angle = math.radians(60 * i - 30) + (rand() - 0.5) * 0.12
        r = size * (0.88 + rand() * 0.18) * (1 + (rand() - 0.5) * jitter)
        pts.append((cx + math.cos(angle) * r, cy + math.sin(angle) * r))
    return pts


def render_mosaic_panel(width: int, height: int) -> Image.Image:
    """Tessellated mosaic field — luminous core assembling from irregular tiles.

    Intentionally distinct from the site's digital-horizon / streak visual.
    """
    rand = seeded_random(91)
    scale = 2
    rw, rh = width * scale, height * scale
    img = Image.new("RGB", (rw, rh), (8, 9, 11))
    draw = ImageDraw.Draw(img, "RGBA")

    # Soft radial underglow (cool graphite, not purple)
    glow = Image.new("RGBA", (rw, rh), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    cx, cy = rw * 0.52, rh * 0.48
    for i in range(36, 0, -1):
        radx = rw * 0.55 * (i / 36)
        rady = rh * 0.62 * (i / 36)
        a = int(55 * ((1 - i / 36) ** 1.35))
        gd.ellipse(
            [cx - radx, cy - rady, cx + radx, cy + rady],
            fill=(210, 214, 220, a),
        )
    glow = glow.filter(ImageFilter.GaussianBlur(radius=28))
    img = Image.alpha_composite(img.convert("RGBA"), glow)

    # Hex mosaic tiles — denser / brighter near the core
    tile_size = 28 * scale
    cols = int(rw / (tile_size * math.sqrt(3))) + 4
    rows = int(rh / (tile_size * 1.5)) + 4
    origin_x = -tile_size * 2
    origin_y = -tile_size * 2

    tiles_layer = Image.new("RGBA", (rw, rh), (0, 0, 0, 0))
    td = ImageDraw.Draw(tiles_layer)

    for row in range(rows):
        for col in range(cols):
            hx, hy = _hex_center(col, row, tile_size)
            hx += origin_x
            hy += origin_y
            # Skip some periphery for organic breakup
            dx = (hx - cx) / rw
            dy = (hy - cy) / rh
            dist = math.sqrt(dx * dx + dy * dy)
            if dist > 0.72 and rand() > 0.55:
                continue
            if dist > 0.55 and rand() > 0.78:
                continue

            # Brightness rises toward center; slight left-right bias
            core = max(0.0, 1.0 - dist * 1.55)
            tone = 18 + int(165 * (core**1.35)) + int(rand() * 18)
            tone = max(12, min(210, tone))
            alpha = int(210 + 45 * core) if core > 0.15 else int(120 + 80 * core)

            jitter = 0.08 if dist > 0.35 else 0.04
            pts = _hex_corners(hx, hy, tile_size * 0.92, jitter, rand)

            # Face
            td.polygon(pts, fill=(tone, tone + 1, tone + 3, alpha))
            # Hairline edge — lighter on the lit side
            edge_a = int(40 + 90 * core)
            td.line(pts + [pts[0]], fill=(230, 232, 236, edge_a), width=max(1, scale // 2))

            # Specular corner tick on brighter tiles
            if core > 0.45 and rand() > 0.55:
                p0, p1 = pts[0], pts[1]
                mx = (p0[0] + p1[0]) / 2
                my = (p0[1] + p1[1]) / 2
                td.line(
                    [(p0[0], p0[1]), (mx, my)],
                    fill=(255, 255, 255, int(90 + 80 * core)),
                    width=scale,
                )

    img = Image.alpha_composite(img, tiles_layer)

    # Soft focal bloom at the assemblage center
    bloom = Image.new("RGBA", (rw, rh), (0, 0, 0, 0))
    bd = ImageDraw.Draw(bloom)
    for i in range(22, 0, -1):
        rad = (min(rw, rh) * 0.18) * (i / 22)
        a = int(90 * ((1 - i / 22) ** 1.6))
        bd.ellipse([cx - rad, cy - rad * 0.85, cx + rad, cy + rad * 0.85], fill=(255, 255, 255, a))
    bloom = bloom.filter(ImageFilter.GaussianBlur(radius=22))
    img = Image.alpha_composite(img, bloom)

    # Fine dust motes (not city particles — sparse, quiet)
    dust = Image.new("RGBA", (rw, rh), (0, 0, 0, 0))
    dd = ImageDraw.Draw(dust)
    for _ in range(90):
        x = rand() * rw
        y = rand() * rh
        ddx = (x - cx) / rw
        ddy = (y - cy) / rh
        d = math.sqrt(ddx * ddx + ddy * ddy)
        if d > 0.65:
            continue
        r = (0.6 + rand() * 1.6) * scale
        a = int(40 + 120 * (1 - d) * rand())
        dd.ellipse([x - r, y - r, x + r, y + r], fill=(240, 242, 245, a))
    img = Image.alpha_composite(img, dust)

    # Gentle vignette so the panel reads as a framed field
    vig = Image.new("L", (rw, rh), 0)
    vd = ImageDraw.Draw(vig)
    for i in range(50, 0, -1):
        radx = (rw * 0.78) * (i / 50)
        rady = (rh * 0.88) * (i / 50)
        val = int(255 * (1 - (i / 50) ** 1.7) * 0.5)
        vd.ellipse([cx - radx, cy - rady, cx + radx, cy + rady], fill=val)
    black = Image.new("RGBA", (rw, rh), (0, 0, 0, 255))
    black.putalpha(vig)
    img = Image.alpha_composite(img, black)

    return img.convert("RGB").resize((width, height), Image.Resampling.LANCZOS)


def draw_logo(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    logo_w: int,
    barcode_h: int,
    word_font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
) -> int:
    """Barcode + spaced MOSAIC wordmark. Returns total height used."""
    scale = logo_w / VB_W
    for bx, bw in BARS:
        left = x + bx * scale
        right = left + bw * scale
        draw.rectangle([left, y, right, y + barcode_h], fill=INK)

    letters = list("MOSAIC")
    gap = 6
    word_y = y + barcode_h + gap
    bbox = draw.textbbox((0, 0), "M", font=word_font)
    letter_h = bbox[3] - bbox[1]
    letter_boxes = [draw.textbbox((0, 0), ch, font=word_font) for ch in letters]
    letter_widths = [b[2] - b[0] for b in letter_boxes]
    total_letters = sum(letter_widths)
    remaining = max(0, logo_w - total_letters)
    slot = remaining / (len(letters) - 1) if len(letters) > 1 else 0
    cursor = float(x)
    for ch, lw in zip(letters, letter_widths):
        draw.text((cursor, word_y), ch, font=word_font, fill=INK)
        cursor += lw + slot

    return barcode_h + gap + letter_h


def draw_pill(
    draw: ImageDraw.ImageDraw,
    text: str,
    x: int,
    y: int,
    width: int,
    height: int,
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
) -> None:
    radius = height // 2
    draw.rounded_rectangle(
        [x, y, x + width, y + height],
        radius=radius,
        fill=(17, 17, 17, 255),
    )
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = x + (width - tw) / 2
    ty = y + (height - th) / 2 - 1
    draw.text((tx, ty), text, font=font, fill=WHITE)


def build() -> Image.Image:
    right_w = W - SPLIT
    right = render_mosaic_panel(right_w, H)

    canvas = Image.new("RGB", (W, H), MINT)
    canvas.paste(right, (SPLIT, 0))

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay, "RGBA")

    font_candidates = [
        str(ARMATA),
        str(LINKEDIN_FONTS),
        r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\segoeui.ttf",
    ]
    word_font = load_font(font_candidates, 17)
    h1_font = load_font(font_candidates, 34)
    pill_font = load_font(font_candidates, 13)

    # Brand mark — centered in left panel, top
    logo_w = 176
    logo_x = int((SPLIT - logo_w) / 2)
    logo_y = 56
    logo_h = draw_logo(draw, logo_x, logo_y, logo_w, barcode_h=24, word_font=word_font)

    line1, line2 = "Ready to reshape", "your future?"
    l1 = draw.textbbox((0, 0), line1, font=h1_font)
    h1_line = (l1[3] - l1[1]) + 4
    headline_w = max(
        draw.textbbox((0, 0), line1, font=h1_font)[2],
        draw.textbbox((0, 0), line2, font=h1_font)[2],
    )
    headline_h = h1_line * 2

    # Stack pills under the headline for cleaner 16:9 reading (not beside)
    pill_labels = ["marketing", "ai"]
    pill_pad_x, pill_pad_y = 18, 8
    pill_gap = 8
    widest = tallest = 0
    for label in pill_labels:
        bb = draw.textbbox((0, 0), label, font=pill_font)
        widest = max(widest, bb[2] - bb[0])
        tallest = max(tallest, bb[3] - bb[1])
    pill_w = widest + pill_pad_x * 2
    pill_h = tallest + pill_pad_y * 2

    gap_after_headline = 28
    pills_row_w = pill_w * 2 + pill_gap
    block_w = max(headline_w, pills_row_w)
    block_h = headline_h + gap_after_headline + pill_h

    content_top = logo_y + logo_h + 40
    content_bottom = H - 48
    available = content_bottom - content_top
    block_left = int((SPLIT - block_w) / 2)
    block_top = content_top + max(0, int((available - block_h) * 0.28))

    # Headline centered under logo
    h1_x = int((SPLIT - headline_w) / 2)
    draw.text((h1_x, block_top), line1, font=h1_font, fill=INK)
    draw.text((h1_x, block_top + h1_line), line2, font=h1_font, fill=INK)

    pills_x = int((SPLIT - pills_row_w) / 2)
    pills_y = int(block_top + headline_h + gap_after_headline)
    for i, label in enumerate(pill_labels):
        draw_pill(draw, label, pills_x + i * (pill_w + pill_gap), pills_y, pill_w, pill_h, pill_font)

    return Image.alpha_composite(canvas.convert("RGBA"), overlay).convert("RGB")


def main() -> None:
    final = build()
    assert final.size == (W, H)
    ROOT.mkdir(parents=True, exist_ok=True)

    out_png = ROOT / "mosaic-gbp-cover-1080x608.png"
    out_jpg = ROOT / "mosaic-gbp-cover-1080x608.jpg"
    final.save(out_png, "PNG", optimize=True)
    final.convert("RGB").save(out_jpg, "JPEG", quality=92, optimize=True, progressive=True)

    downloads = Path.home() / "Downloads"
    for src in (out_png, out_jpg):
        dest = downloads / src.name
        dest.write_bytes(src.read_bytes())
        print(f"downloads {dest} {dest.stat().st_size} {final.size}")

    print(f"saved {out_png} {final.size}")


if __name__ == "__main__":
    main()
