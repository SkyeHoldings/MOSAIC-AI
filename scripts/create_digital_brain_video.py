"""Render a digital-brain thought-bubble showcase video."""

from __future__ import annotations

import math
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
BRAIN_PATH = ROOT / "assets" / "digital-brain-base.png"
OUT_PATH = ROOT / "assets" / "videos" / "digital-brain-thoughts.mp4"
FFMPEG = (
    shutil.which("ffmpeg")
    or r"C:\Users\skyes\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin\ffmpeg.EXE"
)

WIDTH, HEIGHT = 1920, 1080
FPS = 30
DURATION_S = 22
TOTAL_FRAMES = FPS * DURATION_S
# One and a half full turns across the video
ROTATIONS = 1.5
BG = (5, 10, 25)

QUESTIONS = [
    {
        "text": "What motivates\nyour customers?",
        "anchor": (0.18, 0.22),
        "appear_at": 2.0,
    },
    {
        "text": "How do we get\nthem to act?",
        "anchor": (0.82, 0.24),
        "appear_at": 5.5,
    },
    {
        "text": "What draws them in\nto your brand?",
        "anchor": (0.16, 0.72),
        "appear_at": 9.0,
    },
    {
        "text": "How do we keep them\ncoming back for more?",
        "anchor": (0.84, 0.74),
        "appear_at": 12.5,
    },
]

FONT_PATH = Path(r"C:\Windows\Fonts\segoeui.ttf")
FONT_BOLD_PATH = Path(r"C:\Windows\Fonts\segoeuib.ttf")


def ease_out_cubic(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    path = FONT_BOLD_PATH if bold and FONT_BOLD_PATH.exists() else FONT_PATH
    return ImageFont.truetype(str(path), size=size)


def fit_brain(src: Image.Image, canvas_w: int = WIDTH, canvas_h: int = HEIGHT) -> Image.Image:
    """Cover-fit brain art into a canvas, filling letterbox with dark bg."""
    src = src.convert("RGB")
    scale = max(canvas_w / src.width, canvas_h / src.height)
    nw, nh = int(src.width * scale), int(src.height * scale)
    resized = src.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (canvas_w, canvas_h), BG)
    left = (canvas_w - nw) // 2
    top = (canvas_h - nh) // 2
    canvas.paste(resized, (left, top))
    return canvas


def rotating_brain(base_large: Image.Image, angle_deg: float) -> Image.Image:
    """Rotate an oversized brain plate, then center-crop to frame size."""
    rotated = base_large.rotate(
        angle_deg,
        resample=Image.Resampling.BICUBIC,
        expand=False,
        fillcolor=BG,
    )
    left = (rotated.width - WIDTH) // 2
    top = (rotated.height - HEIGHT) // 2
    return rotated.crop((left, top, left + WIDTH, top + HEIGHT))


def rounded_rect(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def wrap_metrics(draw, text, font):
    lines = text.split("\n")
    widths = []
    heights = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        widths.append(bbox[2] - bbox[0])
        heights.append(bbox[3] - bbox[1])
    return lines, max(widths), sum(heights) + (len(lines) - 1) * 10


def draw_thought_bubble(canvas, text, cx, cy, alpha, float_y, brain_center):
    if alpha <= 0.01:
        return

    overlay = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    font = load_font(42, bold=True)

    lines, text_w, text_h = wrap_metrics(draw, text, font)
    pad_x, pad_y = 44, 34
    bubble_w = text_w + pad_x * 2
    bubble_h = text_h + pad_y * 2

    x = int(cx - bubble_w / 2)
    y = int(cy - bubble_h / 2 + float_y)
    box = (x, y, x + bubble_w, y + bubble_h)

    glow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.rounded_rectangle(
        (box[0] - 8, box[1] - 8, box[2] + 8, box[3] + 8),
        radius=36,
        fill=(80, 200, 255, int(70 * alpha)),
    )
    glow = glow.filter(ImageFilter.GaussianBlur(16))
    overlay = Image.alpha_composite(overlay, glow)
    draw = ImageDraw.Draw(overlay)

    rounded_rect(
        draw,
        box,
        radius=28,
        fill=(8, 18, 36, int(210 * alpha)),
        outline=(140, 220, 255, int(220 * alpha)),
        width=2,
    )
    rounded_rect(
        draw,
        (box[0] + 3, box[1] + 3, box[2] - 3, box[3] - 3),
        radius=25,
        fill=None,
        outline=(180, 235, 255, int(60 * alpha)),
        width=1,
    )

    bx, by = brain_center
    start_x = cx
    start_y = cy + bubble_h * 0.35 + float_y
    dx = bx - start_x
    dy = by - start_y
    dist = math.hypot(dx, dy) or 1
    ux, uy = dx / dist, dy / dist

    for radius, t in ((14, 0.18), (10, 0.30), (7, 0.40)):
        px = start_x + ux * dist * t
        py = start_y + uy * dist * t
        draw.ellipse(
            (px - radius, py - radius, px + radius, py + radius),
            fill=(10, 22, 42, int(200 * alpha)),
            outline=(140, 220, 255, int(200 * alpha)),
            width=2,
        )

    ty = y + pad_y
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        lw = bbox[2] - bbox[0]
        tx = x + (bubble_w - lw) // 2
        draw.text((tx, ty), line, font=font, fill=(230, 245, 255, int(255 * alpha)))
        ty += (bbox[3] - bbox[1]) + 10

    canvas.alpha_composite(overlay)


def render_frame(base_large: Image.Image, frame_idx: int) -> Image.Image:
    t = frame_idx / FPS
    angle = -360.0 * ROTATIONS * (t / DURATION_S)
    base = rotating_brain(base_large, angle)
    pulse = 1.0 + 0.035 * math.sin(t * 2.0)
    frame = ImageEnhance.Brightness(base).enhance(pulse).convert("RGBA")

    pulse_alpha = int(28 + 18 * (0.5 + 0.5 * math.sin(t * 1.6)))
    light = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    ldraw = ImageDraw.Draw(light)
    cx, cy = WIDTH * 0.5, HEIGHT * 0.52
    ldraw.ellipse(
        (cx - 420, cy - 320, cx + 420, cy + 320),
        fill=(40, 140, 220, pulse_alpha),
    )
    light = light.filter(ImageFilter.GaussianBlur(80))
    frame = Image.alpha_composite(frame, light)

    brain_center = (WIDTH * 0.5, HEIGHT * 0.52)
    for i, q in enumerate(QUESTIONS):
        fade = ease_out_cubic((t - q["appear_at"]) / 0.9)
        float_y = math.sin((t * 1.3) + i * 1.1) * 10
        draw_thought_bubble(
            frame,
            q["text"],
            q["anchor"][0] * WIDTH,
            q["anchor"][1] * HEIGHT,
            fade,
            float_y,
            brain_center,
        )

    if t > 16.5:
        title_a = ease_out_cubic((t - 16.5) / 1.2)
        title = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        tdraw = ImageDraw.Draw(title)
        font = load_font(28, bold=True)
        label = "Customer insight starts with the right questions"
        bbox = tdraw.textbbox((0, 0), label, font=font)
        tw = bbox[2] - bbox[0]
        tx = (WIDTH - tw) // 2
        ty = HEIGHT - 90
        tdraw.rounded_rectangle(
            (tx - 28, ty - 16, tx + tw + 28, ty + 42),
            radius=20,
            fill=(0, 0, 0, int(140 * title_a)),
            outline=(120, 200, 255, int(160 * title_a)),
            width=1,
        )
        tdraw.text((tx, ty), label, font=font, fill=(210, 235, 255, int(255 * title_a)))
        frame = Image.alpha_composite(frame, title)

    return frame.convert("RGB")


def main() -> None:
    if not BRAIN_PATH.exists():
        raise SystemExit(f"Missing brain image: {BRAIN_PATH}")
    if not FFMPEG or not Path(FFMPEG).exists():
        raise SystemExit("ffmpeg not found")

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    # Oversized plate so rotation never reveals empty corners
    pad = 1.45
    base_large = fit_brain(
        Image.open(BRAIN_PATH),
        canvas_w=int(WIDTH * pad),
        canvas_h=int(HEIGHT * pad),
    )

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
        "-pix_fmt",
        "yuv420p",
        "-crf",
        "18",
        "-movflags",
        "+faststart",
        str(OUT_PATH),
    ]

    print(f"Rendering {TOTAL_FRAMES} frames @ {FPS}fps -> {OUT_PATH}")
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.PIPE)
    assert proc.stdin is not None

    try:
        for i in range(TOTAL_FRAMES):
            frame = render_frame(base_large, i)
            proc.stdin.write(frame.tobytes())
            if i % 30 == 0:
                print(f"  frame {i}/{TOTAL_FRAMES}")
        proc.stdin.close()
        stderr = proc.stderr.read().decode("utf-8", errors="replace") if proc.stderr else ""
        code = proc.wait()
        if code != 0:
            raise SystemExit(f"ffmpeg failed ({code}):\n{stderr[-2000:]}")
    except Exception:
        proc.kill()
        raise

    print(f"Wrote {OUT_PATH}")


if __name__ == "__main__":
    main()
