"""Build a Staples-ready letter flyer PDF with guaranteed dark edges."""
from __future__ import annotations

import subprocess
from pathlib import Path

import fitz
from PIL import Image

ROOT = Path(r"C:\Users\skyes\Projects\understory-marketing-site")
OUT = Path(r"C:\Users\skyes\Downloads\mosaic-flyer-staples.pdf")
OUT_MAIN = Path(r"C:\Users\skyes\Downloads\mosaic-flyer.pdf")
CHECK_PNG = Path(r"C:\Users\skyes\Downloads\mosaic-flyer-staples-preview.png")


def export_via_playwright() -> Path:
    script = ROOT / "scripts" / "export-onesheet-pdf.mjs"
    subprocess.run(["node", str(script)], cwd=ROOT, check=True)
    return OUT_MAIN


def force_dark_edges(pdf_path: Path, out_path: Path) -> None:
    doc = fitz.open(pdf_path)
    page = doc[0]
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
    img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    w, h = img.size
    px = img.load()
    deep = (5, 7, 10)

    def is_near_white(c: tuple[int, int, int], thr: int = 245) -> bool:
        return c[0] >= thr and c[1] >= thr and c[2] >= thr

    # Only paint true white edge pixels — leave light grey text alone
    band = 8
    for y in range(h):
        for x in list(range(0, band)) + list(range(w - band, w)):
            if is_near_white(px[x, y]):
                px[x, y] = deep
    for y in list(range(0, band)) + list(range(h - band, h)):
        for x in range(w):
            if is_near_white(px[x, y]):
                px[x, y] = deep

    img.save(CHECK_PNG, "PNG")

    out = fitz.open()
    # Exact US Letter
    pg = out.new_page(width=612, height=792)
    pg.insert_image(pg.rect, filename=str(CHECK_PNG))
    out.save(out_path)
    out.close()
    doc.close()


def verify(path: Path) -> None:
    doc = fitz.open(path)
    page = doc[0]
    print("file", path)
    print("inches", page.mediabox.width / 72, "x", page.mediabox.height / 72)
    pix = page.get_pixmap(matrix=fitz.Matrix(1, 1), alpha=False)
    w, h = pix.width, pix.height

    def sample(x: int, y: int) -> tuple[int, int, int]:
        return pix.pixel(x, y)

    print(
        "corners",
        sample(0, 0),
        sample(w - 1, 0),
        sample(0, h - 1),
        sample(w - 1, h - 1),
    )
    whites = 0
    for y in [0, 1, h - 2, h - 1]:
        for x in range(0, w, 8):
            r, g, b = sample(x, y)
            if r > 220 and g > 220 and b > 220:
                whites += 1
    print("edge white samples", whites)
    doc.close()


if __name__ == "__main__":
    src = export_via_playwright()
    force_dark_edges(src, OUT)
    try:
        force_dark_edges(src, OUT_MAIN)
    except Exception as exc:
        print("Could not overwrite mosaic-flyer.pdf (file may be open):", exc)
    verify(OUT)
    if OUT_MAIN.exists():
        try:
            verify(OUT_MAIN)
        except Exception:
            pass
    print("preview", CHECK_PNG)
