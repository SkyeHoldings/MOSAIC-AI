"""Mosaic business cards — front (brand) + back (contact).

Standard US card: 3.5" x 2" at 300 DPI = 1050 x 600 px (trim).
Also exports a 2x preview-friendly set.
"""

from __future__ import annotations

import math
import os
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent
ARMATA = ROOT.parent / "linkedin" / "fonts" / "Armata-Regular.ttf"

# 3.5" x 2" @ 300 DPI
W, H = 1050, 600
MINT = (236, 235, 232)
INK = (17, 17, 17)
MUTED = (55, 55, 55)
WHITE = (255, 255, 255)

NAME = "Skye Smith"
PHONE = "208 819 2549"
EMAIL = "skye@hellomosaic.ai"
URL = "hellomosaic.ai"

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


def font_candidates() -> list[str]:
    return [
        str(ARMATA),
        r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\segoeui.ttf",
    ]


def seeded_random(seed: int):
    s = seed

    def rand() -> float:
        nonlocal s
        s = (s * 16807) % 2147483647
        return (s - 1) / 2147483646

    return rand


def _hex_center(col: int, row: int, size: float) -> tuple[float, float]:
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


def render_mosaic_panel(width: int, height: int, seed: int = 91) -> Image.Image:
    """Tessellated mosaic field — luminous core assembling from irregular tiles."""
    rand = seeded_random(seed)
    scale = 2
    rw, rh = width * scale, height * scale
    img = Image.new("RGB", (rw, rh), (8, 9, 11))
    draw = ImageDraw.Draw(img, "RGBA")

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
            dx = (hx - cx) / rw
            dy = (hy - cy) / rh
            dist = math.sqrt(dx * dx + dy * dy)
            if dist > 0.72 and rand() > 0.55:
                continue
            if dist > 0.55 and rand() > 0.78:
                continue

            core = max(0.0, 1.0 - dist * 1.55)
            tone = 18 + int(165 * (core**1.35)) + int(rand() * 18)
            tone = max(12, min(210, tone))
            alpha = int(210 + 45 * core) if core > 0.15 else int(120 + 80 * core)

            jitter = 0.08 if dist > 0.35 else 0.04
            pts = _hex_corners(hx, hy, tile_size * 0.92, jitter, rand)

            td.polygon(pts, fill=(tone, tone + 1, tone + 3, alpha))
            edge_a = int(40 + 90 * core)
            td.line(pts + [pts[0]], fill=(230, 232, 236, edge_a), width=max(1, scale // 2))

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

    bloom = Image.new("RGBA", (rw, rh), (0, 0, 0, 0))
    bd = ImageDraw.Draw(bloom)
    for i in range(22, 0, -1):
        rad = (min(rw, rh) * 0.18) * (i / 22)
        a = int(90 * ((1 - i / 22) ** 1.6))
        bd.ellipse([cx - rad, cy - rad * 0.85, cx + rad, cy + rad * 0.85], fill=(255, 255, 255, a))
    bloom = bloom.filter(ImageFilter.GaussianBlur(radius=22))
    img = Image.alpha_composite(img, bloom)

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
    fill=INK,
) -> int:
    """Barcode + spaced MOSAIC wordmark. Returns total height used."""
    scale = logo_w / VB_W
    for bx, bw in BARS:
        left = x + bx * scale
        right = left + bw * scale
        draw.rectangle([left, y, right, y + barcode_h], fill=fill)

    letters = list("MOSAIC")
    gap = max(4, int(barcode_h * 0.22))
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
        draw.text((cursor, word_y), ch, font=word_font, fill=fill)
        cursor += lw + slot

    return barcode_h + gap + letter_h


def build_front() -> Image.Image:
    """Brand face: mint + mosaic split with centered wordmark."""
    split = int(W * 0.52)
    right_w = W - split
    right = render_mosaic_panel(right_w, H, seed=91)

    canvas = Image.new("RGB", (W, H), MINT)
    canvas.paste(right, (split, 0))

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay, "RGBA")

    word_font = load_font(font_candidates(), 28)
    url_font = load_font(font_candidates(), 18)

    logo_w = 280
    barcode_h = 36
    logo_x = int((split - logo_w) / 2)
    # Vertically center logo block in mint panel
    probe_h = draw_logo(ImageDraw.Draw(Image.new("RGBA", (1, 1))), 0, 0, logo_w, barcode_h, word_font)
    url_bb = draw.textbbox((0, 0), URL, font=url_font)
    url_h = url_bb[3] - url_bb[1]
    gap_url = 28
    block_h = probe_h + gap_url + url_h
    logo_y = int((H - block_h) / 2) - 6

    draw_logo(draw, logo_x, logo_y, logo_w, barcode_h, word_font, fill=INK)

    url_w = url_bb[2] - url_bb[0]
    url_x = int((split - url_w) / 2)
    url_y = logo_y + probe_h + gap_url
    draw.text((url_x, url_y), URL, font=url_font, fill=MUTED)

    return Image.alpha_composite(canvas.convert("RGBA"), overlay).convert("RGB")


def build_back() -> Image.Image:
    """Contact face: mint field, name + details, small mark bottom-right."""
    canvas = Image.new("RGB", (W, H), MINT)
    # Soft mosaic strip along the left edge for continuity with front
    strip_w = 72
    mosaic = render_mosaic_panel(strip_w + 40, H, seed=73)
    canvas.paste(mosaic.crop((20, 0, 20 + strip_w, H)), (0, 0))

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay, "RGBA")

    name_font = load_font(font_candidates(), 42)
    detail_font = load_font(font_candidates(), 20)
    label_font = load_font(font_candidates(), 14)
    mark_font = load_font(font_candidates(), 12)

    pad_l = strip_w + 56
    pad_r = 56
    content_w = W - pad_l - pad_r

    # Name
    name_bb = draw.textbbox((0, 0), NAME, font=name_font)
    name_h = name_bb[3] - name_bb[1]

    # Hairline under name
    line_gap = 18
    details = [
        ("P", PHONE),
        ("E", EMAIL),
    ]
    detail_gap = 14
    detail_lines = []
    for label, value in details:
        lb = draw.textbbox((0, 0), label, font=label_font)
        vb = draw.textbbox((0, 0), value, font=detail_font)
        detail_lines.append((label, value, lb, vb))

    detail_h = sum((vb[3] - vb[1]) for *_, vb in detail_lines) + detail_gap * (len(detail_lines) - 1)
    block_h = name_h + line_gap + 1 + 22 + detail_h
    top = int((H - block_h) / 2) - 8

    draw.text((pad_l, top), NAME, font=name_font, fill=INK)
    line_y = top + name_h + line_gap
    draw.rectangle([pad_l, line_y, pad_l + min(120, content_w // 3), line_y + 1], fill=INK)

    y = line_y + 22
    for label, value, lb, vb in detail_lines:
        lh = lb[3] - lb[1]
        vh = vb[3] - vb[1]
        # Align label baseline-ish with value
        draw.text((pad_l, y + (vh - lh) // 2), label, font=label_font, fill=MUTED)
        draw.text((pad_l + 28, y), value, font=detail_font, fill=INK)
        y += vh + detail_gap

    # Small barcode mark bottom-right
    mark_w = 110
    mark_h = draw_logo(
        draw,
        W - pad_r - mark_w,
        H - 78,
        mark_w,
        barcode_h=14,
        word_font=mark_font,
        fill=INK,
    )

    return Image.alpha_composite(canvas.convert("RGBA"), overlay).convert("RGB")


def save_pair(front: Image.Image, back: Image.Image) -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    pairs = [
        ("mosaic-business-card-front-1050x600.png", front),
        ("mosaic-business-card-back-1050x600.png", back),
        ("mosaic-business-card-front-1050x600.jpg", front),
        ("mosaic-business-card-back-1050x600.jpg", back),
    ]
    downloads = Path.home() / "Downloads"
    for name, img in pairs:
        path = ROOT / name
        if name.endswith(".png"):
            img.save(path, "PNG", optimize=True)
        else:
            img.convert("RGB").save(path, "JPEG", quality=94, optimize=True, progressive=True)
        dest = downloads / name
        dest.write_bytes(path.read_bytes())
        print(f"saved {path} -> {dest} {img.size}")


def main() -> None:
    front = build_front()
    back = build_back()
    assert front.size == (W, H) and back.size == (W, H)
    save_pair(front, back)


if __name__ == "__main__":
    main()
