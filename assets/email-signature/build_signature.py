"""Mosaic email signature — black brand banner with client flex.

Outputs:
  mosaic-email-signature.png          black banner (paste as image)
  mosaic-email-signature@2x.png       retina version
  mosaic-email-signature.gif          animated CTA (email-safe)
  mosaic-signature-cta.gif            animated CTA pill alone (HTML sig)
  mosaic-signature-logo.png           black logo lockup on transparent (for HTML)
  mosaic-signature-logo-white.png     white logo lockup on transparent
  mosaic-signature-brands.png         white client strip on transparent (for HTML)
"""

from __future__ import annotations

import math
import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT.parent
CARDS = ASSETS / "business-cards"
LOGOS = CARDS / "logos"
ARMATA = ASSETS / "linkedin" / "fonts" / "Armata-Regular.ttf"
SUPPLY_MONO = CARDS / "fonts" / "supply" / "PPSupplyMono-Regular.otf"

# Display ~700x300; render @2x — taller contact band + brands
W, H = 1400, 620
BLACK = (8, 8, 8)
WHITE = (255, 255, 255)
MUTED = (168, 168, 168)
RULE = (55, 55, 55)

BARS = [
    (0, 3), (6, 2), (11, 5), (19, 2), (24, 3), (30, 2), (35, 6),
    (44, 2), (49, 3), (55, 2), (60, 5), (68, 2), (73, 3), (79, 2),
    (84, 6), (93, 2), (98, 3), (104, 2), (109, 5), (117, 2), (122, 3),
    (128, 2), (133, 6), (142, 2), (147, 3), (153, 2), (158, 5), (165, 3),
]
VB_W = 168.0

NAME = "SKYE SMITH"
TITLE = "CEO"
PHONE = "208.819.2549"
EMAIL = "skye@hellomosaic.ai"
URL = "HELLOMOSAIC.AI"
BRANDS_LABEL = "BRANDS WE'VE WORKED WITH"
CTA_LABEL = "BOOK A DISCOVERY CALL"
CTA_URL = "https://hellomosaic.ai/#contact"

# (path, mode, height_frac) — fractions matched to the approved brands-row reference
CLIENTS = [
    (LOGOS / "official_gucci.png", "white", 0.28),
    (LOGOS / "official_cabelas.png", "color", 0.52),
    (LOGOS / "official_basspro.png", "basspro", 0.88),
    (LOGOS / "official_redrobin.png", "color", 0.70),
]


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        str(SUPPLY_MONO),
        r"C:\Windows\Fonts\consolab.ttf" if bold else r"C:\Windows\Fonts\consola.ttf",
        r"C:\Windows\Fonts\courbd.ttf" if bold else r"C:\Windows\Fonts\cour.ttf",
        str(ARMATA),
        r"C:\Windows\Fonts\arial.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def draw_barcode_logo(
    draw: ImageDraw.ImageDraw,
    x: float,
    y: float,
    logo_w: float,
    barcode_h: float,
    word_font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
    fill=WHITE,
) -> tuple[float, float]:
    scale = logo_w / VB_W
    for bx, bw in BARS:
        left = x + bx * scale
        right = left + bw * scale
        draw.rectangle([left, y, right, y + barcode_h], fill=fill)

    letters = list("MOSAIC")
    gap = max(8, int(barcode_h * 0.36))
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

    return logo_w, barcode_h + gap + letter_h


def load_exact_logo() -> Image.Image | None:
    exact = CARDS / "mosaic-logo-exact-white.png"
    white_trans = ASSETS / "mosaic-logo-white-transparent.png"
    if exact.exists():
        return Image.open(exact).convert("RGBA")
    if white_trans.exists():
        return Image.open(white_trans).convert("RGBA")
    return None


def tint_rgba(im: Image.Image, rgb: tuple[int, int, int]) -> Image.Image:
    out = im.copy()
    px = out.load()
    w, h = out.size
    r, g, b = rgb
    for y in range(h):
        for x in range(w):
            _, _, _, a = px[x, y]
            if a < 8:
                continue
            px[x, y] = (r, g, b, a)
    return out


def trim_alpha(im: Image.Image, pad: int = 4) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    return im.crop(
        (
            max(0, l - pad),
            max(0, t - pad),
            min(im.width, r + pad),
            min(im.height, b + pad),
        )
    )


def color_logo_on_black(src: Path) -> Image.Image:
    """Keep brand colors; knock out white or black plate for dark signature."""
    import numpy as np

    im = Image.open(src).convert("RGBA")
    # Trim empty margins first
    arr0 = np.array(im)
    r0, g0, b0, a0 = arr0[:, :, 0], arr0[:, :, 1], arr0[:, :, 2], arr0[:, :, 3]
    corners = np.array(
        [arr0[0, 0, :3], arr0[0, -1, :3], arr0[-1, 0, :3], arr0[-1, -1, :3]],
        dtype=np.float32,
    )
    on_white = corners.mean() > 200
    if on_white:
        content = (a0 > 8) & ~((r0 > 245) & (g0 > 245) & (b0 > 245))
    else:
        lum0 = (r0.astype(np.int16) + g0.astype(np.int16) + b0.astype(np.int16)) / 3.0
        sat0 = np.maximum(np.maximum(r0, g0), b0).astype(np.int16) - np.minimum(
            np.minimum(r0, g0), b0
        ).astype(np.int16)
        content = (a0 > 8) & ~((lum0 < 35) & (sat0 < 28))
    ys, xs = np.where(content)
    if len(xs):
        im = im.crop(
            (
                max(0, int(xs.min()) - 4),
                max(0, int(ys.min()) - 4),
                min(im.width, int(xs.max()) + 5),
                min(im.height, int(ys.max()) + 5),
            )
        )

    im = im.resize((im.width * 2, im.height * 2), Image.Resampling.LANCZOS)
    arr = np.array(im)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    lum = (r.astype(np.int16) + g.astype(np.int16) + b.astype(np.int16)) / 3.0
    sat = np.maximum(np.maximum(r, g), b).astype(np.int16) - np.minimum(
        np.minimum(r, g), b
    ).astype(np.int16)
    alpha = a.astype(np.int16).copy()

    if on_white:
        page = (a < 8) | ((r > 245) & (g > 245) & (b > 245))
        soft = (r > 228) & (g > 228) & (b > 228) & ~page
        alpha[page] = 0
        alpha[soft] = np.minimum(
            alpha[soft],
            ((255 - r[soft].astype(np.int16)) * 5).clip(0, 255),
        )
    else:
        plate = (a < 8) | ((lum < 32) & (sat < 28))
        soft = (lum < 55) & (sat < 35) & ~plate
        alpha[plate] = 0
        alpha[soft] = np.minimum(alpha[soft], ((lum[soft] - 10) * 6).clip(0, 255))

    out = np.dstack([r, g, b, alpha.astype(np.uint8)])
    return trim_alpha(Image.fromarray(out, "RGBA"), pad=4)


def basspro_color_on_black(src: Path) -> Image.Image:
    """Full-color Bass Pro badge; Johnny Morris script forced white for dark fields."""
    import numpy as np

    im = Image.open(src).convert("RGBA")
    arr = np.array(im)
    r = arr[:, :, 0].astype(np.int16)
    g = arr[:, :, 1].astype(np.int16)
    b = arr[:, :, 2].astype(np.int16)
    a = arr[:, :, 3].astype(np.float32)

    lum = (r + g + b) / 3.0
    sat = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)

    # Knock out white page
    page = (arr[:, :, 3] < 8) | ((lum > 242) & (sat < 18))
    fringe = (lum > 210) & (sat < 25) & ~page
    a[page] = 0
    a[fringe] *= ((255 - lum[fringe]) / 45.0).clip(0, 1)

    # Johnny Morris sits above the yellow oval — recolor that dark script to white
    yellow = (r > 175) & (g > 145) & (b < 145) & (g > b + 20) & ~page
    yrows = np.where(yellow.any(axis=1))[0]
    if len(yrows):
        oval_top = int(yrows[0])
        # Signature band only — stop just above the yellow fill
        sig_band = np.zeros(arr.shape[:2], dtype=bool)
        sig_band[: max(0, oval_top - 1), :] = True
        # Dark ink in the signature band (not yellow, not page)
        script = sig_band & ~page & ~yellow & (lum < 100) & (sat < 50) & (a > 8)
        # Dilate slightly for AA coverage, but keep off the yellow oval
        script_img = Image.fromarray((script.astype(np.uint8) * 255), "L")
        script_dilated = np.array(script_img.filter(ImageFilter.MaxFilter(3))) > 128
        script_dilated &= ~yellow & sig_band
        script_soft = np.array(
            Image.fromarray((script_dilated.astype(np.uint8) * 255), "L").filter(
                ImageFilter.GaussianBlur(0.5)
            )
        ).astype(np.float32) / 255.0
        script_soft[yellow] = 0  # never bleach the oval
        for ch in (r, g, b):
            ch[:] = (ch * (1.0 - script_soft) + 255.0 * script_soft).astype(np.int16)
        a = np.maximum(a, script_soft * 255.0)

    out = Image.fromarray(
        np.dstack(
            [
                r.clip(0, 255).astype(np.uint8),
                g.clip(0, 255).astype(np.uint8),
                b.clip(0, 255).astype(np.uint8),
                a.clip(0, 255).astype(np.uint8),
            ]
        ),
        "RGBA",
    )
    return trim_alpha(out, pad=4)


def fit_logo(im: Image.Image, max_w: int, max_h: int) -> Image.Image:
    """Downscale logos with INTER_AREA when possible — sharper than LANCZOS for badges."""
    import numpy as np

    w, h = im.size
    scale = min(max_w / w, max_h / h)
    nw, nh = max(1, int(round(w * scale))), max(1, int(round(h * scale)))
    if scale >= 0.999:
        return im.copy()

    try:
        import cv2

        arr = np.array(im.convert("RGBA"))
        out = cv2.resize(arr, (nw, nh), interpolation=cv2.INTER_AREA)
        result = Image.fromarray(out, "RGBA")
    except Exception:
        result = im.resize((nw, nh), Image.Resampling.LANCZOS)

    return result.filter(ImageFilter.UnsharpMask(radius=0.9, percent=110, threshold=2))


def to_white_transparent(src: Path) -> Image.Image:
    """Brand mark → solid white on transparent (handles white OR black plates)."""
    import numpy as np

    im = Image.open(src).convert("RGBA")
    arr = np.array(im)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    lum = (r.astype(np.int16) + g.astype(np.int16) + b.astype(np.int16)) / 3.0
    sat = np.maximum(np.maximum(r, g), b).astype(np.int16) - np.minimum(
        np.minimum(r, g), b
    ).astype(np.int16)

    # Detect plate from corners
    corners = np.array(
        [arr[0, 0, :3], arr[0, -1, :3], arr[-1, 0, :3], arr[-1, -1, :3]], dtype=np.float32
    )
    corner_lum = corners.mean(axis=1).mean()
    on_white = corner_lum > 200

    if on_white:
        page = (a < 8) | ((r > 235) & (g > 235) & (b > 235))
        ink = ~page
    else:
        # Black / dark plate — keep light + saturated brand color
        plate = (a < 8) | ((lum < 40) & (sat < 30))
        ink = ~plate

    mask = Image.fromarray((ink.astype(np.uint8) * 255), "L")
    if max(mask.size) < 700:
        mask = mask.resize((mask.width * 3, mask.height * 3), Image.Resampling.NEAREST)
    mask = mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    mask = mask.point(lambda v: 255 if v > 40 else 0)
    mask = mask.filter(ImageFilter.GaussianBlur(0.5))
    out = Image.merge(
        "RGBA",
        (
            Image.new("L", mask.size, 255),
            Image.new("L", mask.size, 255),
            Image.new("L", mask.size, 255),
            mask,
        ),
    )
    return trim_alpha(out)


def prepare_client(path: Path, mode: str) -> Image.Image:
    if mode == "basspro":
        return basspro_color_on_black(path)
    if mode == "color":
        return color_logo_on_black(path)
    return to_white_transparent(path)


def build_client_row(available_w: int, row_max_h: int, gap: int = 36) -> Image.Image:
    """Logo row sized to per-mark height fractions (matched to approved reference)."""
    items: list[tuple[Image.Image, float]] = []
    for path, mode, height_frac in CLIENTS:
        if not path.exists():
            continue
        items.append((prepare_client(path, mode), height_frac))
    if not items:
        return Image.new("RGBA", (available_w, row_max_h), (0, 0, 0, 0))

    n = len(items)
    usable = available_w - gap * (n - 1)

    ideals: list[tuple[int, int, Image.Image]] = []
    for im, height_frac in items:
        th = max(8, int(row_max_h * height_frac))
        ar = im.width / max(1, im.height)
        ideals.append((max(1, int(round(th * ar))), th, im))

    ideal_w = sum(w for w, _, _ in ideals)
    scale = min(1.0, usable / max(1, ideal_w))

    fitted: list[Image.Image] = []
    for iw, ih, im in ideals:
        fw = max(1, int(round(iw * scale)))
        fh = max(1, int(round(ih * scale)))
        if fh > row_max_h:
            s = row_max_h / fh
            fw, fh = max(1, int(round(fw * s))), row_max_h
        fitted.append(fit_logo(im, fw, fh))

    total_w = sum(im.width for im in fitted) + gap * (n - 1)
    if total_w > available_w:
        s = (available_w - gap * (n - 1)) / max(1, sum(im.width for im in fitted))
        fitted = [
            fit_logo(im, max(1, int(im.width * s)), max(1, int(im.height * s)))
            for im in fitted
        ]

    row_w = sum(im.width for im in fitted) + gap * (n - 1)
    row = Image.new("RGBA", (row_w, row_max_h), (0, 0, 0, 0))
    x = 0
    for im in fitted:
        py = (row_max_h - im.height) // 2
        row.alpha_composite(im, (x, py))
        x += im.width + gap
    return row


def make_cta_pill(
    label: str,
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
    pulse: float = 0.0,
    shimmer_t: float = 0.0,
    invert: bool = False,
) -> Image.Image:
    """CTA pill with optional soft glow + shimmer.

    invert=False → white pill / black type (black signature banner)
    invert=True  → black pill / white type (HTML signature on light bg)
    """
    import numpy as np

    fill = BLACK if invert else WHITE
    text = WHITE if invert else BLACK
    glow_rgb = (20, 20, 20) if invert else (255, 255, 255)

    probe = ImageDraw.Draw(Image.new("RGBA", (8, 8)))
    bb = probe.textbbox((0, 0), label, font=font)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    pad_x, pad_y = 36, 22
    pw, ph = tw + pad_x * 2, th + pad_y * 2

    glow_pad = 18
    canvas = Image.new("RGBA", (pw + glow_pad * 2, ph + glow_pad * 2), (0, 0, 0, 0))

    if pulse > 0.02:
        glow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        gdraw = ImageDraw.Draw(glow)
        alpha = int(40 + 110 * pulse)
        inset = int(6 + (1.0 - pulse) * 8)
        gdraw.rounded_rectangle(
            [inset, inset, canvas.width - 1 - inset, canvas.height - 1 - inset],
            radius=max(14, ph // 2 + glow_pad - inset),
            fill=glow_rgb + (alpha,),
        )
        glow = glow.filter(ImageFilter.GaussianBlur(radius=7 + 5 * pulse))
        canvas.alpha_composite(glow)

    scale = 4
    pill = Image.new("RGBA", (pw * scale, ph * scale), (0, 0, 0, 0))
    radius = max(12, ph // 2) * scale
    ImageDraw.Draw(pill).rounded_rectangle(
        [0, 0, pw * scale - 1, ph * scale - 1],
        radius=radius,
        fill=fill + (255,),
    )
    pill = pill.resize((pw, ph), Image.Resampling.LANCZOS)
    canvas.alpha_composite(pill, (glow_pad, glow_pad))

    if shimmer_t >= 0:
        band_w = max(18, pw // 5)
        cx = int((-band_w) + shimmer_t * (pw + band_w * 2))
        sarr = np.zeros((ph, pw, 4), dtype=np.uint8)
        sheen = (255, 255, 255) if not invert else (90, 90, 90)
        for x in range(pw):
            d = abs(x - cx) / band_w
            if d < 1.0:
                sarr[:, x, :] = (*sheen, int((1.0 - d) * (55 if invert else 70)))
        mask = np.array(pill.split()[-1], dtype=np.float32) / 255.0
        sarr[:, :, 3] = (sarr[:, :, 3].astype(np.float32) * mask).astype(np.uint8)
        canvas.alpha_composite(Image.fromarray(sarr, "RGBA"), (glow_pad, glow_pad))

    tx = glow_pad + pad_x - bb[0]
    ty = glow_pad + (ph - th) / 2 - bb[1]
    ImageDraw.Draw(canvas).text((tx, ty), label, font=font, fill=text)
    return canvas


def draw_cta_pill(
    canvas: Image.Image,
    label: str,
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
    right: int,
    cy: float,
    pulse: float = 0.0,
    shimmer_t: float = 0.0,
) -> tuple[int, int]:
    """Composite CTA onto canvas; returns top-left paste position."""
    pill = make_cta_pill(label, font, pulse=pulse, shimmer_t=shimmer_t)
    glow_pad = 18
    px = right - (pill.width - glow_pad)
    py = int(cy - pill.height / 2)
    canvas.alpha_composite(pill, (px, py))
    return px, py


def build_banner(
    cta_pulse: float = 0.35,
    cta_shimmer: float = -1.0,
    include_cta: bool = True,
) -> Image.Image:
    canvas = Image.new("RGBA", (W, H), BLACK + (255,))
    draw = ImageDraw.Draw(canvas)

    pad = 48
    name_font = load_font(48, bold=True)
    title_font = load_font(24)
    contact_font = load_font(26)
    word_font = load_font(22)
    label_font = load_font(14)
    cta_font = load_font(26)

    top_h = 340  # contact band height

    # Left: Mosaic lockup
    logo = load_exact_logo()
    if logo is not None:
        target_w = 280
        scale = target_w / logo.width
        logo = logo.resize(
            (int(logo.width * scale), int(logo.height * scale)),
            Image.Resampling.LANCZOS,
        )
        ly = pad + (top_h - pad * 2 - logo.height) // 2
        canvas.alpha_composite(logo, (pad, ly))
        logo_right = pad + logo.width
    else:
        draw_barcode_logo(draw, pad, pad + 40, 280, 46, word_font, WHITE)
        logo_right = pad + 280

    # Divider
    div_x = logo_right + 40
    draw.rectangle([div_x, pad + 16, div_x + 2, top_h - pad - 8], fill=RULE)

    # Middle: contact — larger type + more breathing room
    cx = div_x + 40
    cy = pad + 18

    draw.text((cx, cy), NAME, font=name_font, fill=WHITE)
    nb = draw.textbbox((cx, cy), NAME, font=name_font)
    cy = nb[3] + 8
    draw.text((cx, cy), TITLE, font=title_font, fill=MUTED)
    tb = draw.textbbox((cx, cy), TITLE, font=title_font)

    cy = tb[3] + 36
    for line in (PHONE, EMAIL, URL):
        draw.text((cx, cy), line, font=contact_font, fill=WHITE)
        bb = draw.textbbox((cx, cy), line, font=contact_font)
        cy = bb[3] + 14

    # Right: discovery CTA pill
    if include_cta:
        draw_cta_pill(
            canvas,
            CTA_LABEL,
            cta_font,
            W - pad,
            top_h / 2,
            pulse=cta_pulse,
            shimmer_t=cta_shimmer,
        )

    # Hairline + brands flex
    rule_y = top_h
    draw.rectangle([pad, rule_y, W - pad, rule_y + 1], fill=RULE)

    # Label — tracked like the card
    label_y = rule_y + 28
    chars = list(BRANDS_LABEL)
    spacing = 5
    widths = [draw.textbbox((0, 0), ch, font=label_font)[2] for ch in chars]
    total = sum(widths) + spacing * (len(chars) - 1)
    lx = (W - total) / 2
    for ch, cw in zip(chars, widths):
        draw.text((lx, label_y), ch, font=label_font, fill=MUTED)
        lx += cw + spacing

    label_bb = draw.textbbox((0, 0), "X", font=label_font)
    label_h = label_bb[3] - label_bb[1]

    row_max_h = 140
    available = W - pad * 2
    row = build_client_row(available, row_max_h, gap=40)
    row_y = label_y + label_h + 22
    bottom = H - pad
    row_y = row_y + max(0, (bottom - row_y - row.height) // 2)
    rx = (W - row.width) // 2
    canvas.alpha_composite(row, (rx, row_y))

    return canvas.convert("RGB")


def build_animated_signature(frames: int = 16, duration_ms: int = 90) -> list[Image.Image]:
    """Full-banner frames with pulsing + shimmering CTA (email-safe GIF)."""
    cta_font = load_font(26)
    pad = 48
    top_h = 340

    base = build_banner(include_cta=False).convert("RGBA")
    out: list[Image.Image] = []
    for i in range(frames):
        t = i / frames
        pulse = 0.25 + 0.75 * (0.5 + 0.5 * math.sin(t * 2 * math.pi))
        shimmer = (t + 0.15) % 1.0
        frame = base.copy()
        draw_cta_pill(
            frame,
            CTA_LABEL,
            cta_font,
            W - pad,
            top_h / 2,
            pulse=pulse,
            shimmer_t=shimmer,
        )
        # Display size for email weight
        out.append(
            frame.convert("RGB").resize((W // 2, H // 2), Image.Resampling.LANCZOS)
        )
    return out


def build_animated_cta_pill(frames: int = 16) -> list[Image.Image]:
    """Standalone CTA GIF for the HTML signature (black pill on white)."""
    cta_font = load_font(22)
    out: list[Image.Image] = []
    for i in range(frames):
        t = i / frames
        pulse = 0.25 + 0.75 * (0.5 + 0.5 * math.sin(t * 2 * math.pi))
        shimmer = (t + 0.15) % 1.0
        pill = make_cta_pill(
            CTA_LABEL, cta_font, pulse=pulse, shimmer_t=shimmer, invert=True
        )
        bg = Image.new("RGB", pill.size, (255, 255, 255))
        bg.paste(pill, (0, 0), pill)
        out.append(bg)
    return out


def build_logo_lockup(fill: tuple[int, int, int], pad: int = 8) -> Image.Image:
    logo = load_exact_logo()
    if logo is not None:
        if fill != WHITE:
            logo = tint_rgba(logo, fill)
        bbox = logo.getbbox()
        if bbox:
            logo = logo.crop(bbox)
        out = Image.new("RGBA", (logo.width + pad * 2, logo.height + pad * 2), (0, 0, 0, 0))
        out.alpha_composite(logo, (pad, pad))
        return out

    logo_w, barcode_h = 280, 42
    word_font = load_font(22)
    tmp = Image.new("RGBA", (logo_w + 40, 160), (0, 0, 0, 0))
    d = ImageDraw.Draw(tmp)
    _, total_h = draw_barcode_logo(d, 0, 0, logo_w, barcode_h, word_font, fill)
    out = Image.new("RGBA", (int(logo_w) + pad * 2, int(total_h) + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(out)
    draw_barcode_logo(d, pad, pad, logo_w, barcode_h, word_font, fill)
    return out


def build_brands_strip_transparent() -> Image.Image:
    """Client strip for HTML signatures on light email backgrounds."""
    # Reuse the same optical sizing as the black banner
    row = build_client_row(available_w=520, row_max_h=48, gap=28)
    # Gucci was prepared white-on-transparent — flip to black for light email bg
    # Color logos stay as-is. Detect near-white ink and tint those pixels black.
    import numpy as np

    arr = np.array(row)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    near_white = (a > 20) & (r > 220) & (g > 220) & (b > 220)
    arr[near_white, 0] = 17
    arr[near_white, 1] = 17
    arr[near_white, 2] = 17
    return Image.fromarray(arr, "RGBA")


def save(img: Image.Image, name: str) -> Path:
    path = ROOT / name
    img.save(path, "PNG", optimize=True)
    print(f"saved {path}")
    return path


def save_gif(frames: list[Image.Image], name: str, duration_ms: int = 90) -> Path:
    path = ROOT / name
    # Quantize for smaller email-friendly GIFs
    q = [f.convert("P", palette=Image.Palette.ADAPTIVE, colors=128) for f in frames]
    q[0].save(
        path,
        save_all=True,
        append_images=q[1:],
        duration=duration_ms,
        loop=0,
        optimize=True,
        disposal=2,
    )
    print(f"saved {path} ({path.stat().st_size // 1024} KB, {len(frames)} frames)")
    return path


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)

    banner_2x = build_banner(cta_pulse=0.4, cta_shimmer=0.35)
    save(banner_2x, "mosaic-email-signature@2x.png")

    banner = banner_2x.resize((W // 2, H // 2), Image.Resampling.LANCZOS)
    save(banner, "mosaic-email-signature.png")

    anim_frames = build_animated_signature(frames=14, duration_ms=95)
    save_gif(anim_frames, "mosaic-email-signature.gif", duration_ms=95)

    cta_frames = build_animated_cta_pill(frames=14)
    save_gif(cta_frames, "mosaic-signature-cta.gif", duration_ms=95)

    desktop = Path.home() / "Desktop"
    (desktop / "mosaic-email-signature.png").write_bytes(
        (ROOT / "mosaic-email-signature.png").read_bytes()
    )
    (desktop / "mosaic-email-signature.gif").write_bytes(
        (ROOT / "mosaic-email-signature.gif").read_bytes()
    )
    print(f"saved {desktop / 'mosaic-email-signature.png'}")
    print(f"saved {desktop / 'mosaic-email-signature.gif'}")

    logo_black = build_logo_lockup(BLACK)
    target_w = 140
    scale = target_w / logo_black.width
    logo_black_sm = logo_black.resize(
        (target_w, max(1, int(logo_black.height * scale))),
        Image.Resampling.LANCZOS,
    )
    save(logo_black_sm, "mosaic-signature-logo.png")

    logo_white = build_logo_lockup(WHITE)
    logo_white_sm = logo_white.resize(
        (target_w, max(1, int(logo_white.height * scale))),
        Image.Resampling.LANCZOS,
    )
    save(logo_white_sm, "mosaic-signature-logo-white.png")

    brands = build_brands_strip_transparent()
    save(brands, "mosaic-signature-brands.png")

    public = ASSETS.parent / "public" / "email"
    public.mkdir(parents=True, exist_ok=True)
    for name in (
        "mosaic-signature-logo.png",
        "mosaic-email-signature.png",
        "mosaic-email-signature.gif",
        "mosaic-signature-brands.png",
        "mosaic-signature-cta.gif",
    ):
        (public / name).write_bytes((ROOT / name).read_bytes())
        print(f"saved {public / name}")


if __name__ == "__main__":
    main()
