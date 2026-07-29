"""Vectorize Cabela's and rasterize a sharp high-res PNG."""

from __future__ import annotations

from io import BytesIO
from pathlib import Path

import numpy as np
import vtracer
from PIL import Image, ImageFilter

LOGOS = Path(__file__).resolve().parents[1] / "business-cards" / "logos"
QC = Path(__file__).resolve().parent / "_qc_cab_hires.png"
SRC = LOGOS / "official_cabelas.png"
SVG = LOGOS / "_cab_traced.svg"
YELLOW = "#F5C518"
OUTLINE = "#1A1A1A"


def main() -> None:
    im = Image.open(SRC).convert("RGBA")
    a = np.array(im)
    r, g, b, al = a[:, :, 0], a[:, :, 1], a[:, :, 2], a[:, :, 3]
    page = (al < 8) | ((r > 245) & (g > 245) & (b > 245))
    ink = ~page
    sil = np.full((im.height, im.width, 3), 255, dtype=np.uint8)
    sil[ink] = (0, 0, 0)
    trace_in = LOGOS / "_cab_trace_in.png"
    Image.fromarray(sil).save(trace_in)

    vtracer.convert_image_to_svg_py(
        str(trace_in),
        str(SVG),
        colormode="binary",
        hierarchical="stacked",
        mode="spline",
        filter_speckle=4,
        color_precision=6,
        layer_difference=16,
        corner_threshold=60,
        length_threshold=4.0,
        max_iterations=10,
        splice_threshold=45,
        path_precision=3,
    )

    svg = SVG.read_text(encoding="utf-8")
    svg = svg.replace('fill="#000000"', f'fill="{YELLOW}"')
    svg = svg.replace("fill='#000000'", f"fill='{YELLOW}'")
    if "fill=" not in svg:
        svg = svg.replace("<svg ", f'<svg fill="{YELLOW}" ')
    svg = svg.replace(
        "<path ",
        f'<path stroke="{OUTLINE}" stroke-width="1.4" stroke-linejoin="round" paint-order="stroke fill" ',
    )
    SVG.write_text(svg, encoding="utf-8")

    try:
        import cairosvg
    except Exception:
        # cairo often missing on Windows — fall back to Pillow + scale cleanup
        print("cairosvg unavailable, using edge-smooth upscale fallback")
        _fallback_upscale(im)
        return

    try:
        png = cairosvg.svg2png(
            bytestring=svg.encode("utf-8"),
            output_width=1400,
            output_height=max(1, int(1400 * im.height / im.width)),
        )
    except Exception as e:
        print("cairosvg failed:", e)
        _fallback_upscale(im)
        return

    out = Image.open(BytesIO(png)).convert("RGBA")
    arr = np.array(out)
    rr, gg, bb, aa = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    page = ((rr > 250) & (gg > 250) & (bb > 250)) | (aa < 8)
    arr[page, 3] = 0
    out = Image.fromarray(arr)
    ys, xs = np.where(arr[:, :, 3] > 10)
    out = out.crop((xs.min() - 4, ys.min() - 4, xs.max() + 5, ys.max() + 5))
    out.save(SRC)
    out.save(QC)
    print("saved vectorized", SRC, out.size)


def _fallback_upscale(im: Image.Image) -> None:
    """Smooth-edge 4x rebuild when cairo isn't available."""
    a = np.array(im.convert("RGBA"))
    r, g, b, al = a[:, :, 0], a[:, :, 1], a[:, :, 2], a[:, :, 3]
    page = (al < 8) | ((r > 245) & (g > 245) & (b > 245))
    ink = (~page).astype(np.uint8) * 255
    mask = Image.fromarray(ink, "L")
    # Upscale mask smoothly
    w, h = mask.size
    mask4 = mask.resize((w * 4, h * 4), Image.Resampling.LANCZOS)
    mask4 = mask4.filter(ImageFilter.GaussianBlur(radius=0.8))
    m = np.array(mask4)
    hard = (m > 110).astype(np.uint8) * 255
    soft = Image.fromarray(hard, "L").filter(ImageFilter.GaussianBlur(radius=0.6))
    alpha = np.array(soft)

    # Outline = dilated - eroded
    dil = Image.fromarray(hard, "L").filter(ImageFilter.MaxFilter(5))
    ero = Image.fromarray(hard, "L").filter(ImageFilter.MinFilter(5))
    outline = (np.array(dil) > 128) & ~(np.array(ero) > 128)

    rgba = np.zeros((alpha.shape[0], alpha.shape[1], 4), dtype=np.uint8)
    # yellow fill
    fill = alpha > 40
    rgba[fill, 0] = 245
    rgba[fill, 1] = 197
    rgba[fill, 2] = 24
    rgba[fill, 3] = alpha[fill]
    # dark outline
    rgba[outline, 0] = 26
    rgba[outline, 1] = 26
    rgba[outline, 2] = 26
    rgba[outline, 3] = 255

    out = Image.fromarray(rgba, "RGBA")
    ys, xs = np.where(rgba[:, :, 3] > 10)
    out = out.crop((xs.min() - 4, ys.min() - 4, xs.max() + 5, ys.max() + 5))
    out = out.filter(ImageFilter.UnsharpMask(radius=1.0, percent=110, threshold=2))
    out.save(SRC)
    out.save(QC)
    print("saved fallback upscale", SRC, out.size)


if __name__ == "__main__":
    main()
