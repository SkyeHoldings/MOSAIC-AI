"""Install Mosaic email signature into Outlook's local Signatures folder.

Outlook desktop loads images from a sibling *_files folder next to the .htm —
not from hellomosaic.ai or relative ./ paths. Run this once, then pick the
signature in Outlook → File → Options → Mail → Signatures.
"""

from __future__ import annotations

import os
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
NAME = "Mosaic Skye"
SIG_ROOT = Path(os.environ["APPDATA"]) / "Microsoft" / "Signatures"
FILES = SIG_ROOT / f"{NAME}_files"

ASSETS = {
    "logo.png": ROOT / "mosaic-signature-logo-white.png",
    "cta.gif": ROOT / "mosaic-signature-cta.gif",
    "brands.png": ROOT / "mosaic-signature-brands.png",
    "banner.png": ROOT / "mosaic-email-signature.png",
    "banner.gif": ROOT / "mosaic-email-signature.gif",
}


def htm_multipart() -> str:
    """Clickable HTML signature with locally referenced images (Outlook desktop)."""
    return f"""<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
</head>
<body style="margin:0;padding:0;">
<table cellpadding="0" cellspacing="0" border="0" width="640" style="border-collapse:collapse;background-color:#080808;font-family:Consolas,'Courier New',monospace;max-width:640px;">
  <tr>
    <td style="padding:28px 28px 22px 28px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
        <tr>
          <td valign="middle" width="132" style="padding:0 20px 0 0;">
            <a href="https://hellomosaic.ai/">
              <img src="{NAME}_files/logo.png" width="120" height="auto" alt="Mosaic" border="0" style="display:block;border:0;" />
            </a>
          </td>
          <td valign="middle" width="1" style="background-color:#373737;width:1px;font-size:0;line-height:0;">&nbsp;</td>
          <td valign="middle" style="padding:0 22px;">
            <div style="font-size:17px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#ffffff;">Skye Smith</div>
            <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#a8a8a8;padding-top:4px;">CEO</div>
            <div style="font-size:13px;color:#ffffff;padding-top:16px;">
              <a href="tel:+12088192549" style="color:#ffffff;text-decoration:none;">208.819.2549</a>
            </div>
            <div style="font-size:13px;color:#ffffff;padding-top:4px;">
              <a href="mailto:skye@hellomosaic.ai" style="color:#ffffff;text-decoration:none;">skye@hellomosaic.ai</a>
            </div>
            <div style="font-size:13px;color:#ffffff;padding-top:4px;">
              <a href="https://hellomosaic.ai/" style="color:#ffffff;text-decoration:none;">hellomosaic.ai</a>
            </div>
          </td>
          <td valign="middle" align="right" style="padding:0 0 0 8px;">
            <a href="https://hellomosaic.ai/">
              <img src="{NAME}_files/cta.gif" width="180" height="auto" alt="Visit Our Site" border="0" style="display:block;border:0;" />
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:0 28px;">
      <div style="border-top:1px solid #373737;font-size:0;line-height:0;height:1px;">&nbsp;</div>
    </td>
  </tr>
  <tr>
    <td style="padding:18px 28px 26px 28px;">
      <div style="font-size:14px;letter-spacing:0.16em;text-transform:uppercase;color:#a8a8a8;text-align:center;padding-bottom:12px;">Brands We've Worked With</div>
      <img src="{NAME}_files/brands.png" width="584" height="auto" alt="Gucci, Cabela's, Bass Pro Shops, Red Robin" border="0" style="display:block;border:0;margin:0 auto;" />
    </td>
  </tr>
</table>
</body>
</html>
"""


def htm_banner() -> str:
    """Fallback: one image (most reliable in Outlook). Whole banner links to site."""
    return f"""<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
</head>
<body style="margin:0;padding:0;">
<a href="https://hellomosaic.ai/">
  <img src="{NAME}_files/banner.gif" width="640" height="auto" alt="Skye Smith — CEO, Mosaic — Visit Our Site — hellomosaic.ai" border="0" style="display:block;border:0;" />
</a>
</body>
</html>
"""


def main() -> None:
    SIG_ROOT.mkdir(parents=True, exist_ok=True)
    if FILES.exists():
        shutil.rmtree(FILES)
    FILES.mkdir(parents=True)

    for dest_name, src in ASSETS.items():
        if not src.exists():
            raise SystemExit(f"missing asset: {src}")
        shutil.copy2(src, FILES / dest_name)
        print(f"copied {dest_name}")

    # Primary: multipart clickable
    (SIG_ROOT / f"{NAME}.htm").write_text(htm_multipart(), encoding="utf-8")
    # Also install single-image variant
    (SIG_ROOT / f"{NAME} Banner.htm").write_text(htm_banner(), encoding="utf-8")
    # Plain-text fallback
    (SIG_ROOT / f"{NAME}.txt").write_text(
        "Skye Smith\nCEO, Mosaic\n208.819.2549\nskye@hellomosaic.ai\nhttps://hellomosaic.ai/\n",
        encoding="utf-8",
    )

    print()
    print(f"Installed Outlook signatures:")
    print(f"  {SIG_ROOT / (NAME + '.htm')}")
    print(f"  {SIG_ROOT / (NAME + ' Banner.htm')}")
    print()
    print("Next in Outlook:")
    print("  1. File > Options > Mail > Signatures...")
    print(f"  2. Select '{NAME}' (or '{NAME} Banner' if images still break)")
    print("  3. Set it as default for New messages / Replies")
    print("  4. Compose a new email to preview")


if __name__ == "__main__":
    main()
