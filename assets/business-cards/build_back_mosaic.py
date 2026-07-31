"""Mosaic business card BACK — logos left + 4-tile work mosaic right.

Staples print file:
  Full bleed  3.75\" x 2.25\" @ 300 DPI = 1125 x 675
  Trim        3.5\"  x 2\"    @ 300 DPI = 1050 x 600
  Safe zone   keep content ≥0.125\" inside trim
"""

from __future__ import annotations

import os
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent
LOGOS = ROOT / "logos"
WORK = ROOT.parent.parent / "public" / "work"

# Staples upload size (includes 0.125\" bleed on every side)
W, H = 1125, 675
TRIM_W, TRIM_H = 1050, 600
BLEED = (W - TRIM_W) // 2  # 37–38 px
DPI = 300

WHITE = (255, 255, 255)
BLACK = (12, 12, 12)
INK = (17, 17, 17)

# Split: left logos panel / right mosaic (measured inside trim)
SPLIT = 0.42  # left width fraction
# Safe inset inside the trim box so Staples edge trim doesn't clip art
PAD = 48
GAP = 10
RADIUS = 14

HEADER = "Brands We've Worked With"
SUPPLY_MONO = ROOT / "fonts" / "supply" / "PPSupplyMono-Regular.otf"
SUPPLY_SANS = ROOT / "fonts" / "supply" / "PPSupplySans-Regular.otf"
ARMATA = ROOT.parent / "linkedin" / "fonts" / "Armata-Regular.ttf"
ARMATA_PUBLIC = ROOT.parent.parent / "public" / "fonts" / "armata.ttf"

LOGO_FILES = [
    LOGOS / "official_gucci.png",
    LOGOS / "official_cabelas.png",
    LOGOS / "official_basspro.png",
    LOGOS / "official_redrobin.png",
]

# Four strongest carousel frames — one glance of Mosaic's range
# All tiles cover-crop full-bleed so the mosaic reads as one system
TILES = [
    {"path": WORK / "gucci" / "models-turquoise.png", "fit": "cover", "focus_y": 0.45},
    {
        "path": WORK / "red-robin" / "big-yumm-deals-1x1.png",
        "fit": "cover",
        "focus_y": 0.5,
    },
    {
        "path": WORK / "bass-pro" / "archery-catalog-2026.png",
        "fit": "cover",
        "focus_y": 1.0,  # keep buck + ARCHERY title / logos
    },
    {
        "path": WORK / "bass-pro" / "marine-catalog-2026.png",
        "fit": "zoom",
        "zoom": 0.92,
        "focus_y": 1.0,  # pin to bottom — full BPS oval + MARINE
        "fill": (5, 8, 18),
    },
]


def load_font(size: int, fancy: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = []
    if fancy:
        candidates.extend(
            [
                str(SUPPLY_MONO),
                str(SUPPLY_SANS),
                str(ARMATA),
                str(ARMATA_PUBLIC),
                r"C:\Windows\Fonts\seguisb.ttf",
                r"C:\Windows\Fonts\segoeuil.ttf",
                r"C:\Windows\Fonts\calibril.ttf",
                r"C:\Windows\Fonts\georgia.ttf",
            ]
        )
    candidates.extend(
        [
            r"C:\Windows\Fonts\arial.ttf",
            r"C:\Windows\Fonts\consola.ttf",
        ]
    )
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    """Antialiased rounded-rect alpha mask (supersampled)."""
    scale = 4
    sw, sh = size[0] * scale, size[1] * scale
    big = Image.new("L", (sw, sh), 0)
    ImageDraw.Draw(big).rounded_rectangle(
        (0, 0, sw - 1, sh - 1), radius=max(1, radius * scale), fill=255
    )
    return big.resize(size, Image.Resampling.LANCZOS)


def hide_johnny_morris(im: Image.Image) -> Image.Image:
    """Remove Johnny Morris cursive above the BPS oval — ink pixels only."""
    src = im.convert("RGB").copy()
    arr = np.array(src)
    h, w = arr.shape[:2]
    left = arr[:, : int(w * 0.5)]
    yellow = (
        (left[:, :, 0] > 180)
        & (left[:, :, 1] > 130)
        & (left[:, :, 2] < 130)
        & (left[:, :, 0].astype(int) - left[:, :, 2] > 60)
    )
    counts = yellow.sum(axis=1)
    rows = np.where((counts >= 10) & (np.arange(h) > int(h * 0.55)))[0]
    if len(rows) == 0:
        return src
    oval_top = int(rows[0])
    y0, y1 = max(0, oval_top - 26), max(0, oval_top - 2)
    x0, x1 = int(w * 0.05), int(w * 0.40)
    band = arr[y0:y1, x0:x1].copy()
    lum = band.mean(axis=2)
    keep = (
        ((band[:, :, 0] > 160) & (band[:, :, 1] > 100) & (band[:, :, 2] < 130))
        | ((band[:, :, 0] > 140) & (band[:, :, 1] < 100) & (band[:, :, 2] < 100))
    )
    # Light ink on photo (white signature + soft AA)
    ink = (
        (lum > 85)
        & (np.abs(band[:, :, 0].astype(int) - band[:, :, 1]) < 50)
        & (np.abs(band[:, :, 1].astype(int) - band[:, :, 2]) < 50)
        & ~keep
    )
    if not ink.any():
        return src
    # Dilate ink 1px so AA fringe goes with it
    ink_u8 = ink.astype(np.uint8) * 255
    ink = np.array(Image.fromarray(ink_u8, "L").filter(ImageFilter.MaxFilter(3))) > 0
    ink &= ~keep
    # Per-column fill from clean photo just above the signature band
    above_y = max(0, y0 - 6)
    col_fill = arr[above_y, x0:x1].astype(np.float32)
    # Also average a few rows above for stability
    if y0 >= 3:
        col_fill = arr[y0 - 5 : y0 - 1, x0:x1].mean(axis=0)
    ys, xs = np.where(ink)
    for y, x in zip(ys, xs):
        band[y, x] = col_fill[x]
    arr[y0:y1, x0:x1] = band
    return Image.fromarray(arr)


def fix_marine_year(im: Image.Image) -> Image.Image:
    """Clear the clipped year above MARINE and redraw a crisp 2026."""
    src = im.convert("RGB").copy()
    arr = np.array(src)
    h, w = arr.shape[:2]
    right = arr[:, int(w * 0.35) : int(w * 0.95)]
    white = (right[:, :, 0] > 200) & (right[:, :, 1] > 200) & (right[:, :, 2] > 200)
    counts = white.sum(axis=1)
    marine_rows = np.where((counts >= 25) & (np.arange(h) > int(h * 0.75)))[0]
    if len(marine_rows) == 0:
        return src
    marine_top = int(marine_rows[0])
    # Remove only light year glyphs (avoid flat wipe boxes on the photo)
    y0, y1 = max(0, marine_top - 15), marine_top - 1
    x0, x1 = int(w * 0.38), int(w * 0.54)
    band = arr[y0:y1, x0:x1].copy()
    lum = band.mean(axis=2)
    # wipe any light year ink + mid AA
    sig = (lum > 50) & (np.abs(band[:, :, 0].astype(int) - band[:, :, 1]) < 50) & (
        np.abs(band[:, :, 1].astype(int) - band[:, :, 2]) < 50
    )
    for yy in range(band.shape[0]):
        row = band[yy]
        mask = sig[yy]
        if not mask.any():
            continue
        dark = row[~mask & (row.mean(axis=1) < 80)]
        fill = dark.mean(axis=0) if len(dark) else row.mean(axis=0)
        row[mask] = fill
        band[yy] = row
    arr[y0:y1, x0:x1] = band
    out = Image.fromarray(arr)
    draw = ImageDraw.Draw(out)
    font = None
    for path, size in [
        (r"C:\Windows\Fonts\arialbd.ttf", 14),
        (r"C:\Windows\Fonts\seguisb.ttf", 14),
        (r"C:\Windows\Fonts\arial.ttf", 14),
    ]:
        if os.path.exists(path):
            font = ImageFont.truetype(path, size)
            break
    if font is None:
        font = ImageFont.load_default()
    text = "2026"
    bbox = draw.textbbox((0, 0), text, font=font)
    th = bbox[3] - bbox[1]
    tx = int(w * 0.40)
    ty = marine_top - th - 2
    draw.text((tx, ty), text, font=font, fill=(250, 250, 250))
    return out


def cover_crop(im: Image.Image, tw: int, th: int, focus_y: float = 0.5) -> Image.Image:
    """Scale to cover tile, crop with vertical focus (0=top, 1=bottom)."""
    src = im.convert("RGB")
    sw, sh = src.size
    scale = max(tw / sw, th / sh)
    nw, nh = max(1, int(round(sw * scale))), max(1, int(round(sh * scale)))
    resized = src.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    max_top = max(0, nh - th)
    top = int(round(max_top * focus_y))
    top = max(0, min(max_top, top))
    return resized.crop((left, top, left + tw, top + th))


def contain_pad(
    im: Image.Image, tw: int, th: int, fill: tuple[int, int, int]
) -> Image.Image:
    """Scale to fit entirely inside the tile; pad with fill color."""
    src = im.convert("RGB")
    sw, sh = src.size
    scale = min(tw / sw, th / sh)
    nw, nh = max(1, int(round(sw * scale))), max(1, int(round(sh * scale)))
    resized = src.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (tw, th), fill)
    canvas.paste(resized, ((tw - nw) // 2, (th - nh) // 2))
    return canvas


def zoom_fit(
    im: Image.Image,
    tw: int,
    th: int,
    zoom: float = 0.5,
    fill: tuple[int, int, int] = (0, 0, 0),
    focus_y: float = 0.5,
) -> Image.Image:
    """Blend cover→contain. zoom=1 cover (tight), zoom=0 contain (full image)."""
    src = im.convert("RGB")
    sw, sh = src.size
    cover = max(tw / sw, th / sh)
    contain = min(tw / sw, th / sh)
    z = max(0.0, min(1.0, zoom))
    scale = contain + (cover - contain) * z
    nw, nh = max(1, int(round(sw * scale))), max(1, int(round(sh * scale)))
    resized = src.resize((nw, nh), Image.Resampling.LANCZOS)

    # Crop any overflow, pad any shortfall
    if nw > tw or nh > th:
        left = max(0, (nw - tw) // 2)
        max_top = max(0, nh - th)
        top = int(round(max_top * focus_y)) if max_top else 0
        top = max(0, min(max_top, top))
        crop_w = min(tw, nw)
        crop_h = min(th, nh)
        resized = resized.crop((left, top, left + crop_w, top + crop_h))
        nw, nh = resized.size

    canvas = Image.new("RGB", (tw, th), fill)
    canvas.paste(resized, ((tw - nw) // 2, (th - nh) // 2))
    return canvas


def flatten_logo_on_white(im: Image.Image) -> Image.Image:
    """Composite RGBA logos onto opaque white before any resize.

    Soft alpha / black-under-transparent mattes (Cabela's shadow, Red Robin)
    print as a ghosty halo on Staples RIP. Flattening at native res, then
    resizing as RGB, keeps edges print-clean on a white card.
    """
    src = im.convert("RGBA")
    arr = np.array(src)
    rgb = arr[:, :, :3].astype(np.float32)
    alpha = arr[:, :, 3].astype(np.float32) / 255.0
    flat = rgb * alpha[..., None] + 255.0 * (1.0 - alpha[..., None])
    out = flat.clip(0, 255).astype(np.uint8)
    # Kill residual near-white ghost plate from soft shadows / AA
    lum = out.mean(axis=2)
    out[lum >= 250] = (255, 255, 255)
    return Image.fromarray(out, "RGB")


def fit_contain(im: Image.Image, max_w: int, max_h: int) -> Image.Image:
    # Always flatten first so LANCZOS never blends black-matte transparent pixels
    src = flatten_logo_on_white(im)
    sw, sh = src.size
    scale = min(max_w / sw, max_h / sh)
    nw, nh = max(1, int(round(sw * scale))), max(1, int(round(sh * scale)))
    return src.resize((nw, nh), Image.Resampling.LANCZOS)


def draw_header_bar(canvas: Image.Image, x: int, y: int, width: int, height: int) -> None:
    """Black soft-rect CTA pill with Supply Mono, white label (AA corners)."""
    # Supersample the pill so rounded corners don't stair-step on white
    scale = 4
    sw, sh = width * scale, height * scale
    pill = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
    radius = max(12, height // 3) * scale
    ImageDraw.Draw(pill).rounded_rectangle(
        [0, 0, sw - 1, sh - 1], radius=radius, fill=(17, 17, 17, 255)
    )
    pill = pill.resize((width, height), Image.Resampling.LANCZOS)
    canvas.paste(pill, (x, y), pill)

    draw = ImageDraw.Draw(canvas)
    size = 20
    font = load_font(size, fancy=True)
    bb = draw.textbbox((0, 0), HEADER, font=font)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    # Mono runs wider — shrink until it fits with padding
    while tw > width - 22 and size > 12:
        size -= 1
        font = load_font(size, fancy=True)
        bb = draw.textbbox((0, 0), HEADER, font=font)
        tw, th = bb[2] - bb[0], bb[3] - bb[1]
    tx = x + (width - tw) / 2 - bb[0]
    ty = y + (height - th) / 2 - bb[1] - 0.5
    draw.text((tx, ty), HEADER, font=font, fill=WHITE)


def paste_centered(canvas: Image.Image, im: Image.Image, box: tuple[int, int, int, int]) -> None:
    x0, y0, x1, y1 = box
    bw, bh = x1 - x0, y1 - y0
    fitted = fit_contain(im, bw, bh)  # opaque RGB — no alpha paste
    px = x0 + (bw - fitted.width) // 2
    py = y0 + (bh - fitted.height) // 2
    canvas.paste(fitted, (px, py))


def build_back() -> Image.Image:
    # Full-bleed white canvas (Staples trims the outer 0.125\")
    canvas = Image.new("RGB", (W, H), WHITE)
    ox, oy = BLEED, BLEED  # trim origin

    left_w = int(TRIM_W * SPLIT)
    right_x = ox + left_w
    right_w = TRIM_W - left_w

    # --- LEFT: header + 2x2 logos (inside trim + safe pad) ---
    header_h = 44
    header_x = ox + PAD
    header_y = oy + PAD
    header_w = left_w - PAD * 2
    draw_header_bar(canvas, header_x, header_y, header_w, header_h)

    logo_top = header_y + header_h + 14
    logo_bot = oy + TRIM_H - PAD
    logo_left = ox + PAD
    logo_right = ox + left_w - PAD
    cell_w = (logo_right - logo_left - GAP) // 2
    cell_h = (logo_bot - logo_top - GAP) // 2

    for i, path in enumerate(LOGO_FILES):
        if not path.exists():
            raise FileNotFoundError(path)
        col, row = i % 2, i // 2
        x0 = logo_left + col * (cell_w + GAP)
        y0 = logo_top + row * (cell_h + GAP)
        inset = 4
        paste_centered(
            canvas,
            Image.open(path),
            (x0 + inset, y0 + inset, x0 + cell_w - inset, y0 + cell_h - inset),
        )

    # Subtle vertical divider (inside trim)
    ImageDraw.Draw(canvas).rectangle(
        [right_x - 1, oy + PAD + 8, right_x, oy + TRIM_H - PAD - 8],
        fill=(220, 220, 220),
    )

    # --- RIGHT: 2x2 work mosaic ---
    mosaic_pad = PAD
    cols, rows = 2, 2
    area_x = right_x + mosaic_pad
    area_y = oy + mosaic_pad
    area_w = right_w - mosaic_pad * 2
    area_h = TRIM_H - mosaic_pad * 2
    tile_w = (area_w - GAP) // cols
    tile_h = (area_h - GAP) // rows
    grid_w = tile_w * cols + GAP
    grid_h = tile_h * rows + GAP
    gx = area_x + (area_w - grid_w) // 2
    gy = area_y + (area_h - grid_h) // 2
    mask = rounded_mask((tile_w, tile_h), RADIUS)

    for i, tile_spec in enumerate(TILES):
        path = tile_spec["path"]
        if not path.exists():
            raise FileNotFoundError(path)
        col, row = i % cols, i // cols
        x = gx + col * (tile_w + GAP)
        y = gy + row * (tile_h + GAP)
        src = Image.open(path)
        trim_top = int(tile_spec.get("trim_top", 0) or 0)
        if trim_top > 0:
            src = src.crop((0, trim_top, src.width, src.height))
        if tile_spec.get("hide_sig"):
            src = hide_johnny_morris(src)
        if tile_spec.get("fix_marine_year"):
            src = fix_marine_year(src)
        fit = tile_spec.get("fit", "cover")
        if fit == "contain":
            tile = contain_pad(src, tile_w, tile_h, tile_spec.get("fill", (0, 0, 0)))
        elif fit == "zoom":
            tile = zoom_fit(
                src,
                tile_w,
                tile_h,
                zoom=float(tile_spec.get("zoom", 0.5)),
                fill=tile_spec.get("fill", (0, 0, 0)),
                focus_y=float(tile_spec.get("focus_y", 0.45)),
            )
        else:
            tile = cover_crop(src, tile_w, tile_h, focus_y=tile_spec.get("focus_y", 0.5))
        rgba = tile.convert("RGBA")
        rgba.putalpha(mask)
        canvas.paste(WHITE, (x, y, x + tile_w, y + tile_h))
        canvas.paste(rgba, (x, y), rgba)

    return canvas


def main() -> None:
    back = build_back()
    assert back.size == (W, H)
    png = ROOT / "mosaic-business-card-back-v3-staples-1125x675.png"
    jpg = ROOT / "mosaic-business-card-back-v3-staples-1125x675.jpg"
    # Keep trim-size preview for local review
    trim = back.crop((BLEED, BLEED, BLEED + TRIM_W, BLEED + TRIM_H))
    trim_png = ROOT / "mosaic-business-card-back-v3-1050x600.png"
    back.save(png, "PNG", optimize=True, dpi=(DPI, DPI))
    back.save(jpg, "JPEG", quality=95, optimize=True, dpi=(DPI, DPI))
    trim.save(trim_png, "PNG", optimize=True, dpi=(DPI, DPI))
    desktop = Path.home() / "Desktop" / png.name
    desktop.write_bytes(png.read_bytes())
    print(f"saved {png}  (UPLOAD THIS TO STAPLES)")
    print(f"saved {jpg}")
    print(f"saved {trim_png}  (trim preview)")
    print(f"saved {desktop}")
    print(f"bleed canvas {W}x{H} @ {DPI}dpi | trim {TRIM_W}x{TRIM_H} | safe pad {PAD}px")


if __name__ == "__main__":
    main()
