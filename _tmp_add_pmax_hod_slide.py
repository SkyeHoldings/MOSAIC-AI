# -*- coding: utf-8 -*-
import pathlib
from pptx import Presentation
from pptx.util import Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN
from pptx.enum.chart import XL_CHART_TYPE, XL_LABEL_POSITION
from pptx.chart.data import CategoryChartData
from pptx.oxml.ns import qn
from lxml import etree

amp = chr(38)
dollar = chr(36)
en = "\u2013"
mdash = "\u2014"
mid = "\u00b7"

SRC = pathlib.Path.home() / "OneDrive" / "Desktop" / "Clients" / "Surface" / ("Data Pulls " + amp + " Reporting") / "Red Robin _ Ad Schedule Analysis.pptx"
ICON = pathlib.Path(r"C:/Users/skyes/Projects/understory-marketing-site/_pptx_assets/icon.png")

ACCENT = RGBColor(0xF8, 0x30, 0x00)
BODY = RGBColor(0x16, 0x16, 0x16)
MUTED = RGBColor(0x6E, 0x6E, 0x6E)
MUTED2 = RGBColor(0x9A, 0x9A, 0x9A)
GOOD = RGBColor(0x2D, 0x86, 0x59)
BAD = RGBColor(0xC0, 0x39, 0x2B)
PANEL = RGBColor(0xF2, 0xF2, 0xF2)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
HEADER_BG = RGBColor(0x1A, 0x1A, 0x1A)
BLACK = RGBColor(0x00, 0x00, 0x00)

def set_run(run, text, font_name, size_pt, bold, color):
    run.text = text
    run.font.name = font_name
    run.font.size = Pt(size_pt)
    run.font.bold = bold
    run.font.color.rgb = color

def add_textbox(slide, left, top, width, height, paragraphs):
    box = slide.shapes.add_textbox(left, top, width, height)
    tf = box.text_frame
    tf.word_wrap = True
    first = True
    for item in paragraphs:
        if first:
            p = tf.paragraphs[0]
            first = False
        else:
            p = tf.add_paragraph()
        align = None
        runs = item
        if isinstance(item, dict):
            align = item.get("align")
            runs = item["runs"]
        if align:
            p.alignment = align
        for text, font, size, bold, color in runs:
            r = p.add_run()
            set_run(r, text, font, size, bold, color)
    return box

def solid_shape(slide, left, top, width, height, color):
    sh = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
    sh.fill.solid()
    sh.fill.fore_color.rgb = color
    sh.line.fill.background()
    return sh

def set_cell(cell, text, font, size, bold, color, fill, align=PP_ALIGN.LEFT):
    cell.text = ""
    tf = cell.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = align
    r = p.add_run()
    set_run(r, text, font, size, bold, color)
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    for child in list(tcPr):
        if child.tag == qn("a:solidFill"):
            tcPr.remove(child)
    solid = etree.SubElement(tcPr, qn("a:solidFill"))
    srgb = etree.SubElement(solid, qn("a:srgbClr"))
    srgb.set("val", str(fill))
    tcPr.set("anchor", "ctr")

def find_page_number_shape(s):
    for sh in s.shapes:
        if not sh.has_text_frame:
            continue
        t = sh.text_frame.text.strip()
        if len(t) == 2 and t.isdigit():
            return sh
    for sh in s.shapes:
        if not sh.has_text_frame:
            continue
        if sh.left > 10000000 and sh.top > 6400000:
            return sh
    return None

def style_category_axis_font(chart, size_pt=8):
    try:
        cat = chart.category_axis
        # tick labels
        txPr = cat._element.find(qn("c:txPr"))
        if txPr is None:
            from pptx.oxml import parse_xml
            txPr = parse_xml(
                '<c:txPr xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" '
                'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'
                '<a:bodyPr/><a:lstStyle/>'
                '<a:p><a:pPr><a:defRPr sz="%d"/></a:pPr><a:endParaRPr/></a:p>'
                "</c:txPr>" % int(size_pt * 100)
            )
            # insert before crossAx or at end of catAx
            cat._element.append(txPr)
        else:
            defRPr = txPr.find(".//{http://schemas.openxmlformats.org/drawingml/2006/main}defRPr")
            if defRPr is not None:
                defRPr.set("sz", str(int(size_pt * 100)))
    except Exception as e:
        print("cat font err", e)

def main():
    prs = Presentation(str(SRC))
    before = len(prs.slides)
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    sldIdLst = prs.slides._sldIdLst
    new_id = list(sldIdLst)[-1]
    sldIdLst.remove(new_id)
    # After slide 5 (0-based index 5) => insert at position 5
    sldIdLst.insert(5, new_id)

    solid_shape(slide, 0, 0, prs.slide_width, prs.slide_height, BODY)
    slide.shapes.add_picture(str(ICON), 11475720, 274320, 310896, 338328)
    solid_shape(slide, 502920, 6547104, 11183112, 11887, ACCENT)

    footer_right = "   /   RED ROBIN " + mdash + " AD SCHEDULE ANALYSIS"
    add_textbox(
        slide, 457200, 6583680, 8229600, 274320,
        [{"runs": [("SURFACE", "Arial Narrow", 10, True, ACCENT), (footer_right, "Arial Narrow", 10, False, MUTED2)]}],
    )
    add_textbox(
        slide, 10789920, 6583680, 914400, 274320,
        [{"runs": [("06", "Arial Narrow", 10, False, MUTED2)], "align": PP_ALIGN.RIGHT}],
    )

    add_textbox(
        slide, 502920, 274320, 10515600, 274320,
        [{"runs": [("PERFORMANCE MAX", "Arial Narrow", 12.5, True, ACCENT)]}],
    )
    headline = "AFTERNOON CPA PEAKS " + mdash + " MORNING AND LATE NIGHT ARE CHEAPEST"
    add_textbox(
        slide, 502920, 502920, 10972800, 548640,
        [{"runs": [(headline, "Arial Narrow", 22, True, WHITE)]}],
    )
    solid_shape(slide, 530352, 1051560, 658368, 68580, ACCENT)
    sub = "Average PMax CPA " + dollar + "0.39 " + mid + " May 27 " + en + " Jul 27, 2026"
    add_textbox(
        slide, 502920, 1143000, 10972800, 274320,
        [{"runs": [(sub, "Arial", 12, False, MUTED2)]}],
    )

    # Wider chart for 24 hours; condensed band table on right
    chart_data = CategoryChartData()
    chart_data.categories = [str(h) for h in range(24)]
    values = (
        0.77, 0.62, 0.55, 0.44, 0.44, 0.35, 0.24, 0.22,
        0.23, 0.26, 0.26, 0.37, 0.42, 0.43, 0.44, 0.42,
        0.45, 0.41, 0.41, 0.40, 0.38, 0.35, 0.33, 0.11,
    )
    chart_data.add_series("CPA (" + dollar + ")", values)
    gf = slide.shapes.add_chart(
        XL_CHART_TYPE.COLUMN_CLUSTERED,
        274320, 1463040, 7000000, 3200400,
        chart_data,
    )
    chart = gf.chart
    chart.has_legend = False
    chart.has_title = True
    chart.chart_title.text_frame.paragraphs[0].clear()
    tr = chart.chart_title.text_frame.paragraphs[0].add_run()
    set_run(tr, "PMax CPA by Hour of Day", "Arial Narrow", 12, True, WHITE)

    try:
        chart.category_axis.has_title = True
        cat_title = chart.category_axis.axis_title
        cat_title.text_frame.paragraphs[0].clear()
        r = cat_title.text_frame.paragraphs[0].add_run()
        set_run(r, "Hour of Day", "Arial", 9, False, MUTED2)
    except Exception as e:
        print("cat axis title err", e)

    try:
        chart.value_axis.has_title = True
        val_title = chart.value_axis.axis_title
        val_title.text_frame.paragraphs[0].clear()
        r = val_title.text_frame.paragraphs[0].add_run()
        set_run(r, "CPA (" + dollar + ")", "Arial", 9, False, MUTED2)
    except Exception as e:
        print("val axis title err", e)

    series = chart.series[0]
    series.format.fill.solid()
    series.format.fill.fore_color.rgb = ACCENT
    chart.value_axis.minimum_scale = 0
    chart.value_axis.maximum_scale = 0.85
    chart.value_axis.has_major_gridlines = True
    style_category_axis_font(chart, 7)

    avg_label = "Avg CPA " + dollar + "0.39"
    add_textbox(
        slide, 274320, 4622800, 5000000, 228600,
        [{"runs": [(avg_label, "Arial Narrow", 11, True, ACCENT), ("  " + mid + "  reference across hours", "Arial", 10, False, MUTED2)]}],
    )

    # Condensed band table (7 cols)
    rows_data = [
        ("Hour band", "CPA", "vs Avg", "Cost %", "Conv %", "Eff.", "Read"),
        ("12a" + en + "2a (0" + en + "1)", dollar + "0.62" + en + "0.77", "+59" + en + "98%", "0.16%", "0.09%", "0.51" + en + "0.64", "Highest CPA; tiny spend"),
        ("6a" + en + "10a (6" + en + "10)", dollar + "0.22" + en + "0.26", "-33" + en + "44%", "6.1%", "9.6%", "1.51" + en + "1.77", "Best meaningful window"),
        ("12p" + en + "4p (12" + en + "16)", dollar + "0.42" + en + "0.45", "+8" + en + "15%", "48.7%", "44.3%", "0.88" + en + "0.93", "Peak spend; mild CPA inflation"),
        ("4p" + en + "8p (17" + en + "20)", dollar + "0.38" + en + "0.41", "~avg", "34.0%", "33.4%", "0.95" + en + "1.05", "Near average"),
        ("9p" + en + "11p (21" + en + "23)", dollar + "0.11" + en + "0.35", "below avg", "5.4%", "6.7%", "1.12" + en + "3.60", "Efficient; hr 23 very low CPA"),
    ]
    # vs avg colors by row index: 1 bad, 2 good, 3 bad, 4 muted, 5 good
    vs_colors = {1: BAD, 2: GOOD, 3: BAD, 4: MUTED, 5: GOOD}

    tbl_shape = slide.shapes.add_table(6, 7, 7380000, 1463040, 4500000, 3000000)
    table = tbl_shape.table
    widths = [1050000, 720000, 620000, 520000, 520000, 620000, 1050000]
    # scale widths to sum ~4500000
    total_w = sum(widths)
    target = 4500000
    widths = [int(w * target / total_w) for w in widths]
    for i, w in enumerate(widths):
        table.columns[i].width = w

    for ri, row in enumerate(rows_data):
        for ci, val in enumerate(row):
            cell = table.cell(ri, ci)
            if ri == 0:
                set_cell(cell, val, "Arial Narrow", 8, True, WHITE, HEADER_BG, PP_ALIGN.CENTER)
            else:
                color = BLACK
                if ci == 2:
                    color = vs_colors.get(ri, MUTED)
                if ci == 0 or ci == 6:
                    align = PP_ALIGN.LEFT
                    size = 7.5
                else:
                    align = PP_ALIGN.CENTER
                    size = 8
                set_cell(cell, val, "Arial", size, False, color, WHITE, align)

    solid_shape(slide, 502920, 5074920, 11064240, 1143000, PANEL)
    solid_shape(slide, 502920, 5074920, 109728, 1143000, ACCENT)
    callout = (
        "Most dollars land 12p" + en + "7p where CPA is " + dollar + "0.40" + en + "0.45 "
        "(near or above " + dollar + "0.39 avg). Cheapest efficient volume is 6a" + en + "10a. "
        "Overnight CPA looks worst but is almost no spend " + mdash + " not a material blackout."
    )
    add_textbox(
        slide, 758952, 5166360, 10698480, 960120,
        [
            {"runs": [("CALLOUT", "Arial Narrow", 11, True, ACCENT)]},
            {"runs": [(callout, "Arial", 12, False, MUTED)]},
        ],
    )

    for idx, s in enumerate(prs.slides, 1):
        sh = find_page_number_shape(s)
        if sh is None:
            print("NO PAGE NUM on slide", idx)
            continue
        tf = sh.text_frame
        p = tf.paragraphs[0]
        font_name, size, bold, color = "Arial Narrow", 10, False, MUTED2
        if p.runs:
            r0 = p.runs[0]
            if r0.font.name:
                font_name = r0.font.name
            if r0.font.size:
                size = r0.font.size.pt
            if r0.font.bold is not None:
                bold = r0.font.bold
            try:
                if r0.font.color.rgb:
                    color = r0.font.color.rgb
            except Exception:
                pass
        p.clear()
        r = p.add_run()
        set_run(r, f"{idx:02d}", font_name, size, bold, color)
        print(f"set page {idx:02d}")

    prs.save(str(SRC))
    after = len(prs.slides)
    print(f"SAVED. before={before} after={after}")

    # Verify
    prs2 = Presentation(str(SRC))
    s6 = prs2.slides[5]
    has_chart = any(sh.has_chart for sh in s6.shapes)
    texts = []
    for sh in s6.shapes:
        if sh.has_text_frame:
            t = sh.text_frame.text.strip()
            if t:
                texts.append(t[:80])
    print("slide6_has_chart", has_chart)
    print("slide_count", len(prs2.slides))
    print("slide6_texts", texts[:6])

if __name__ == "__main__":
    main()
