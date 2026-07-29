"""Smooth Cabela's mask → vector → Chrome render → sharp official PNG."""

from __future__ import annotations

import subprocess
from pathlib import Path

import numpy as np
import vtracer
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent
LOGOS = ROOT.parent / "business-cards" / "logos"
# Prefer the known embed over a bad official overwrite
CANDIDATES = [
    LOGOS / "_zipcab_2_1_491x396.png",
    LOGOS / "_svg_embed_1.png",
    LOGOS / "official_cabelas_pixelated_bak.png",
    LOGOS / "official_cabelas_prev.png",
]
OUT = LOGOS / "official_cabelas.png"
QC = ROOT / "_qc_cab_hires.png"
TRACE_IN = LOGOS / "_cab_trace_smooth.png"
SVG = LOGOS / "_cab_traced.svg"
HTML = ROOT / "_cab_render.html"
SHOT = ROOT / "_cab_chrome.png"
CHROME = Path.home() / "AppData/Local/Google/Chrome/Application/chrome.exe"
YELLOW = "#F5C518"
OUTLINE = "#1A1A1A"
W, H = 1600, 480


def load_source() -> Image.Image:
    for p in CANDIDATES:
        if p.exists():
            im = Image.open(p).convert("RGBA")
            a = np.array(im)
            r, g, b, al = a[:, :, 0], a[:, :, 1], a[:, :, 2], a[:, :, 3]
            ink = ~((al < 8) | ((r > 245) & (g > 245) & (b > 245)))
            ys, xs = np.where(ink)
            im = im.crop(
                (
                    max(0, int(xs.min()) - 4),
                    max(0, int(ys.min()) - 4),
                    min(im.width, int(xs.max()) + 5),
                    min(im.height, int(ys.max()) + 5),
                )
            )
            print("source", p.name, im.size)
            return im
    raise SystemExit("no cabelas source")


def smooth_mask(im: Image.Image, scale: int = 8) -> Image.Image:
    a = np.array(im.convert("RGBA"))
    r, g, b, al = a[:, :, 0], a[:, :, 1], a[:, :, 2], a[:, :, 3]
    page = (al < 8) | ((r > 245) & (g > 245) & (b > 245))
    ink = (~page).astype(np.uint8) * 255
    mask = Image.fromarray(ink, "L")
    # Upscale then heavy blur + re-threshold → smooth curves
    mask = mask.resize((mask.width * scale, mask.height * scale), Image.Resampling.NEAREST)
    mask = mask.filter(ImageFilter.MaxFilter(3))  # close tiny holes
    mask = mask.filter(ImageFilter.MinFilter(3))
    mask = mask.filter(ImageFilter.GaussianBlur(radius=scale * 0.55))
    arr = np.array(mask)
    hard = (arr > 128).astype(np.uint8) * 255
    # second pass soften
    soft = Image.fromarray(hard, "L").filter(ImageFilter.GaussianBlur(radius=1.2))
    hard2 = (np.array(soft) > 128).astype(np.uint8) * 255
    out = Image.fromarray(hard2, "L").convert("RGB")
    # black ink on white
    rgb = np.array(out)
    rgb[hard2 == 0] = (255, 255, 255)
    rgb[hard2 == 255] = (0, 0, 0)
    return Image.fromarray(rgb)


def trace(mask_rgb: Image.Image) -> str:
    mask_rgb.save(TRACE_IN)
    vtracer.convert_image_to_svg_py(
        str(TRACE_IN),
        str(SVG),
        colormode="binary",
        hierarchical="stacked",
        mode="spline",
        filter_speckle=8,
        color_precision=6,
        layer_difference=16,
        corner_threshold=80,
        length_threshold=5.0,
        max_iterations=12,
        splice_threshold=45,
        path_precision=2,
    )
    svg = SVG.read_text(encoding="utf-8")
    svg = svg.replace('fill="#000000"', f'fill="{YELLOW}"')
    svg = svg.replace("fill='#000000'", f"fill='{YELLOW}'")
    if f'fill="{YELLOW}"' not in svg and "fill=" not in svg:
        svg = svg.replace("<svg ", f'<svg fill="{YELLOW}" ')
    # light outline
    svg = svg.replace(
        "<path ",
        f'<path stroke="{OUTLINE}" stroke-width="{2.2}" stroke-linejoin="round" paint-order="stroke fill" ',
    )
    # ensure viewBox from width/height
    if "viewBox" not in svg:
        import re

        m = re.search(r'width="(\d+)"\s+height="(\d+)"', svg)
        if m:
            svg = svg.replace(
                "<svg ",
                f'<svg viewBox="0 0 {m.group(1)} {m.group(2)}" ',
                1,
            )
    SVG.write_text(svg, encoding="utf-8")
    return svg


def render_chrome(svg: str) -> Image.Image:
    # scale via viewBox
    import re

    m = re.search(r'viewBox="0 0 (\d+) (\d+)"', svg)
    if m:
        vw, vh = int(m.group(1)), int(m.group(2))
        target_w = 1400
        target_h = max(1, int(target_w * vh / vw))
        svg = re.sub(r'\swidth="[^"]*"', f' width="{target_w}"', svg, count=1)
        svg = re.sub(r'\sheight="[^"]*"', f' height="{target_h}"', svg, count=1)

    HTML.write_text(
        f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
html,body{{margin:0;background:#000;width:{W}px;height:{H}px;overflow:hidden}}
.wrap{{width:{W}px;height:{H}px;display:flex;align-items:center;justify-content:center}}
svg{{display:block}}
</style></head>
<body><div class="wrap">{svg}</div></body></html>""",
        encoding="utf-8",
    )
    if SHOT.exists():
        SHOT.unlink()
    subprocess.run(
        [
            str(CHROME),
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            "--force-device-scale-factor=1",
            f"--window-size={W},{H}",
            f"--screenshot={SHOT}",
            HTML.as_uri(),
        ],
        check=True,
        capture_output=True,
    )
    return Image.open(SHOT).convert("RGBA")


def extract_logo(shot: Image.Image) -> Image.Image:
    """Keep Chrome anti-aliasing — hard thresholding made edges jagged again."""
    arr = np.array(shot.convert("RGBA"))
    r = arr[:, :, 0].astype(np.int16)
    g = arr[:, :, 1].astype(np.int16)
    b = arr[:, :, 2].astype(np.int16)

    # Pure black page → transparent; everything else keeps soft alpha from brightness
    brightness = np.maximum(np.maximum(r, g), b)
    page = brightness < 12
    alpha = np.clip(brightness.astype(np.float32) * 1.35, 0, 255).astype(np.uint8)
    alpha[page] = 0

    # Solid yellow cores fully opaque
    yellow = (r > 170) & (g > 130) & (b < 120) & (g > b + 20)
    alpha[yellow] = 255

    out = arr.copy()
    out[:, :, 3] = alpha
    im = Image.fromarray(out, "RGBA")
    ys, xs = np.where(alpha > 12)
    im = im.crop(
        (
            max(0, int(xs.min()) - 8),
            max(0, int(ys.min()) - 8),
            min(im.width, int(xs.max()) + 9),
            min(im.height, int(ys.max()) + 9),
        )
    )
    return im


def main() -> None:
    src = load_source()
    mask = smooth_mask(src, scale=8)
    print("smooth mask", mask.size)
    svg = trace(mask)
    print("svg bytes", SVG.stat().st_size)
    shot = render_chrome(svg)
    print("shot", shot.size)
    logo = extract_logo(shot)
    logo.save(OUT)
    logo.save(QC)
    print("saved", OUT, logo.size)


if __name__ == "__main__":
    main()
