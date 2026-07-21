"""AI-upscale the original hero clip with Real-ESRGAN (native detail, same look)."""

from __future__ import annotations

import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / "public"
SRC = PUB / "hero-digital-earth.720p.bak.mp4"
DST = PUB / "hero-digital-earth-hq.mp4"
TOOLS = ROOT / "tools" / "realesrgan"
RESRGAN = TOOLS / "realesrgan-ncnn-vulkan.exe"
FFMPEG = (
    shutil.which("ffmpeg")
    or r"C:\Users\skyes\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.EXE"
)


def run(cmd: list[str]) -> None:
    print("+", " ".join(cmd), flush=True)
    subprocess.run(cmd, check=True)


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Missing source: {SRC}")
    if not RESRGAN.exists():
        raise SystemExit(f"Missing Real-ESRGAN: {RESRGAN}")

    with tempfile.TemporaryDirectory(prefix="hero_up_") as tmp:
        tmp_path = Path(tmp)
        frames_in = tmp_path / "in"
        frames_out = tmp_path / "out"
        frames_in.mkdir()
        frames_out.mkdir()

        print("extracting frames...", flush=True)
        run(
            [
                FFMPEG,
                "-y",
                "-i",
                str(SRC),
                "-vsync",
                "0",
                str(frames_in / "frame_%04d.png"),
            ]
        )
        n = len(list(frames_in.glob("*.png")))
        print(f"extracted {n} frames", flush=True)

        print("AI upscaling 2x (realesr-animevideov3)...", flush=True)
        run(
            [
                str(RESRGAN),
                "-i",
                str(frames_in),
                "-o",
                str(frames_out),
                "-n",
                "realesr-animevideov3",
                "-s",
                "2",
                "-f",
                "png",
            ]
        )

        upscaled = sorted(frames_out.glob("*.png"))
        print(f"upscaled {len(upscaled)} frames", flush=True)
        if not upscaled:
            raise SystemExit("No upscaled frames produced")

        # Probe first frame size
        from PIL import Image

        w, h = Image.open(upscaled[0]).size
        print(f"frame size {w}x{h}", flush=True)

        tmp_mp4 = tmp_path / "upscaled.mp4"
        print("encoding HQ mp4...", flush=True)
        run(
            [
                FFMPEG,
                "-y",
                "-framerate",
                "25",
                "-i",
                str(frames_out / "frame_%04d.png"),
                "-vf",
                "format=gray,format=yuv420p",
                "-c:v",
                "libx264",
                "-preset",
                "slow",
                "-crf",
                "14",
                "-maxrate",
                "20M",
                "-bufsize",
                "40M",
                "-movflags",
                "+faststart",
                "-an",
                str(tmp_mp4),
            ]
        )
        shutil.copy2(tmp_mp4, DST)
        print(f"done {DST} {DST.stat().st_size / 1e6:.1f} MB", flush=True)


if __name__ == "__main__":
    main()
