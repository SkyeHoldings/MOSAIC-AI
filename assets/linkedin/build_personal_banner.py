"""LinkedIn personal profile banner — optimized for LinkedIn's crop + avatar overlay.

Fixes vs email-signature stretch:
  - Avatar safe pocket on lower-left (no brands/logo under the photo)
  - Content pulled up and grouped so the wide canvas doesn't look empty
  - Contact condensed (name/title/url; phone+email on one line)
  - Brands larger, shifted into the clear right/center zone
"""

from __future__ import annotations

import importlib.util
import os
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT.parent
SIG = ASSETS / "email-signature"
CARDS = ASSETS / "business-cards"
SUPPLY_MONO = CARDS / "fonts" / "supply" / "PPSupplyMono-Regular.otf"
ARMATA = ROOT / "fonts" / "Armata-Regular.ttf"

W, H = 1584, 396
BLACK = (8, 8, 8)
WHITE = (255, 255, 255)
MUTED = (168, 168, 168)
RULE = (55, 55, 55)

NAME = "SKYE SMITH"
TITLE = "CEO"
PHONE = "208.819.2549"
EMAIL = "skye@hellomosaic.ai"
URL = "hellomosaic.ai"
BRANDS_LABEL = "BRANDS WE'VE WORKED WITH"
CTA_LABEL = "VISIT OUR SITE"

# LinkedIn avatar covers ~bottom-left circle (~160–180px). Keep that pocket empty.
AVATAR_CLEAR_X = 280


def _load_sig():
    spec = importlib.util.spec_from_file_location(
        "build_signature", SIG / "build_signature.py"
    )
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules["build_signature"] = mod
    spec.loader.exec_module(mod)
    return mod


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


def text_size(draw, text, font) -> tuple[int, int]:
    bb = draw.textbbox((0, 0), text, font=font)
    return bb[2] - bb[0], bb[3] - bb[1]


def build() -> Image.Image:
    sig = _load_sig()

    scale = 2
    rw, rh = W * scale, H * scale
    canvas = Image.new("RGBA", (rw, rh), BLACK + (255,))
    draw = ImageDraw.Draw(canvas)

    pad = 40 * scale
    name_font = load_font(40 * scale, bold=True)
    title_font = load_font(18 * scale)
    contact_font = load_font(19 * scale)
    label_font = load_font(18 * scale)
    cta_font = load_font(18 * scale)
    word_font = load_font(16 * scale)

    # Split: roomy top identity band, brands in lower band (clear of avatar)
    top_band = int(rh * 0.55)

    # ── Logo (upper-left, above avatar) ──────────────────────────────────
    logo = sig.load_exact_logo()
    if logo is not None:
        target_w = 190 * scale
        s = target_w / logo.width
        logo = logo.resize(
            (int(logo.width * s), int(logo.height * s)),
            Image.Resampling.LANCZOS,
        )
        ly = pad + (top_band - pad * 2 - logo.height) // 2
        # Bias logo upward so avatar never kisses it
        ly = min(ly, pad + 8 * scale)
        canvas.alpha_composite(logo, (pad, ly))
        logo_right = pad + logo.width
    else:
        sig.draw_barcode_logo(
            draw, pad, pad + 8 * scale, 190 * scale, 30 * scale, word_font, WHITE
        )
        logo_right = pad + 190 * scale

    div_x = logo_right + 28 * scale
    draw.rectangle(
        [div_x, pad + 4 * scale, div_x + 2 * scale, top_band - pad],
        fill=RULE,
    )

    # ── Identity — signature-style stack (email readable on its own line) ─
    cx = div_x + 28 * scale

    _, name_h = text_size(draw, NAME, name_font)
    _, title_h = text_size(draw, TITLE, title_font)
    _, contact_h = text_size(draw, EMAIL, contact_font)

    gap_title = 6 * scale
    gap_before_contact = 12 * scale
    gap_contact = 5 * scale
    block_h = (
        name_h
        + gap_title
        + title_h
        + gap_before_contact
        + contact_h * 3
        + gap_contact * 2
    )
    cy = pad + max(0, (top_band - pad * 2 - block_h) // 2)
    cy = min(cy, pad + 8 * scale)

    draw.text((cx, cy), NAME, font=name_font, fill=WHITE)
    cy += name_h + gap_title
    draw.text((cx, cy), TITLE, font=title_font, fill=MUTED)
    cy += title_h + gap_before_contact
    for line in (PHONE, EMAIL, URL):
        draw.text((cx, cy), line, font=contact_font, fill=WHITE)
        cy += contact_h + gap_contact

    # ── CTA — pin to right edge for a clean left / right balance ─────────
    pill = sig.make_cta_pill(CTA_LABEL, cta_font, pulse=0.5, shimmer_t=0.35)
    max_pill_h = int(top_band * 0.52)
    if pill.height > max_pill_h:
        ps = max_pill_h / pill.height
        pill = pill.resize(
            (max(1, int(pill.width * ps)), max_pill_h),
            Image.Resampling.LANCZOS,
        )
    glow_inset = int(16 * scale)
    px = rw - pad - (pill.width - glow_inset)
    py = pad + max(0, (top_band - pad * 2 - pill.height) // 2)
    py = min(py, pad + 6 * scale)
    canvas.alpha_composite(pill, (px, py))

    # ── Hairline ─────────────────────────────────────────────────────────
    rule_y = top_band
    draw.rectangle([pad, rule_y, rw - pad, rule_y + scale], fill=RULE)

    # ── Brands — larger, shifted right of avatar pocket ──────────────────
    brands_top = rule_y + 12 * scale
    brands_bottom = rh - int(28 * scale)

    chars = list(BRANDS_LABEL)
    spacing = 4 * scale
    widths = [draw.textbbox((0, 0), ch, font=label_font)[2] for ch in chars]
    total = sum(widths) + spacing * (len(chars) - 1)
    _, label_h = text_size(draw, "X", label_font)

    # Label centered in the clear zone (right of avatar)
    clear_left = AVATAR_CLEAR_X * scale
    clear_w = rw - pad - clear_left
    lx = clear_left + (clear_w - total) / 2
    label_y = brands_top
    for ch, cw in zip(chars, widths):
        draw.text((lx, label_y), ch, font=label_font, fill=MUTED)
        lx += cw + spacing

    row_max_h = max(56 * scale, int(brands_bottom - (label_y + label_h + 8 * scale)))
    # Fill the clear zone — bigger logos, less empty black under the CTA
    row = sig.build_client_row(int(clear_w * 0.96), row_max_h, gap=56 * scale)
    row_y = label_y + label_h + 8 * scale
    remaining = brands_bottom - row_y
    row_y = row_y + max(0, (remaining - row.height) // 2)
    rx = clear_left + (clear_w - row.width) // 2
    canvas.alpha_composite(row, (rx, row_y))

    return canvas.convert("RGB").resize((W, H), Image.Resampling.LANCZOS)


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    final = build()
    assert final.size == (W, H)

    out_png = ROOT / "mosaic-linkedin-banner-1584x396.png"
    out_jpg = ROOT / "mosaic-linkedin-banner-1584x396.jpg"
    preview = ROOT / "mosaic-linkedin-banner-preview.png"

    final.save(out_png, "PNG", optimize=True)
    final.convert("RGB").save(out_jpg, "JPEG", quality=92, optimize=True, progressive=True)
    final.resize((1267, 317), Image.Resampling.LANCZOS).save(preview, "PNG", optimize=True)

    downloads = Path.home() / "Downloads"
    for src in (out_png, out_jpg):
        dest = downloads / src.name
        dest.write_bytes(src.read_bytes())
        print(f"downloads {dest}")

    print(f"saved {out_png} {final.size}")


if __name__ == "__main__":
    main()
