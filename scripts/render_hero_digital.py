"""Render a crisp native digital-landscape hero video (no 720p upscale)."""

from __future__ import annotations

import math
import random
import shutil
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "hero-digital-earth-hq.mp4"
FFMPEG = (
    shutil.which("ffmpeg")
    or r"C:\Users\skyes\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.EXE"
)

WIDTH, HEIGHT = 2560, 1440
FPS = 30
DURATION_S = 12
TOTAL = FPS * DURATION_S
HORIZON = int(HEIGHT * 0.58)
RNG = random.Random(42)


def make_streaks(n: int = 220) -> list[dict]:
    streaks = []
    for _ in range(n):
        x = RNG.uniform(0.02, 0.98)
        # Bias brighter / taller streaks toward center
        center = abs(x - 0.52)
        height = RNG.uniform(0.35, 0.95) * (1.15 - center)
        width = RNG.uniform(1.0, 3.2) if center > 0.08 else RNG.uniform(2.0, 7.0)
        brightness = RNG.uniform(0.25, 0.85) * (1.1 - center * 0.7)
        speed = RNG.uniform(0.08, 0.35)
        phase = RNG.uniform(0, math.tau)
        streaks.append(
            {
                "x": x,
                "h": min(height, 0.98),
                "w": width,
                "b": brightness,
                "speed": speed,
                "phase": phase,
            }
        )
    # Strong central pillar cluster
    for i in range(18):
        streaks.append(
            {
                "x": 0.50 + RNG.uniform(-0.035, 0.045),
                "h": RNG.uniform(0.72, 0.98),
                "w": RNG.uniform(2.5, 9.0),
                "b": RNG.uniform(0.7, 1.0),
                "speed": RNG.uniform(0.05, 0.18),
                "phase": RNG.uniform(0, math.tau),
            }
        )
    return streaks


def make_particles(n: int = 160) -> list[dict]:
    return [
        {
            "x": RNG.uniform(0.05, 0.95),
            "y": RNG.uniform(0.05, 0.55),
            "r": RNG.uniform(1.2, 3.8),
            "b": RNG.uniform(0.35, 0.95),
            "drift": RNG.uniform(0.01, 0.04),
            "phase": RNG.uniform(0, math.tau),
        }
        for _ in range(n)
    ]


STREAKS = make_streaks()
PARTICLES = make_particles()


def render_floor(t: float) -> Image.Image:
    """Perspective grid + soft circuit glow on the lower half."""
    img = Image.new("RGB", (WIDTH, HEIGHT), (4, 6, 10))
    draw = ImageDraw.Draw(img, "RGBA")

    # Floor fill
    draw.rectangle((0, HORIZON, WIDTH, HEIGHT), fill=(6, 9, 14, 255))

    # Perspective horizontal lines
    for i in range(1, 28):
        u = i / 28
        # Ease toward horizon
        y = HORIZON + int((HEIGHT - HORIZON) * (u**1.65))
        alpha = int(28 + 90 * (1 - u))
        draw.line((0, y, WIDTH, y), fill=(120, 170, 210, alpha), width=1)

    # Perspective verticals converging to vanishing point
    vanish_x = WIDTH * 0.52
    for i in range(-24, 25):
        x0 = vanish_x + i * (WIDTH * 0.045)
        alpha = int(22 + 55 * (1 - abs(i) / 24))
        draw.line((vanish_x, HORIZON, x0, HEIGHT), fill=(100, 150, 190, alpha), width=1)

    # Soft glowing tiles drifting toward camera
    for i in range(40):
        phase = (t * 0.12 + i * 0.17) % 1.0
        depth = phase
        y = HORIZON + int((HEIGHT - HORIZON) * (depth**1.5))
        span = 18 + depth * 70
        cx = vanish_x + math.sin(i * 1.7 + t * 0.4) * (WIDTH * 0.28 * depth)
        glow = int(40 + 90 * depth)
        box = [cx - span, y - span * 0.22, cx + span, y + span * 0.22]
        draw.rectangle(box, fill=(90, 160, 220, glow))

    # Circuit-ish nodes near horizon
    for i in range(50):
        x = WIDTH * (0.08 + 0.84 * ((i * 0.137) % 1))
        y = HORIZON + 8 + (i % 7) * 10
        pulse = 0.5 + 0.5 * math.sin(t * 2.2 + i)
        r = 1.5 + pulse * 2.2
        a = int(80 + 120 * pulse)
        draw.ellipse((x - r, y - r, x + r, y + r), fill=(140, 200, 255, a))

    # Soft blur so floor reads luminous, not harsh
    floor = img.crop((0, HORIZON - 2, WIDTH, HEIGHT)).filter(ImageFilter.GaussianBlur(0.8))
    img.paste(floor, (0, HORIZON - 2))
    return img


def render_frame(frame: int) -> Image.Image:
    t = frame / FPS
    base = render_floor(t)
    draw = ImageDraw.Draw(base, "RGBA")

    # Sky gradient above horizon
    sky = Image.new("RGB", (WIDTH, HORIZON + 4), (3, 5, 9))
    sky_draw = ImageDraw.Draw(sky, "RGBA")
    for y in range(HORIZON + 4):
        u = y / max(HORIZON, 1)
        a = int(18 * u)
        sky_draw.line((0, y, WIDTH, y), fill=(20, 40, 70, a))
    base.paste(sky, (0, 0))

    # Vertical streaks
    for s in STREAKS:
        pulse = 0.65 + 0.35 * math.sin(t * s["speed"] * math.tau + s["phase"])
        h = int(HORIZON * s["h"] * pulse)
        x = int(s["x"] * WIDTH)
        top = HORIZON - h
        b = min(1.0, s["b"] * pulse)
        # Core
        core_a = int(255 * b)
        w = max(1, int(s["w"]))
        draw.line((x, top, x, HORIZON), fill=(230, 240, 255, core_a), width=w)
        # Soft halo
        if w >= 3:
            draw.line(
                (x, top + int(h * 0.08), x, HORIZON),
                fill=(160, 200, 255, int(70 * b)),
                width=w + 4,
            )

    # Bright central bloom
    bloom_x = int(WIDTH * 0.52)
    for radius, alpha in ((90, 28), (50, 48), (24, 90)):
        draw.ellipse(
            (
                bloom_x - radius,
                HORIZON - radius * 0.35,
                bloom_x + radius,
                HORIZON + radius * 0.25,
            ),
            fill=(180, 210, 255, alpha),
        )

    # Floating particles
    for p in PARTICLES:
        x = (p["x"] + 0.01 * math.sin(t * p["drift"] * 10 + p["phase"])) * WIDTH
        y = (p["y"] + 0.015 * math.sin(t * 0.7 + p["phase"])) * HORIZON
        r = p["r"]
        a = int(255 * p["b"] * (0.7 + 0.3 * math.sin(t * 2 + p["phase"])))
        draw.ellipse((x - r, y - r, x + r, y + r), fill=(240, 245, 255, a))

    # Subtle vignette
    vignette = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    vdraw = ImageDraw.Draw(vignette)
    for i in range(80):
        a = int(2.2 * i)
        vdraw.rectangle((i, i, WIDTH - 1 - i, HEIGHT - 1 - i), outline=(0, 0, 0, a))
    base = Image.alpha_composite(base.convert("RGBA"), vignette).convert("RGB")
    return base


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        FFMPEG,
        "-y",
        "-f",
        "rawvideo",
        "-vcodec",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        "-s",
        f"{WIDTH}x{HEIGHT}",
        "-r",
        str(FPS),
        "-i",
        "-",
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "16",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        str(OUT),
    ]
    print(f"rendering {TOTAL} frames @ {WIDTH}x{HEIGHT} -> {OUT.name}", flush=True)
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    assert proc.stdin is not None
    try:
        for i in range(TOTAL):
            frame = render_frame(i)
            proc.stdin.write(frame.tobytes())
            if i % 30 == 0:
                print(f"frame {i}/{TOTAL}", flush=True)
        proc.stdin.close()
        stderr = proc.stderr.read().decode("utf-8", errors="ignore") if proc.stderr else ""
        code = proc.wait()
        if code != 0:
            raise SystemExit(f"ffmpeg failed ({code}):\n{stderr[-2000:]}")
    finally:
        if proc.poll() is None:
            proc.kill()
    print(f"done {OUT} {OUT.stat().st_size / 1e6:.1f} MB", flush=True)


if __name__ == "__main__":
    main()
