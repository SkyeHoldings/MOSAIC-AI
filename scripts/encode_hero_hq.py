"""Upscale the hero earth clip to a sharper web-ready HQ encode."""

from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / "public"
SRC = PUB / "hero-digital-earth.720p.bak.mp4"
DST = PUB / "hero-digital-earth-hq.mp4"
FFMPEG = (
    shutil.which("ffmpeg")
    or r"C:\Users\skyes\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.EXE"
)


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Missing source: {SRC}")
    if not Path(FFMPEG).exists() and shutil.which("ffmpeg") is None:
        raise SystemExit(f"Missing ffmpeg: {FFMPEG}")

    cmd = [
        FFMPEG,
        "-y",
        "-i",
        str(SRC),
        "-vf",
        "scale=2560:1440:flags=lanczos,unsharp=5:5:0.65:5:5:0.0",
        "-c:v",
        "libx264",
        "-preset",
        "slow",
        "-crf",
        "15",
        "-maxrate",
        "18M",
        "-bufsize",
        "36M",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        "-an",
        str(DST),
    ]
    print("encoding", SRC.name, "->", DST.name, flush=True)
    subprocess.run(cmd, check=True)
    print(f"done {DST.name} {DST.stat().st_size / 1e6:.1f} MB", flush=True)


if __name__ == "__main__":
    main()
