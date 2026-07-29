"""Find / rebuild a sharper Cabela's wordmark."""

from __future__ import annotations

import base64
import re
import zipfile
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

LOGOS = Path(__file__).resolve().parents[1] / "business-cards" / "logos"
DOWNLOADS = Path.home() / "Downloads"
OUT = LOGOS / "official_cabelas.png"
QC = Path(__file__).resolve().parent / "_qc_cab_hires.png"

PAT = re.compile(r"data:image/(png|jpeg);base64,([^\"']+)", re.I)


def save_embeds(svg_text: str, prefix: str) -> list[Path]:
    saved = []
    for i, m in enumerate(PAT.finditer(svg_text)):
        raw = base64.b64decode(m.group(2))
        im = Image.open(BytesIO(raw)).convert("RGBA")
        path = LOGOS / f"{prefix}_{i}_{im.size[0]}x{im.size[1]}.png"
        im.save(path)
        saved.append(path)
        print(f"  embed {i}: {im.size} -> {path.name}")
    return saved


def score_cabelas(path: Path) -> float:
    """Higher is better: large yellow script-ish content."""
    im = Image.open(path).convert("RGBA")
    a = np.array(im)
    r, g, b, alpha = a[:, :, 0], a[:, :, 1], a[:, :, 2], a[:, :, 3]
    yellow = (alpha > 20) & (r > 160) & (g > 120) & (b < 120) & (g > b + 20)
    if yellow.sum() < 80:
        return -1
    ys, xs = np.where(yellow)
    w = int(xs.max() - xs.min() + 1)
    h = int(ys.max() - ys.min() + 1)
    ar = w / max(1, h)
    # Prefer wide wordmarks ~2.5–4.5 aspect, larger area
    if ar < 1.8 or ar > 6.5:
        return w * h * 0.1
    return float(w * h) + ar * 50


def trim_yellow_logo(im: Image.Image) -> Image.Image:
    a = np.array(im.convert("RGBA"))
    r, g, b, alpha = a[:, :, 0], a[:, :, 1], a[:, :, 2], a[:, :, 3]
    yellow = (alpha > 8) & (r > 150) & (g > 110) & (b < 130) & (g > b + 15)
    # also keep dark outline near yellow
    ink = yellow | (
        (alpha > 8)
        & (r + g + b < 180)
        & (np.abs(r.astype(int) - g.astype(int)) < 40)
    )
    # dilate ink slightly to keep outline
    mask = Image.fromarray((ink.astype(np.uint8) * 255), "L").filter(
        ImageFilter.MaxFilter(3)
    )
    m = np.array(mask) > 0
    ys, xs = np.where(m)
    if not len(xs):
        return im
    pad = 6
    crop = im.crop(
        (
            max(0, int(xs.min()) - pad),
            max(0, int(ys.min()) - pad),
            min(im.width, int(xs.max()) + pad + 1),
            min(im.height, int(ys.max()) + pad + 1),
        )
    )
    # knockout near-white page
    arr = np.array(crop.convert("RGBA"))
    rr, gg, bb, aa = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    page = (aa < 8) | ((rr > 245) & (gg > 245) & (bb > 245))
    arr[page, 3] = 0
    soft = (rr > 230) & (gg > 230) & (bb > 230) & ~page
    arr[soft, 3] = np.minimum(arr[soft, 3], ((255 - rr[soft]) * 6).clip(0, 255))
    return Image.fromarray(arr, "RGBA")


def main() -> None:
    candidates: list[Path] = []

    zpath = DOWNLOADS / "Gold Monogram Simple Real Estate Business Card.zip"
    if zpath.exists():
        print("scanning zip SVGs…")
        with zipfile.ZipFile(zpath) as zf:
            for name in zf.namelist():
                if not name.endswith(".svg"):
                    continue
                text = zf.read(name).decode("utf-8", errors="replace")
                print(name)
                candidates.extend(save_embeds(text, f"_zipcab_{Path(name).stem}"))

    for svg in DOWNLOADS.glob("*.svg"):
        text = svg.read_text(encoding="utf-8", errors="replace")
        if not PAT.search(text):
            continue
        print("scanning", svg.name)
        candidates.extend(save_embeds(text, f"_dlcab_{svg.stem[:20]}"))

    # Also existing logos
    for p in LOGOS.glob("*cabela*"):
        candidates.append(p)
    for p in LOGOS.glob("_svg_embed_*.png"):
        candidates.append(p)

    # Crop Cabela's side from JML lockup if present
    jml = DOWNLOADS / "jml-blk-bps-cab-horizontal-png.png"
    if jml.exists():
        im = Image.open(jml).convert("RGBA")
        # right half roughly
        right = im.crop((im.width // 2, 0, im.width, im.height))
        path = LOGOS / "_jml_cab_right.png"
        right.save(path)
        candidates.append(path)
        print("jml right half", right.size)

    scored = []
    for p in candidates:
        try:
            s = score_cabelas(p)
        except Exception:
            continue
        if s > 0:
            scored.append((s, p))
    scored.sort(reverse=True)
    print("\nTop Cabela's candidates:")
    for s, p in scored[:12]:
        im = Image.open(p)
        print(f"  {s:10.0f}  {im.size[0]:4d}x{im.size[1]:4d}  {p.name}")

    if not scored:
        raise SystemExit("no candidates")

    best = scored[0][1]
    print("\nUsing", best)
    cleaned = trim_yellow_logo(Image.open(best))
    # Upscale with LANCZOS only if still small — prefer keeping native if large
    if cleaned.height < 180:
        scale = max(2, int(round(220 / cleaned.height)))
        cleaned = cleaned.resize(
            (cleaned.width * scale, cleaned.height * scale),
            Image.Resampling.LANCZOS,
        )
        cleaned = cleaned.filter(ImageFilter.UnsharpMask(radius=1.2, percent=120, threshold=2))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    # backup
    if OUT.exists():
        OUT.replace(LOGOS / "official_cabelas_pixelated_bak.png")
    cleaned.save(OUT)
    cleaned.save(QC)
    print("saved", OUT, cleaned.size)


if __name__ == "__main__":
    main()
