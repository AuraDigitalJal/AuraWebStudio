#!/usr/bin/env python3
"""Conserva el orden de redes, WhatsApp y Ver proyectos en WebStudio y sus publicaciones."""
from pathlib import Path
import json
import re

CSS = "\n/* Aura Digital: prioridades CTA portada v2 */\n.hero .hero-actions{display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:10px!important;margin-top:18px!important}\n.hero .hero-actions .aura-hero-social{order:0;justify-content:flex-start!important;width:auto!important;max-width:100%;margin:0 0 4px!important}\n.hero .hero-actions>a{flex:0 0 auto!important;width:auto!important;max-width:100%;min-width:0!important}\n.hero .hero-actions>a[data-wa]{order:1;min-height:39px!important;padding:8px 15px!important;font-size:.81rem!important;font-weight:650!important;border-radius:10px!important}\n.hero .hero-actions>a[data-hero-secondary-link]{order:2;min-height:38px!important;padding:7px 14px!important;font-size:.82rem!important}\n@media(max-width:720px){.hero .hero-actions{align-items:center!important;margin-top:12px!important;gap:9px!important}.hero .hero-actions .aura-hero-social{justify-content:center!important;margin:0 auto 3px!important;gap:18px!important}.hero .hero-actions .btn{flex:0 0 auto!important;min-width:0!important}}\n"
CSS_MARKER = "/* Aura Digital: prioridades CTA portada v2 */"

def patch_publisher(path: Path):
    source = path.read_text(encoding="utf-8")
    old_insert = "html=html.slice(0,end)+' '+socials+html.slice(end);"
    new_insert = """const socialInsertAt=start+'<div class="hero-actions">'.length;
    html=html.slice(0,socialInsertAt)+socials+html.slice(socialInsertAt);"""
    if old_insert in source:
        assert source.count(old_insert) == 1, "Inserción social múltiple en generador"
        source = source.replace(old_insert, new_insert)
    else:
        assert new_insert in source, "No se encontró punto de inserción social del generador"
    constant = '  function buildWithAuraSocial(state,opts={}){'
    if "const AURA_HERO_CTA_CSS=" not in source:
        assert source.count(constant) == 1, "No se encontró generador de publicaciones"
        source = source.replace(constant, "  const AURA_HERO_CTA_CSS=" + json.dumps(CSS, ensure_ascii=False) + ";\n" + constant)
    old_style = "if(style>=0)html=html.slice(0,style)+AURA_SOCIAL_CSS+html.slice(style);"
    new_style = "if(style>=0)html=html.slice(0,style)+AURA_SOCIAL_CSS+AURA_HERO_CTA_CSS+html.slice(style);"
    if old_style in source:
        assert source.count(old_style) == 1, "Inyección CSS múltiple"
        source = source.replace(old_style, new_style)
    else:
        assert new_style in source, "No se encontró la hoja de estilo de publicaciones"
    assert source.count("const AURA_HERO_CTA_CSS=") == 1
    assert source.count("socialInsertAt=start+") == 1
    path.write_text(source, encoding="utf-8")
    print("WebStudio: el generador conserva el orden de CTA y tamaños pequeños")

def patch_sample_site(path: Path):
    if not path.exists():
        return
    text = path.read_text(encoding="utf-8")
    found = list(re.finditer(r'<nav class="aura-hero-social"[^>]*>.*?</nav>', text, flags=re.S))
    if not found:
        print("WebStudio: no hay enlaces sociales en la muestra estática; se conserva intacta")
        return
    assert len(found) == 1, "Ambigüedad: más de una barra social en WebStudio"
    nav = found[0].group(0)
    actions_tag = '<div class="hero-actions">'
    assert text.count(actions_tag) >= 1
    start = text.index(actions_tag)
    end = text.index("</div>", start) + 6
    if not (start < found[0].start() < end) or found[0].start() != start + len(actions_tag):
        text = text[:found[0].start()] + text[found[0].end():]
        start = text.index(actions_tag)
        insert_at = start + len(actions_tag)
        text = text[:insert_at] + nav + text[insert_at:]
    start = text.index(actions_tag)
    end = text.index("</div>", start) + 6
    fragment = text[start:end]
    assert fragment.find('class="aura-hero-social"') < fragment.find("data-wa") < fragment.find("data-hero-secondary-link"), "Orden inesperado"
    if CSS_MARKER not in text:
        body = text.index("<body")
        style_end = text.rfind("</style>", 0, body)
        assert style_end > 0
        text = text[:style_end] + CSS + text[style_end:]
    path.write_text(text, encoding="utf-8")
    print("WebStudio: la muestra HTML ahora tiene redes, WhatsApp, Ver proyectos")

patch_publisher(Path("publisher-template.js"))
patch_sample_site(Path("index.html"))
