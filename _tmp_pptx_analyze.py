# -*- coding: utf-8 -*-
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE
from pptx.oxml.ns import qn
from lxml import etree
import sys

pptx_path = r"c:\Users\skyes\OneDrive\Desktop\Clients\Surface\Data Pulls & Reporting\Red Robin _ Target CPA Analysis.pptx"
out_path = r"C:\Users\skyes\Projects\understory-marketing-site\_pptx_structure.txt"

prs = Presentation(pptx_path)
lines = []

def w(s=""):
    lines.append(s)

def inches(emu):
    return None if emu is None else round(emu / 914400, 3)

def stype(shape):
    try:
        m = {
            MSO_SHAPE_TYPE.AUTO_SHAPE: "auto_shape",
            MSO_SHAPE_TYPE.PICTURE: "picture",
            MSO_SHAPE_TYPE.TABLE: "table",
            MSO_SHAPE_TYPE.CHART: "chart",
            MSO_SHAPE_TYPE.TEXT_BOX: "textbox",
            MSO_SHAPE_TYPE.GROUP: "group",
            MSO_SHAPE_TYPE.PLACEHOLDER: "placeholder",
            MSO_SHAPE_TYPE.LINE: "line",
            MSO_SHAPE_TYPE.FREEFORM: "freeform",
        }
        return m.get(shape.shape_type, f"type_{int(shape.shape_type)}")
    except Exception as e:
        return f"err:{e}"

def solid_fill_hex(shape):
    try:
        spPr = shape._element.find(qn("p:spPr"))
        if spPr is None:
            spPr = getattr(shape._element, "spPr", None)
        if spPr is None:
            return None
        solid = spPr.find(qn("a:solidFill"))
        if solid is None:
            return None
        srgb = solid.find(qn("a:srgbClr"))
        if srgb is not None:
            return "#" + srgb.get("val")
        scheme = solid.find(qn("a:schemeClr"))
        if scheme is not None:
            return "scheme:" + scheme.get("val")
    except Exception:
        pass
    return None

def run_color(run):
    try:
        rPr = run._r.find(qn("a:rPr"))
        if rPr is None:
            return None
        solid = rPr.find(qn("a:solidFill"))
        if solid is None:
            return None
        srgb = solid.find(qn("a:srgbClr"))
        if srgb is not None:
            return "#" + srgb.get("val")
        scheme = solid.find(qn("a:schemeClr"))
        if scheme is not None:
            return "scheme:" + scheme.get("val")
    except Exception:
        pass
    return None

def dump_text(shape, indent="    "):
    if not getattr(shape, "has_text_frame", False):
        return
    tf = shape.text_frame
    full = tf.text
    if full is not None:
        w(f"{indent}FULL_TEXT:")
        for ln in full.splitlines() or [""]:
            w(f"{indent}  | {ln}")
    for pi, para in enumerate(tf.paragraphs):
        align = para.alignment
        w(f"{indent}para[{pi}] align={align} level={para.level}")
        for ri, run in enumerate(para.runs):
            size = run.font.size.pt if run.font.size else None
            w(f"{indent}  run[{ri}]: font={run.font.name} size={size}pt bold={run.font.bold} italic={run.font.italic} color={run_color(run)}")
            w(f"{indent}         text={run.text!r}")

def dump_table(shape, indent="    "):
    table = shape.table
    nrows, ncols = len(table.rows), len(table.columns)
    w(f"{indent}TABLE {nrows}x{ncols}")
    try:
        w(f"{indent}col_widths_in={[inches(c.width) for c in table.columns]}")
    except Exception:
        pass
    w(f"{indent}--- cell grid ---")
    for ri, row in enumerate(table.rows):
        cells = [c.text.replace("\n", " / ") for c in row.cells]
        w(f"{indent}ROW[{ri}]: " + " || ".join(cells))
    w(f"{indent}--- cell detail ---")
    for ri, row in enumerate(table.rows):
        for ci, cell in enumerate(row.cells):
            w(f"{indent}cell[{ri},{ci}]:")
            for pi, para in enumerate(cell.text_frame.paragraphs):
                for run in para.runs:
                    size = run.font.size.pt if run.font.size else None
                    w(f"{indent}  '{run.text}' font={run.font.name} size={size} bold={run.font.bold} color={run_color(run)}")

def dump_chart(shape, indent="    "):
    chart = shape.chart
    w(f"{indent}CHART type={chart.chart_type}")
    try:
        if chart.has_title:
            w(f"{indent}title={chart.chart_title.text_frame.text!r}")
    except Exception as e:
        w(f"{indent}title_err={e}")
    try:
        cats = []
        for c in chart.plots[0].categories:
            cats.append(c.label if hasattr(c, "label") else str(c))
        w(f"{indent}categories={cats}")
    except Exception as e:
        w(f"{indent}categories_err={e}")
    try:
        for si, series in enumerate(chart.series):
            vals = list(series.values) if series.values is not None else None
            w(f"{indent}series[{si}] name={series.name!r} values={vals}")
    except Exception as e:
        w(f"{indent}series_err={e}")

def dump_shape(shape, indent="  ", depth=0):
    p = indent + ("  " * depth)
    left, top = inches(shape.left), inches(shape.top)
    width, height = inches(shape.width), inches(shape.height)
    fill = solid_fill_hex(shape)
    w(f"{p}SHAPE name={shape.name!r} type={stype(shape)} pos=({left},{top}) size=({width}x{height}) fill={fill}")
    try:
        if hasattr(shape, "auto_shape_type"):
            w(f"{p}  auto_shape_type={shape.auto_shape_type}")
    except Exception:
        pass
    try:
        if shape.has_text_frame and shape.text_frame.text.strip():
            dump_text(shape, p + "  ")
        elif shape.has_text_frame:
            w(f"{p}  (empty text)")
    except Exception as e:
        w(f"{p}  text_err={e}")
    try:
        if shape.has_table:
            dump_table(shape, p + "  ")
    except Exception as e:
        w(f"{p}  table_err={e}")
    try:
        if shape.has_chart:
            dump_chart(shape, p + "  ")
    except Exception as e:
        w(f"{p}  chart_err={e}")
    try:
        if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
            img = shape.image
            w(f"{p}  picture content_type={img.content_type} ext={img.ext} bytes={len(img.blob)}")
    except Exception as e:
        w(f"{p}  picture_err={e}")
    try:
        if shape.shape_type == MSO_SHAPE_TYPE.GROUP:
            w(f"{p}  GROUP children={len(shape.shapes)}")
            for ch in shape.shapes:
                dump_shape(ch, indent, depth + 1)
    except Exception as e:
        w(f"{p}  group_err={e}")

# Header
w("=" * 80)
w("POWERPOINT STRUCTURAL ANALYSIS")
w(f"File: {pptx_path}")
w("=" * 80)
sw, sh = inches(prs.slide_width), inches(prs.slide_height)
w(f"SLIDE DIMENSIONS: {sw} in x {sh} in (EMU {prs.slide_width} x {prs.slide_height})")
w(f"SLIDE COUNT: {len(prs.slides)}")
w("Format: widescreen 16:9")

w("\n--- SLIDE MASTER / LAYOUTS ---")
for mi, master in enumerate(prs.slide_masters):
    w(f"Master[{mi}]:")
    for li, layout in enumerate(master.slide_layouts):
        w(f"  Layout[{li}]: {layout.name!r}")

w("\n--- THEME / COLOR INFO (from theme XML) ---")
for mi, master in enumerate(prs.slide_masters):
    for rel in master.part.rels.values():
        if "theme" in getattr(rel, "reltype", ""):
            root = etree.fromstring(rel.target_part.blob)
            ns = {"a": "http://schemas.openxmlformats.org/drawingml/2006/main"}
            scheme = root.find(".//a:clrScheme", ns)
            if scheme is not None:
                w(f"Color scheme: {scheme.get('name')}")
                for child in scheme:
                    tag = etree.QName(child).localname
                    srgb = child.find(".//a:srgbClr", ns)
                    sysc = child.find(".//a:sysClr", ns)
                    if srgb is not None:
                        w(f"  {tag}: #{srgb.get('val')}")
                    elif sysc is not None:
                        w(f"  {tag}: sys={sysc.get('val')} lastClr=#{sysc.get('lastClr')}")
            fs = root.find(".//a:fontScheme", ns)
            if fs is not None:
                w(f"Font scheme: {fs.get('name')}")
                major = fs.find(".//a:majorFont/a:latin", ns)
                minor = fs.find(".//a:minorFont/a:latin", ns)
                if major is not None:
                    w(f"  major: {major.get('typeface')}")
                if minor is not None:
                    w(f"  minor: {minor.get('typeface')}")

w("\n--- ACTUAL BRAND COLORS USED IN SHAPES/TEXT (extracted from srgbClr) ---")
used = set()
# will fill while dumping; also pre-scan
for slide in prs.slides:
    for shape in slide.shapes:
        c = solid_fill_hex(shape)
        if c:
            used.add(c)
        try:
            if shape.has_text_frame:
                for para in shape.text_frame.paragraphs:
                    for run in para.runs:
                        rc = run_color(run)
                        if rc:
                            used.add(rc)
        except Exception:
            pass
w("Used colors: " + ", ".join(sorted(used)))

w("\n" + "=" * 80)
w("NARRATIVE STRUCTURE OVERVIEW")
w("=" * 80)
w("""
Deck type: Client analysis / recommendation deck (Surface for Red Robin)
Theme: Dark title slide + light content slides, orange accent #F83000
Chrome (every slide):
  - Top-right: small logo/icon picture (~0.34x0.37 at 12.55, 0.3)
  - Bottom orange rule line (#F83000) at y~7.16, height 0.013
  - Footer left: 'SURFACE   /   RED ROBIN – TARGET CPA TEST' (Arial Narrow 9pt; SURFACE bold orange, rest gray)
  - Footer right: zero-padded slide number '01'..'07' (Arial Narrow 9pt bold gray)
Typography:
  - Section eyebrow: Arial Narrow 12.5pt bold #F83000
  - Headline: Arial Narrow ~30pt bold #161616
  - Accent underline bar under headline: ~0.72x0.075 #F83000
  - Body: Arial 12-14pt #161616
  - KPI big numbers: Arial Narrow ~32pt bold (green #2D8659 for positive/good, other for negative)
  - Callout panels: left orange strip 0.12 wide + light gray or white fill

Slide flow (recommendation narrative):
  1. Title / framing question
  2. Test design + methodology + research questions
  3. CPA results (KPI cards + comparison)
  4. (continued results / latency or conversion detail)
  5. ...
  6. ...
  7. Recommendation / next steps
""")

# Per-slide
for si, slide in enumerate(prs.slides):
    w("\n" + "=" * 80)
    w(f"SLIDE {si+1} (index {si})")
    w("=" * 80)
    try:
        w(f"Layout: {slide.slide_layout.name!r}")
    except Exception:
        w("Layout: unknown")
    w(f"Dimensions: {sw} x {sh} in")
    w(f"Shape count: {len(slide.shapes)}")
    try:
        if slide.has_notes_slide:
            notes = slide.notes_slide.notes_text_frame.text.strip()
            if notes:
                w(f"NOTES: {notes!r}")
    except Exception:
        pass
    for shape in slide.shapes:
        dump_shape(shape)

# Narrative index
w("\n" + "=" * 80)
w("NARRATIVE / CONTENT INDEX (text + tables only)")
w("=" * 80)
for si, slide in enumerate(prs.slides):
    w(f"\n----- SLIDE {si+1} -----")
    for shape in slide.shapes:
        try:
            if shape.has_text_frame and shape.text_frame.text.strip():
                w(shape.text_frame.text)
                w("---")
        except Exception:
            pass
        try:
            if shape.has_table:
                for row in shape.table.rows:
                    w(" | ".join(c.text.replace("\n", " ") for c in row.cells))
                w("---TABLE---")
        except Exception:
            pass
        try:
            if shape.has_chart:
                ch = shape.chart
                w(f"[CHART {ch.chart_type}]")
                try:
                    cats = [c.label if hasattr(c, "label") else str(c) for c in ch.plots[0].categories]
                    w(f"categories: {cats}")
                except Exception:
                    pass
                for s in ch.series:
                    w(f"series {s.name}: {list(s.values)}")
                w("---CHART---")
        except Exception:
            pass

text = "\n".join(lines)
with open(out_path, "w", encoding="utf-8") as f:
    f.write(text)
print(f"OK wrote {len(text)} chars, {len(lines)} lines, {len(prs.slides)} slides")
