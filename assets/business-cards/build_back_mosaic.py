"""Mosaic business card BACK — logos left + 4-tile work mosaic right.

3.5\" x 2\" @ 300 DPI = 1050 x 600
"""

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
LOGOS = ROOT / "logos"
WORK = ROOT.parent.parent / "public" / "work"

W, H = 1050, 600
WHITE = (255, 255, 255)
BLACK = (12, 12, 12)
INK = (17, 17, 17)

# Split: left logos panel / right mosaic
SPLIT = 0.42  # left width fraction
PAD = 22
GAP = 10
RADIUS = 14

HEADER = "Brands We've Worked With"

LOGO_FILES = [
    LOGOS / "official_gucci.png",
    LOGOS / "official_cabelas.png",
    LOGOS / "official_basspro.png",
    LOGOS / "official_redrobin.png",
]

# Four strongest carousel frames — one glance of Mosaic's range
TILES = [
    WORK / "gucci" / "models-turquoise.png",
    WORK / "red-robin" / "big-yumm-deals.png",
    WORK / "red-robin" / "whiskey-river-wrap.png",
    WORK / "bass-pro-fishing-center.png",
]


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in (
        r"C:\Windows\Fonts\consola.ttf",
        r"C:\Windows\Fonts\cour.ttf",
        r"C:\Windows\Fonts\arial.ttf",
    ):
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255
    )
    return mask


def cover_crop(im: Image.Image, tw: int, th: int) -> Image.Image:
    src = im.convert("RGB")
    sw, sh = src.size
    scale = max(tw / sw, th / sh)
    nw, nh = max(1, int(round(sw * scale))), max(1, int(round(sh * scale)))
    resized = src.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return resized.crop((left, top, left + tw, top + th))


def fit_contain(im: Image.Image, max_w: int, max_h: int) -> Image.Image:
    src = im.convert("RGBA")
    sw, sh = src.size
    scale = min(max_w / sw, max_h / sh)
    nw, nh = max(1, int(round(sw * scale))), max(1, int(round(sh * scale)))
    return src.resize((nw, nh), Image.Resampling.LANCZOS)


def draw_header_bar(canvas: Image.Image, x: int, y: int, width: int, height: int) -> None:
    draw = ImageDraw.Draw(canvas)
    draw.rectangle([x, y, x + width, y + height], fill=BLACK)
    font = load_font(15)
    # tracked monospace label
    spacing = 1
    chars = list(HEADER)
    widths = [draw.textbbox((0, 0), ch, font=font)[2] for ch in chars]
    total = sum(widths) + spacing * (len(chars) - 1)
    tx = x + max(0, (width - total) // 2)
    ty = y + (height - 15) // 2 - 1
    for ch, cw in zip(chars, widths):
        draw.text((tx, ty), ch, font=font, fill=WHITE)
        tx += cw + spacing


def paste_centered(canvas: Image.Image, im: Image.Image, box: tuple[int, int, int, int]) -> None:
    x0, y0, x1, y1 = box
    bw, bh = x1 - x0, y1 - y0
    fitted = fit_contain(im, bw, bh)
    px = x0 + (bw - fitted.width) // 2
    py = y0 + (bh - fitted.height) // 2
    canvas.paste(fitted, (px, py), fitted if fitted.mode == "RGBA" else None)


def build_back() -> Image.Image:
    canvas = Image.new("RGB", (W, H), WHITE)

    left_w = int(W * SPLIT)
    right_x = left_w
    right_w = W - right_x

    # --- LEFT: header + 2x2 logos ---
    header_h = 44
    header_x = PAD
    header_y = PAD
    header_w = left_w - PAD * 2
    draw_header_bar(canvas, header_x, header_y, header_w, header_h)

    logo_top = header_y + header_h + 18
    logo_bot = H - PAD
    logo_left = PAD
    logo_right = left_w - PAD
    cell_w = (logo_right - logo_left - GAP) // 2
    cell_h = (logo_bot - logo_top - GAP) // 2

    for i, path in enumerate(LOGO_FILES):
        if not path.exists():
            raise FileNotFoundError(path)
        col, row = i % 2, i // 2
        x0 = logo_left + col * (cell_w + GAP)
        y0 = logo_top + row * (cell_h + GAP)
        # Inset so logos breathe inside cells
        inset = 8
        paste_centered(
            canvas,
            Image.open(path),
            (x0 + inset, y0 + inset, x0 + cell_w - inset, y0 + cell_h - inset),
        )

    # Subtle vertical divider
    ImageDraw.Draw(canvas).rectangle(
        [left_w - 1, PAD + 8, left_w, H - PAD - 8], fill=(220, 220, 220)
    )

    # --- RIGHT: 2x2 work mosaic ---
    mosaic_pad = PAD
    cols, rows = 2, 2
    area_x = right_x + mosaic_pad
    area_y = mosaic_pad
    area_w = right_w - mosaic_pad * 2
    area_h = H - mosaic_pad * 2
    tile_w = (area_w - GAP) // cols
    tile_h = (area_h - GAP) // rows
    grid_w = tile_w * cols + GAP
    grid_h = tile_h * rows + GAP
    ox = area_x + (area_w - grid_w) // 2
    oy = area_y + (area_h - grid_h) // 2
    mask = rounded_mask((tile_w, tile_h), RADIUS)

    for i, path in enumerate(TILES):
        if not path.exists():
            raise FileNotFoundError(path)
        col, row = i % cols, i // cols
        x = ox + col * (tile_w + GAP)
        y = oy + row * (tile_h + GAP)
        tile = cover_crop(Image.open(path), tile_w, tile_h)
        rgba = tile.convert("RGBA")
        rgba.putalpha(mask)
        canvas.paste(WHITE, (x, y, x + tile_w, y + tile_h))
        canvas.paste(rgba, (x, y), rgba)

    return canvas


def main() -> None:
    back = build_back()
    assert back.size == (W, H)
    png = ROOT / "mosaic-business-card-back-v3-1050x600.png"
    jpg = ROOT / "mosaic-business-card-back-v3-1050x600.jpg"
    back.save(png, "PNG", optimize=True)
    back.save(jpg, "JPEG", quality=95, optimize=True)
    desktop = Path.home() / "Desktop" / png.name
    desktop.write_bytes(png.read_bytes())
    print(f"saved {png}")
    print(f"saved {jpg}")
    print(f"saved {desktop}")


if __name__ == "__main__":
    main()
