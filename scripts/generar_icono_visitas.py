#!/usr/bin/env python3
"""Construye iconos reales para iPhone a partir del logo oficial de Aura Digital."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
LOGO = ROOT / "assets" / "logo-dark.png"
OUT = ROOT / "iconos"
OUT.mkdir(exist_ok=True)
logo = Image.open(LOGO).convert("RGBA")

# Recortar exclusivamente márgenes transparentes, sin modificar el dibujo.
alpha = logo.getchannel("A")
bounds = alpha.getbbox()
if not bounds:
    raise SystemExit("El logotipo oficial está vacío.")
logo = logo.crop(bounds)

for size in (180, 192, 512):
    icon = Image.new("RGBA", (size, size), (0, 0, 0, 255))
    width_limit = round(size * 0.82)
    height_limit = round(size * 0.82)
    ratio = min(width_limit / logo.width, height_limit / logo.height)
    dims = (max(1, round(logo.width * ratio)), max(1, round(logo.height * ratio)))
    resized = logo.resize(dims, Image.Resampling.LANCZOS)
    offset = ((size - resized.width) // 2, (size - resized.height) // 2)
    icon.alpha_composite(resized, offset)
    dest = OUT / f"aura-visitas-{size}.png"
    icon.convert("RGB").save(dest, format="PNG", optimize=True)
    print(f"Icono listo: {dest.relative_to(ROOT)} {size}x{size} (logo original {logo.size})")
