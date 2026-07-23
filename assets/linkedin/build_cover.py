"""Build Mosaic LinkedIn Page cover at exact 4200x700 (6:1)."""

from __future__ import annotations

import math
import os
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent
SOURCE = Path(
    r"C:\Users\skyes\.cursor\projects\c-Users-skyes-Projects-understory-marketing-site"
    r"\assets\mosaic-linkedin-cover-source.png"
)
OUT = ROOT / "mosaic-linkedin-page-cover-4200x700.png"
PREVIEW = ROOT / "mosaic-linkedin-page-cover-preview.png"

W, H = 4200, 700
INK = (13, 13, 13)
MUTED = (100, 100, 100)

# Mosaic barcode bars from MosaicLogo.tsx (viewBox 0 0 168 30)
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


def mist_field(width: int, height: int, sample: Image.Image) -> Image.Image:
    """Soft panoramic mist from a photo sample (no typography)."""
    edge = sample.resize((max(64, sample.width // 8), height), Image.Resampling.BILINEAR)
    mist = edge.resize((width, height), Image.Resampling.BILINEAR)
    mist = mist.filter(ImageFilter.GaussianBlur(radius=56))
    px = mist.load()
    random.seed(11)
    for y in range(height):
        for x in range(width):
            r, g, b = px[x, y]
            wave = int(10 * math.sin(x * 0.0018 + y * 0.012))
            lift = int(18 * (1 - abs((x / max(1, width - 1)) - 0.35)))
            n = random.randint(-5, 5)
            px[x, y] = (
                max(0, min(255, r + wave + lift + n)),
                max(0, min(255, g + int(wave * 0.8) + lift + n)),
                max(0, min(255, b + int(wave * 0.5) + lift + n)),
            )
    return mist


def build_base(src: Image.Image) -> Image.Image:
    src = src.convert("RGB")
    # Keep only mountain photography — discard source typography (left ~55%)
    photo = src.crop((int(src.width * 0.58), 0, src.width, src.height))
    # Extra safety: blur any residual glyphs on the photo's left edge
    edge = photo.crop((0, 0, min(90, photo.width), photo.height)).filter(
        ImageFilter.GaussianBlur(radius=12)
    )
    photo.paste(edge, (0, 0))

    scale = H / photo.height
    photo = photo.resize((max(1, int(photo.width * scale)), H), Image.Resampling.LANCZOS)

    # Mist plate across full banner from foggiest strip of photo
    fog_sample = photo.crop((0, 0, min(180, photo.width), H))
    canvas = mist_field(W, H, fog_sample)

    # Anchor mountains on the far right with a soft left fade into mist
    x = W - photo.width + int(W * 0.02)
    photo_rgba = photo.convert("RGBA")
    fade_w = min(640, max(1, photo.width * 2 // 3))
    alpha = Image.new("L", (photo.width, H), 255)
    ad = ImageDraw.Draw(alpha)
    for i in range(fade_w):
        a = int(255 * (i / fade_w) ** 1.25)
        ad.line([(i, 0), (i, H)], fill=a)
    photo_rgba.putalpha(alpha)

    out = canvas.convert("RGBA")
    out.alpha_composite(photo_rgba, (x, 0))
    return out.convert("RGB")


def draw_brand(canvas: Image.Image) -> Image.Image:
    img = canvas.convert("RGBA")
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    # Clear of LinkedIn page logo overlay (bottom-left circle)
    brand_left = int(W * 0.095)
    brand_top = int(H * 0.16)
    barcode_w = 720
    scale = barcode_w / VB_W
    barcode_h = int(barcode_w * (30 / 168) * 1.28)

    for bx, bw in BARS:
        x0 = brand_left + int(bx * scale)
        x1 = brand_left + int((bx + bw) * scale)
        draw.rectangle([x0, brand_top, x1, brand_top + barcode_h], fill=(*INK, 255))

    word_font = load_font([r"C:\Windows\Fonts\arial.ttf", r"C:\Windows\Fonts\segoeui.ttf"], 58)
    ai_font = load_font([r"C:\Windows\Fonts\arial.ttf", r"C:\Windows\Fonts\segoeui.ttf"], 30)
    tag_font = load_font(
        [r"C:\Windows\Fonts\GARA.TTF", r"C:\Windows\Fonts\georgia.ttf", r"C:\Windows\Fonts\times.ttf"],
        46,
    )
    url_font = load_font([r"C:\Windows\Fonts\arial.ttf", r"C:\Windows\Fonts\segoeui.ttf"], 24)

    letters = list("MOSAIC")
    gap_top = brand_top + barcode_h + 24
    letter_ws = []
    for ch in letters:
        b = draw.textbbox((0, 0), ch, font=word_font)
        letter_ws.append(b[2] - b[0])
    total = sum(letter_ws)
    space = (barcode_w - total) / (len(letters) - 1)
    x = float(brand_left)
    for i, ch in enumerate(letters):
        draw.text((x, gap_top), ch, font=word_font, fill=(*INK, 255))
        x += letter_ws[i] + space

    ai_x = brand_left + barcode_w + 16
    ai_y = gap_top + 16
    draw.text((ai_x, ai_y), "AI", font=ai_font, fill=(*INK, 210))

    tagline = "Ready to reshape your future?"
    tag_y = gap_top + 92
    draw.text((brand_left, tag_y), tagline, font=tag_font, fill=(*INK, 255))

    url_y = tag_y + 68
    draw.text((brand_left, url_y), "hellomosaic.ai", font=url_font, fill=(*MUTED, 255))

    # Soft scrim for legibility — no hard card edge
    tag_w = draw.textbbox((0, 0), tagline, font=tag_font)[2]
    block_w = max(barcode_w + 90, tag_w + 8)
    pad_x, pad_y = 56, 44
    scrim = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(scrim)
    sd.ellipse(
        [
            brand_left - pad_x,
            brand_top - pad_y,
            brand_left + block_w + pad_x * 2,
            url_y + 50 + pad_y,
        ],
        fill=(250, 250, 248, 165),
    )
    scrim = scrim.filter(ImageFilter.GaussianBlur(radius=34))

    out = Image.alpha_composite(img, scrim)
    out = Image.alpha_composite(out, layer)
    return out.convert("RGB")


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Missing source image: {SOURCE}")

    final = draw_brand(build_base(Image.open(SOURCE)))
    assert final.size == (W, H)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    final.save(OUT, "PNG", optimize=True)
    preview = final.resize((1680, 280), Image.Resampling.LANCZOS)
    preview.save(PREVIEW, "PNG", optimize=True)
    print(f"saved {OUT} {final.size}")
    print(f"preview {PREVIEW} {preview.size}")


if __name__ == "__main__":
    main()
