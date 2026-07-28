"""Face-first GBP cover from headshot — elevated Mosaic atmosphere."""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "headshot-source.png"
SRC_FALLBACK = Path(
    r"C:\Users\skyes\.cursor\projects\c-Users-skyes-Projects-understory-marketing-site"
    r"\assets\c__Users_skyes_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images"
    r"_Current_Headshot-ce3a1f2d-d219-4988-9c78-77714e22e6e7.png"
)

W, H = 1080, 608


def seeded_random(seed: int):
    s = seed

    def rand() -> float:
        nonlocal s
        s = (s * 16807) % 2147483647
        return (s - 1) / 2147483646

    return rand


def cutout(rgb: Image.Image) -> Image.Image:
    """RGBA subject — key flat studio gray from top-band sample."""
    im = rgb.convert("RGB")
    arr = np.asarray(im, dtype=np.float32)
    h, w, _ = arr.shape
    top = arr[: max(24, h // 10), :, :]
    bg = top.reshape(-1, 3).mean(axis=0)
    dist = np.sqrt(((arr - bg) ** 2).sum(axis=2))

    alpha = np.clip((dist - 16.0) / 24.0, 0.0, 1.0)
    alpha_img = Image.fromarray((alpha * 255).astype(np.uint8), mode="L")
    # Tighten fringe then soften
    alpha_img = alpha_img.filter(ImageFilter.MinFilter(3))
    alpha_img = alpha_img.filter(ImageFilter.MaxFilter(3))
    alpha_img = alpha_img.filter(ImageFilter.GaussianBlur(radius=1.8))

    out = im.convert("RGBA")
    out.putalpha(alpha_img)
    return out


def brand_atmosphere(width: int, height: int) -> Image.Image:
    """Editorial Mosaic field — warm paper left, deep ink right, soft key light."""
    rand = seeded_random(17)
    scale = 2
    rw, rh = width * scale, height * scale

    # Horizontal wash: warm stone → charcoal
    img = Image.new("RGB", (rw, rh))
    px = img.load()
    for x in range(rw):
        u = x / max(1, rw - 1)
        t = u * u * (3 - 2 * u)
        # Left: warm Mosaic paper · Right: deep ink
        r = int(236 * (1 - t) + 22 * t)
        g = int(232 * (1 - t) + 23 * t)
        b = int(224 * (1 - t) + 26 * t)
        for y in range(rh):
            # Slight vertical lift toward top
            v = y / max(1, rh - 1)
            lift = 1.0 + 0.04 * (1 - v)
            px[x, y] = (
                min(255, int(r * lift)),
                min(255, int(g * lift)),
                min(255, int(b * lift)),
            )

    layer = img.convert("RGBA")

    # Soft key light behind portrait zone
    glow = Image.new("RGBA", (rw, rh), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    cx, cy = int(rw * 0.64), int(rh * 0.38)
    for i in range(48, 0, -1):
        radx = rw * 0.42 * (i / 48)
        rady = rh * 0.58 * (i / 48)
        a = int(95 * ((1 - i / 48) ** 1.45))
        gd.ellipse(
            [cx - radx, cy - rady, cx + radx, cy + rady],
            fill=(255, 250, 244, a),
        )
    glow = glow.filter(ImageFilter.GaussianBlur(radius=42))
    layer = Image.alpha_composite(layer, glow)

    # Quiet depth wash on far left (negative space for Maps crop safety)
    left = Image.new("RGBA", (rw, rh), (0, 0, 0, 0))
    ld = ImageDraw.Draw(left)
    for i in range(30):
        x1 = int(rw * 0.02 + i * rw * 0.004)
        a = int(28 * (1 - i / 30))
        ld.rectangle([0, 0, x1, rh], fill=(30, 28, 26, a))
    left = left.filter(ImageFilter.GaussianBlur(radius=20))
    layer = Image.alpha_composite(layer, left)

    # Soft film grain
    grain = Image.new("RGBA", (rw, rh), (0, 0, 0, 0))
    gp = grain.load()
    for _ in range(12000):
        gx = int(rand() * rw)
        gy = int(rand() * rh)
        v = int(rand() * 50)
        gp[gx, gy] = (v, v, v, 22)
    grain = grain.filter(ImageFilter.GaussianBlur(radius=0.7))
    layer = Image.alpha_composite(layer, grain)

    # Gentle vignette
    vig = Image.new("L", (rw, rh), 0)
    vd = ImageDraw.Draw(vig)
    for i in range(50, 0, -1):
        radx = (rw * 0.78) * (i / 50)
        rady = (rh * 0.88) * (i / 50)
        val = int(255 * (1 - (i / 50) ** 1.55) * 0.38)
        vd.ellipse(
            [rw * 0.58 - radx, rh * 0.42 - rady, rw * 0.58 + radx, rh * 0.42 + rady],
            fill=val,
        )
    black = Image.new("RGBA", (rw, rh), (0, 0, 0, 255))
    black.putalpha(vig)
    layer = Image.alpha_composite(layer, black)

    return layer.convert("RGB").resize((width, height), Image.Resampling.LANCZOS)


def polish_subject(rgba: Image.Image) -> Image.Image:
    rgb = rgba.convert("RGB")
    rgb = ImageEnhance.Contrast(rgb).enhance(1.1)
    rgb = ImageEnhance.Color(rgb).enhance(1.08)
    rgb = ImageEnhance.Brightness(rgb).enhance(1.03)
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.15)
    out = rgb.convert("RGBA")
    out.putalpha(rgba.getchannel("A"))
    return out


def build() -> Image.Image:
    src_path = SRC if SRC.exists() else SRC_FALLBACK
    src = Image.open(src_path).convert("RGB")
    if not SRC.exists():
        src.save(SRC)

    subject = polish_subject(cutout(src))

    # Large presence — bust fills the frame height
    target_h = int(H * 1.12)
    scale = target_h / subject.height
    target_w = int(subject.width * scale)
    subject = subject.resize((target_w, target_h), Image.Resampling.LANCZOS)

    base = brand_atmosphere(W, H).convert("RGBA")

    # Soft contact shadow
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    x = int(W * 0.50 - target_w * 0.38)
    y = H - target_h + int(H * 0.06)
    sx = x + target_w * 0.38
    sy = H - 12
    sd.ellipse([sx - 140, sy - 16, sx + 180, sy + 20], fill=(0, 0, 0, 70))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=18))
    base = Image.alpha_composite(base, shadow)
    base.alpha_composite(subject, (x, y))

    final = base.convert("RGB")
    final = ImageEnhance.Contrast(final).enhance(1.05)
    return final


def main() -> None:
    final = build()
    assert final.size == (W, H)
    out_png = ROOT / "mosaic-gbp-cover-1080x608.png"
    out_jpg = ROOT / "mosaic-gbp-cover-1080x608.jpg"
    final.save(out_png, "PNG", optimize=True)
    final.save(out_jpg, "JPEG", quality=93, optimize=True, progressive=True)

    downloads = Path.home() / "Downloads"
    for src in (out_png, out_jpg):
        dest = downloads / src.name
        dest.write_bytes(src.read_bytes())
        print(f"downloads {dest} {dest.stat().st_size}")

    print(f"saved {out_png} {final.size}")


if __name__ == "__main__":
    main()
