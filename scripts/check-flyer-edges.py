from PIL import Image
import fitz
import os

attached = r"C:\Users\skyes\.cursor\projects\c-Users-skyes-Projects-understory-marketing-site\assets\c__Users_skyes_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_mosaic-flyer-pdf-render-5b01bb40-af75-4702-a06d-538b5fc04751.png"
pdf = r"C:\Users\skyes\Downloads\mosaic-flyer.pdf"

print("=== attached render ===")
img = Image.open(attached).convert("RGB")
w, h = img.size
px = img.load()
print("size", w, h)
print("corners", px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1])
print("bottom mid", [px[w // 2, h - 1 - i] for i in range(10)])


def is_white(c, thr=220):
    return c[0] >= thr and c[1] >= thr and c[2] >= thr


for y in range(h - 1, max(h - 30, -1), -1):
    wc = sum(1 for x in range(0, w, 2) if is_white(px[x, y]))
    if wc:
        print(f"row frombot={h-1-y} whiteish={wc} mid={px[w//2,y]}")

print("\n=== current downloads pdf ===")
doc = fitz.open(pdf)
page = doc[0]
print("inches", page.mediabox.width / 72, page.mediabox.height / 72)
pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
img2 = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
w2, h2 = img2.size
px2 = img2.load()
print("corners", px2[0, 0], px2[w2 - 1, 0], px2[0, h2 - 1], px2[w2 - 1, h2 - 1])
print("bottom mid", [px2[w2 // 2, h2 - 1 - i] for i in range(10)])
for y in range(h2 - 1, max(h2 - 30, -1), -1):
    wc = sum(1 for x in range(0, w2, 2) if is_white(px2[x, y]))
    if wc:
        print(f"row frombot={h2-1-y} whiteish={wc} mid={px2[w2//2,y]}")
