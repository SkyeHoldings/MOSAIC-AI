"""LinkedIn Page cover — home-slide layout with native digital visual."""

from __future__ import annotations

import math
import os
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "mosaic-linkedin-page-cover-4200x700.png"
PREVIEW = ROOT / "mosaic-linkedin-page-cover-preview.png"
ARMATA = ROOT / "fonts" / "Armata-Regular.ttf"

W, H = 1584, 396  # LinkedIn cover (4:1) — shorter than Page 6:1
SPLIT = int(W * (1.05 / 2.0))
MINT = (232, 232, 232)
INK = (17, 17, 17)
MUTED = (55, 55, 55)
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


def render_digital_panel(width: int, height: int, t: float = 2.4) -> Image.Image:
    """Native DigitalEarth-style frame sized for the banner — not a screenshot crop."""
    rand = seeded_random(42)
    streaks = []
    for _ in range(520):
        x = 0.02 + rand() * 0.96
        center = abs(x - 0.52)
        streaks.append(
            {
                "x": x,
                "h": min(0.98, (0.4 + rand() * 0.58) * (1.2 - center * 0.9)),
                "w": 0.45 + rand() * 1.4 if center > 0.1 else 0.9 + rand() * 2.8,
                "b": (0.18 + rand() * 0.75) * (1.15 - center * 0.7),
                "speed": 0.06 + rand() * 0.28,
                "phase": rand() * math.pi * 2,
            }
        )
    for _ in range(40):
        streaks.append(
            {
                "x": 0.5 + (rand() - 0.5) * 0.09,
                "h": 0.78 + rand() * 0.2,
                "w": 1.2 + rand() * 4.5,
                "b": 0.8 + rand() * 0.2,
                "speed": 0.04 + rand() * 0.14,
                "phase": rand() * math.pi * 2,
            }
        )

    particles = [
        {
            "x": 0.05 + rand() * 0.9,
            "y": 0.04 + rand() * 0.5,
            "r": 0.6 + rand() * 1.8,
            "b": 0.35 + rand() * 0.6,
            "drift": 0.01 + rand() * 0.03,
            "phase": rand() * math.pi * 2,
        }
        for _ in range(140)
    ]
    tiles = [
        {"lane": (i * 0.173) % 1, "phase": rand(), "w": 0.35 + rand() * 0.8}
        for i in range(36)
    ]

    # Render at 2x then downscale for clean anti-alias
    scale = 2
    rw, rh = width * scale, height * scale
    img = Image.new("RGB", (rw, rh), (5, 7, 10))
    draw = ImageDraw.Draw(img, "RGBA")

    horizon = rh * 0.58
    vanish_x = rw * 0.52

    # Sky lift
    for y in range(int(horizon)):
        a = int(40 * (y / max(1, horizon)))
        draw.line([(0, y), (rw, y)], fill=(40, 40, 40, a))

    # Floor
    draw.rectangle([0, int(horizon), rw, rh], fill=(7, 11, 16, 255))

    # Perspective horizontals
    for i in range(1, 27):
        u = i / 26
        y = horizon + (rh - horizon) * (u**1.65)
        a = int(255 * (0.08 + 0.28 * (1 - u)))
        draw.line([(0, y), (rw, y)], fill=(220, 220, 220, a))

    # Perspective verticals
    for i in range(-22, 23):
        x0 = vanish_x + i * rw * 0.048
        a = int(255 * (0.06 + 0.2 * (1 - abs(i) / 22)))
        draw.line([(vanish_x, horizon), (x0, rh)], fill=(200, 200, 200, a))

    # Floor tiles
    for tile in tiles:
        depth = (tile["phase"] + t * 0.08) % 1
        y = horizon + (rh - horizon) * (depth**1.45)
        span = (18 + depth * 90) * tile["w"] * scale
        cx = vanish_x + math.sin(tile["lane"] * math.pi * 2 + t * 0.35) * rw * 0.3 * depth
        glow = 0.12 + 0.45 * depth
        a = int(255 * glow)
        draw.rectangle(
            [cx - span, y - span * 0.2, cx + span, y + span * 0.2],
            fill=(245, 245, 245, a),
        )

    # Horizon node lights
    for i in range(48):
        x = rw * (0.06 + 0.88 * ((i * 0.137) % 1))
        y = horizon + 6 * scale + (i % 6) * 9 * scale
        pulse = 0.5 + 0.5 * math.sin(t * 2.1 + i)
        r = (1.2 + pulse * 2) * scale
        a = int(255 * (0.35 + 0.55 * pulse))
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, a))

    # Vertical streaks — draw on a separate layer for soft glow
    streak_layer = Image.new("RGBA", (rw, rh), (0, 0, 0, 0))
    sd = ImageDraw.Draw(streak_layer)
    for s in streaks:
        pulse = 0.62 + 0.38 * math.sin(t * s["speed"] * math.pi * 2 + s["phase"])
        h = horizon * s["h"] * pulse
        x = s["x"] * rw
        top = horizon - h
        b = min(1.0, s["b"] * pulse)
        w = max(0.7, s["w"]) * scale

        if s["w"] >= 2:
            glow_w = (s["w"] + 5) * scale
            a = int(255 * 0.1 * b)
            sd.line([(x, top + h * 0.1), (x, horizon)], fill=(255, 255, 255, a), width=int(glow_w))

        a = int(255 * (0.55 + 0.45 * b))
        sd.line([(x, top), (x, horizon)], fill=(255, 255, 255, a), width=max(1, int(w)))

    img = Image.alpha_composite(img.convert("RGBA"), streak_layer)

    # Central bloom
    bloom = Image.new("RGBA", (rw, rh), (0, 0, 0, 0))
    bd = ImageDraw.Draw(bloom)
    bloom_x = rw * 0.52
    for i in range(28, 0, -1):
        rad = (rw * 0.12) * (i / 28)
        a = int(100 * (1 - i / 28) ** 1.4)
        bd.ellipse(
            [bloom_x - rad, horizon - rad * 0.55, bloom_x + rad, horizon + rad * 0.55],
            fill=(255, 255, 255, a),
        )
    bloom = bloom.filter(ImageFilter.GaussianBlur(radius=18 * scale / 2))
    img = Image.alpha_composite(img, bloom)

    # Particles
    pd_layer = Image.new("RGBA", (rw, rh), (0, 0, 0, 0))
    pd = ImageDraw.Draw(pd_layer)
    for p in particles:
        x = (p["x"] + 0.012 * math.sin(t * p["drift"] * 10 + p["phase"])) * rw
        y = (p["y"] + 0.014 * math.sin(t * 0.7 + p["phase"])) * horizon
        a = p["b"] * (0.65 + 0.35 * math.sin(t * 2 + p["phase"]))
        r = p["r"] * scale
        pd.ellipse([x - r, y - r, x + r, y + r], fill=(245, 248, 255, int(255 * a)))
    img = Image.alpha_composite(img, pd_layer)

    # Vignette
    vig = Image.new("RGBA", (rw, rh), (0, 0, 0, 0))
    vd = ImageDraw.Draw(vig)
    cx, cy = rw * 0.5, rh * 0.45
    max_r = rh * 0.85
    for i in range(40):
        rad = max_r * (i + 1) / 40
        # only outer ring gets alpha
        a = int(140 * ((i + 1) / 40) ** 2.2)
        vd.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], outline=(0, 0, 0, a), width=int(max_r / 40) + 2)
    vig = vig.filter(ImageFilter.GaussianBlur(radius=30))
    # stronger edge vignette via radial mask
    edge = Image.new("L", (rw, rh), 0)
    ed = ImageDraw.Draw(edge)
    for i in range(60, 0, -1):
        radx = (rw * 0.75) * (i / 60)
        rady = (rh * 0.85) * (i / 60)
        val = int(255 * (1 - (i / 60) ** 1.8) * 0.55)
        ed.ellipse([cx - radx, cy - rady, cx + radx, cy + rady], fill=val)
    black = Image.new("RGBA", (rw, rh), (0, 0, 0, 255))
    black.putalpha(edge)
    img = Image.alpha_composite(img, black)

    out = img.convert("RGB").resize((width, height), Image.Resampling.LANCZOS)
    return out


def draw_pill(
    draw: ImageDraw.ImageDraw,
    text: str,
    x: int,
    y: int,
    width: int,
    height: int,
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
) -> None:
    """Black label chip — equal width stack for a clean vertical system."""
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
    right = render_digital_panel(right_w, H)

    canvas = Image.new("RGB", (W, H), MINT)
    canvas.paste(right, (SPLIT, 0))

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay, "RGBA")

    pad_l = int(SPLIT * 0.09)
    h1_font = load_font(
        [str(ARMATA), r"C:\Windows\Fonts\arial.ttf", r"C:\Windows\Fonts\segoeui.ttf"],
        42,
    )
    pill_font = load_font(
        [str(ARMATA), r"C:\Windows\Fonts\arial.ttf", r"C:\Windows\Fonts\segoeui.ttf"],
        15,
    )

    line1, line2 = "Ready to reshape", "your future?"
    l1 = draw.textbbox((0, 0), line1, font=h1_font)
    h1_line = (l1[3] - l1[1]) + 2
    headline_w = max(
        draw.textbbox((0, 0), line1, font=h1_font)[2],
        draw.textbbox((0, 0), line2, font=h1_font)[2],
    )
    headline_h = h1_line * 2

    # Equal-width black pills stacked beside the headline
    pill_labels = ["marketing", "ai"]
    pill_pad_x, pill_pad_y = 24, 10
    pill_gap = 10
    widest = 0
    tallest = 0
    for label in pill_labels:
        bb = draw.textbbox((0, 0), label, font=pill_font)
        widest = max(widest, bb[2] - bb[0])
        tallest = max(tallest, bb[3] - bb[1])
    pill_w = widest + pill_pad_x * 2
    pill_h = tallest + pill_pad_y * 2
    stack_h = pill_h * len(pill_labels) + pill_gap * (len(pill_labels) - 1)

    # One tight composition: headline + pills as a centered unit in the left panel
    gap_between = 36
    block_w = headline_w + gap_between + pill_w
    block_h = max(headline_h, stack_h)
    block_left = int((SPLIT - block_w) / 2)
    # Bias upward so LinkedIn's profile circle doesn't eat the copy
    block_top = max(40, int((H - block_h) * 0.32))

    h1_y = block_top + (block_h - headline_h) / 2
    draw.text((block_left, h1_y), line1, font=h1_font, fill=INK)
    draw.text((block_left, h1_y + h1_line), line2, font=h1_font, fill=INK)

    pill_x = block_left + headline_w + gap_between
    pill_y = block_top + (block_h - stack_h) / 2
    for i, label in enumerate(pill_labels):
        y = int(pill_y + i * (pill_h + pill_gap))
        draw_pill(draw, label, int(pill_x), y, pill_w, pill_h, pill_font)

    canvas = Image.alpha_composite(canvas.convert("RGBA"), overlay).convert("RGB")
    return canvas


def main() -> None:
    final = build()
    assert final.size == (W, H)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    # Keep filename clear about LinkedIn-standard size
    out_png = ROOT / "mosaic-linkedin-cover-1584x396.png"
    out_jpg = ROOT / "mosaic-linkedin-cover-1584x396.jpg"
    final.save(out_png, "PNG", optimize=True)
    final.convert("RGB").save(out_jpg, "JPEG", quality=90, optimize=True, progressive=True)
    preview = final.resize((1267, 317), Image.Resampling.LANCZOS)
    preview.save(PREVIEW, "PNG", optimize=True)

    downloads = Path.home() / "Downloads"
    for src in (out_png, out_jpg):
        dest = downloads / src.name
        dest.write_bytes(src.read_bytes())
        print(f"downloads {dest} {dest.stat().st_size} {final.size}")

    print(f"saved {out_png} {final.size}")


if __name__ == "__main__":
    main()
