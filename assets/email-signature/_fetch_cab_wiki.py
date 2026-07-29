import re
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image

ua = {"User-Agent": "Mozilla/5.0"}
out = Path(__file__).resolve().parents[1] / "business-cards" / "logos"

url = "https://en.wikipedia.org/wiki/Cabela%27s"
html = urllib.request.urlopen(urllib.request.Request(url, headers=ua), timeout=30).read().decode(
    "utf-8", "replace"
)
uploads = re.findall(r"//upload\.wikimedia\.org/[^\"\s<>]+", html)
print("upload count", len(uploads))
for u in uploads:
    if any(k in u.lower() for k in ("abela", "logo", "wordmark")):
        print(" ", u)

# try common brand logo CDNs
candidates = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Cabelas_logo.svg/1280px-Cabelas_logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/en/thumb/3/3e/Cabelas_logo.svg/1280px-Cabelas_logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/3/3e/Cabelas_logo.svg",
]
# parse infobox image
m = re.search(r"infobox[\s\S]{0,2000}?src=\"(//upload\.wikimedia\.org/[^\"]+)\"", html, re.I)
if m:
    candidates.insert(0, "https:" + m.group(1))
    print("infobox", m.group(1))

for i, u in enumerate(candidates):
    try:
        if u.startswith("//"):
            u = "https:" + u
        data = urllib.request.urlopen(urllib.request.Request(u, headers=ua), timeout=20).read()
        p = out / f"_wiki_cab_{i}.bin"
        p.write_bytes(data)
        if data[:4] == b"\x89PNG" or data[:1] == b"<" or b"<svg" in data[:200]:
            if data[:4] == b"\x89PNG":
                im = Image.open(BytesIO(data))
                print("PNG", im.size, u)
                im.save(out / f"_wiki_cab_{i}.png")
            else:
                print("SVG/XML", len(data), u)
                (out / f"_wiki_cab_{i}.svg").write_bytes(data)
        else:
            print("other", data[:30], u)
    except Exception as e:
        print("fail", type(e).__name__, e, u[:80])
