# -*- coding: utf-8 -*-
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
import os

OUT = r"c:\Users\skyes\OneDrive\Desktop\Clients\Surface\Data Pulls & Reporting\Red Robin _ Ad Schedule Analysis.pptx"
ASSETS = r"C:\Users\skyes\Projects\understory-marketing-site\_pptx_assets"
ICON = os.path.join(ASSETS, "image3.png")
ICON_TITLE = os.path.join(ASSETS, "image1.png")
LOGO = os.path.join(ASSETS, "image2.png")

ORANGE = RGBColor(0xF8, 0x30, 0x00)
DARK_BG = RGBColor(0x12, 0x12, 0x12)
BODY_BG = RGBColor(0x16, 0x16, 0x16)
MUTED = RGBColor(0x6E, 0x6E, 0x6E)
MUTED2 = RGBColor(0x9A, 0x9A, 0x9A)
MUTED3 = RGBColor(0xCF, 0xCF, 0xCF)
GOOD = RGBColor(0x2D, 0x86, 0x59)
SYS_BLUE = RGBColor(0x3D, 0x6F, 0xA0)
PANEL = RGBColor(0xF2, 0xF2, 0xF2)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
BLACK = RGBColor(0x00, 0x00, 0x00)
DARK_HEADER = RGBColor(0x1A, 0x1A, 0x1A)
CARD_BG = RGBColor(0x1E, 0x1E, 0x1E)
ROW_ALT = RGBColor(0xF7, 0xF7, 0xF7)

SLIDE_W = Inches(13.333)
SLIDE_H = Inches(7.5)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
prs = Presentation()
prs.slide_width = SLIDE_W
prs.slide_height = SLIDE_H
blank = prs.slide_layouts[6]


def set_run(run, text, font_name, size_pt, bold=False, color=WHITE):
    run.text = text
    run.font.name = font_name
    run.font.size = Pt(size_pt)
    run.font.bold = bold
    run.font.color.rgb = color


def add_textbox(slide, left, top, width, height, text="", font_name="Arial", size=12, bold=False, color=WHITE, align=PP_ALIGN.LEFT):
    box = slide.shapes.add_textbox(left, top, width, height)
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    set_run(run, text, font_name, size, bold, color)
    return box


def add_rect(slide, left, top, width, height, fill_color):
    shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    shape.line.fill.background()
    return shape


def add_footer(slide, page_num):
    add_rect(slide, Inches(0.55), Inches(7.16), Inches(12.23), Inches(0.013), ORANGE)
    box = slide.shapes.add_textbox(Inches(0.5), Inches(7.2), Inches(9.0), Inches(0.3))
    tf = box.text_frame
    p = tf.paragraphs[0]
    r1 = p.add_run()
    set_run(r1, "SURFACE", "Arial Narrow", 10, True, ORANGE)
    r2 = p.add_run()
    set_run(r2, "   /   RED ROBIN — AD SCHEDULE ANALYSIS", "Arial Narrow", 10, False, MUTED2)
    add_textbox(slide, Inches(11.8), Inches(7.2), Inches(1.0), Inches(0.3),
                f"{page_num:02d}", "Arial Narrow", 10, False, MUTED2, PP_ALIGN.RIGHT)


def add_icon(slide, title=False):
    path = ICON_TITLE if title else ICON
    if os.path.exists(path):
        slide.shapes.add_picture(path, Inches(12.55), Inches(0.3), Inches(0.34), Inches(0.37))


def add_logo(slide):
    if os.path.exists(LOGO):
        slide.shapes.add_picture(LOGO, Inches(0.9), Inches(0.7), Inches(2.1), Inches(0.53))


def add_eyebrow_headline(slide, eyebrow, headline):
    add_textbox(slide, Inches(0.55), Inches(0.4), Inches(11.5), Inches(0.34),
                eyebrow, "Arial Narrow", 12.5, True, ORANGE)
    add_textbox(slide, Inches(0.55), Inches(0.64), Inches(12.0), Inches(0.62),
                headline, "Arial Narrow", 28, True, WHITE)
    add_rect(slide, Inches(0.58), Inches(1.24), Inches(0.72), Inches(0.075), ORANGE)


def add_kpi_card(slide, left, top, width, height, label, value, bar_color=ORANGE):
    add_rect(slide, left, top, width, height, CARD_BG)
    add_rect(slide, left, top, width, Inches(0.1), bar_color)
    add_textbox(slide, left + Inches(0.12), top + Inches(0.22), width - Inches(0.2), Inches(0.28),
                label, "Arial Narrow", 10, True, MUTED2)
    size = 18 if len(value) > 18 else 20
    add_textbox(slide, left + Inches(0.12), top + Inches(0.5), width - Inches(0.2), Inches(0.55),
                value, "Arial Narrow", size, True, WHITE)


def add_callout(slide, left, top, width, height, title, body):
    add_rect(slide, left, top, width, height, PANEL)
    add_rect(slide, left, top, Inches(0.12), height, ORANGE)
    box = slide.shapes.add_textbox(left + Inches(0.28), top + Inches(0.15), width - Inches(0.4), height - Inches(0.25))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    r = p.add_run()
    set_run(r, title, "Arial Narrow", 11, True, ORANGE)
    if body:
        for line in body.split("\n"):
            p2 = tf.add_paragraph()
            r2 = p2.add_run()
            set_run(r2, line if line else " ", "Arial", 12, False, MUTED)


def style_table(table):
    for i, row in enumerate(table.rows):
        for j, cell in enumerate(row.cells):
            cell.fill.solid()
            if i == 0:
                cell.fill.fore_color.rgb = DARK_HEADER
            else:
                cell.fill.fore_color.rgb = WHITE if i % 2 == 1 else ROW_ALT
            for p in cell.text_frame.paragraphs:
                p.alignment = PP_ALIGN.LEFT if j == 0 or j == len(row.cells) - 1 else PP_ALIGN.CENTER
                for run in p.runs:
                    run.font.name = "Arial Narrow" if i == 0 else "Arial"
                    run.font.size = Pt(9 if i == 0 else 10)
                    run.font.bold = True if i == 0 else False
                    run.font.color.rgb = WHITE if i == 0 else BLACK
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE


def add_table(slide, left, top, width, rows_data, col_widths):
    rows = len(rows_data)
    cols = len(rows_data[0])
    table_shape = slide.shapes.add_table(rows, cols, left, top, width, Inches(0.38 * rows))
    table = table_shape.table
    for j, w in enumerate(col_widths):
        table.columns[j].width = w
    for i, row in enumerate(rows_data):
        for j, val in enumerate(row):
            table.cell(i, j).text = val
    style_table(table)
    return table_shape


kw = Inches(2.9)
gap = Inches(0.18)
x0 = Inches(0.55)
col_w = [Inches(2.4), Inches(1.2), Inches(1.2), Inches(1.6), Inches(1.5), Inches(2.9)]

# ========== SLIDE 1 ==========
s = prs.slides.add_slide(blank)
add_rect(s, 0, 0, SLIDE_W, SLIDE_H, DARK_BG)
add_icon(s, title=True)
add_footer(s, 1)
add_logo(s)
add_rect(s, Inches(0.9), Inches(2.35), Inches(0.55), Inches(0.09), ORANGE)
box = s.shapes.add_textbox(Inches(0.9), Inches(2.55), Inches(11.8), Inches(2.9))
tf = box.text_frame
tf.word_wrap = True
p = tf.paragraphs[0]
r = p.add_run(); set_run(r, "RED ROBIN", "Arial Narrow", 42, True, ORANGE)
p2 = tf.add_paragraph()
r2 = p2.add_run(); set_run(r2, "AD SCHEDULE ANALYSIS", "Arial Narrow", 42, True, WHITE)
p3 = tf.add_paragraph()
r3 = p3.add_run(); set_run(r3, "", "Arial", 14, False, MUTED2)
p4 = tf.add_paragraph()
r4 = p4.add_run(); set_run(r4, "Are we investing at the right hours — and where should we blackout?", "Arial", 16, False, MUTED3)
add_textbox(s, Inches(0.95), Inches(5.75), Inches(11.5), Inches(0.5),
            "SEARCH  ·  PMAX  ·  DEMAND GEN  ·  MAY 27 – JUL 27, 2026  ·  HOUR × DAY OF WEEK",
            "Arial Narrow", 12, True, MUTED2)

# ========== SLIDE 2 ==========
s = prs.slides.add_slide(blank)
add_rect(s, 0, 0, SLIDE_W, SLIDE_H, BODY_BG)
add_icon(s)
add_footer(s, 2)
add_eyebrow_headline(s, "APPROACH", "WHAT WE CAN CONTROL — AND HOW WE JUDGED IT")
add_callout(s, Inches(0.55), Inches(1.55), Inches(5.9), Inches(3.4),
            "CONSTRAINT — ONLY LEVER: BLACKOUTS",
            "Only lever: ad schedule blackouts. Cannot change daily budgets or set hour bid modifiers.\n\nBlackouts can be all-week hours OR day-specific hours.")
add_callout(s, Inches(6.7), Inches(1.55), Inches(5.95), Inches(3.4),
            "METHODOLOGY",
            "Within each campaign type (Search, PMax, Demand Gen): cost %, conversion %, CPA vs type average, efficiency (conv% / cost%).\n\nFlag week-wide hour blackouts when hour weak on ≥5 days AND cost share > conv share, unless conv share still material (≥3%).")
add_rect(s, Inches(0.55), Inches(5.2), Inches(12.1), Inches(1.6), PANEL)
add_rect(s, Inches(0.55), Inches(5.2), Inches(0.12), Inches(1.6), ORANGE)
box = s.shapes.add_textbox(Inches(0.85), Inches(5.35), Inches(11.6), Inches(1.3))
tf = box.text_frame
tf.word_wrap = True
p = tf.paragraphs[0]
r = p.add_run(); set_run(r, "QUESTIONS", "Arial Narrow", 11, True, ORANGE)
for q in [
    "1. Which hours overspend vs convert?",
    "2. Is weakness all-week or day-specific?",
    "3. Would a blackout remove meaningful conversion share?",
]:
    p2 = tf.add_paragraph()
    r2 = p2.add_run(); set_run(r2, q, "Arial", 13, False, MUTED)

# ========== SLIDE 3 ==========
s = prs.slides.add_slide(blank)
add_rect(s, 0, 0, SLIDE_W, SLIDE_H, BODY_BG)
add_icon(s)
add_footer(s, 3)
add_eyebrow_headline(s, "SEARCH", "OVERNIGHT SPEND IS INEFFICIENT — CLEAR BLACKOUT CASE")
for i, (lab, val) in enumerate([
    ("SEARCH SPEND", "$121.2k"),
    ("AVG CPA", "$0.22"),
    ("BEST WINDOW", "4p–9p (eff 1.15–1.25)"),
    ("WEAK WINDOW", "12a–5a (eff 0.43–0.52)"),
]):
    add_kpi_card(s, x0 + i * (kw + gap), Inches(1.5), kw, Inches(1.15), lab, val, ORANGE)
add_table(s, Inches(0.55), Inches(2.9), Inches(12.1), [
    ["Hour band", "Cost %", "Conv %", "CPA", "vs avg CPA", "Read"],
    ["12a–4:59a (0–4)", "5.90%", "2.67%", "$0.42–0.51", "1.9–2.3×", "Blackout all week"],
    ["9:00–9:59a", "1.41%", "0.84%", "$0.37", "1.7×", "Blackout all week"],
    ["10:00–10:59a", "2.88%", "1.83%", "$0.34", "1.6×", "Watch / optional"],
    ["11a–2p (11–14)", "30.3%", "26.2%", "$0.24–0.29", "1.1–1.3×", "Do not blackout"],
    ["4p–9p (16–21)", "44.5%", "53.5%", "$0.17–0.20", "0.8–0.9×", "Protect"],
], col_w)
add_callout(s, Inches(0.55), Inches(5.55), Inches(12.1), Inches(1.25),
            "DAY OF WEEK",
            "Days of week are balanced (Fri–Sun slightly better). No day-level blackout needed.")

# ========== SLIDE 4 ==========
s = prs.slides.add_slide(blank)
add_rect(s, 0, 0, SLIDE_W, SLIDE_H, BODY_BG)
add_icon(s)
add_footer(s, 4)
add_eyebrow_headline(s, "PERFORMANCE MAX", "PEAK HOURS ARE ONLY MILDLY SOFT — DO NOT BLACKOUT")
for i, (lab, val) in enumerate([
    ("PMAX SPEND", "$1.20M"),
    ("AVG CPA", "$0.39"),
    ("PEAK 12p–4p", "48.7% cost / 44.3% conv"),
    ("OPTIONAL", "12a–2a only (0.16% cost)"),
]):
    add_kpi_card(s, x0 + i * (kw + gap), Inches(1.5), kw, Inches(1.15), lab, val, SYS_BLUE)
add_table(s, Inches(0.55), Inches(2.9), Inches(12.1), [
    ["Hour band", "Cost %", "Conv %", "CPA", "vs avg CPA", "Read"],
    ["12a–1:59a", "0.16%", "0.09%", "$0.62–0.77", "1.6–2.0×", "Optional only"],
    ["12p–4p (12–16)", "48.7%", "44.3%", "$0.42–0.45", "1.1×", "Do not blackout"],
    ["6a–10a + 9p–11p", "~7%", "~12%", "$0.11–0.26", "0.3–0.7×", "Protect"],
], col_w)
add_callout(s, Inches(0.55), Inches(4.55), Inches(12.1), Inches(2.2),
            "DAY PATTERN",
            "Wednesday softest day; Saturday strongest. Day gaps modest. Midday blackout would sacrifice conversion volume for small CPA gain.")

# ========== SLIDE 5 ==========
s = prs.slides.add_slide(blank)
add_rect(s, 0, 0, SLIDE_W, SLIDE_H, BODY_BG)
add_icon(s)
add_footer(s, 5)
add_eyebrow_headline(s, "DEMAND GEN", "OVERNIGHT IS THE BEST WINDOW — DO NOT CUT IT")
for i, (lab, val) in enumerate([
    ("DG SPEND", "$373.6k"),
    ("AVG CPA", "$1.99"),
    ("BEST", "1a–5a (eff 1.23–1.34)"),
    ("SOFTEST DAY", "Monday (eff 0.83)"),
]):
    add_kpi_card(s, x0 + i * (kw + gap), Inches(1.5), kw, Inches(1.15), lab, val, GOOD)
add_table(s, Inches(0.55), Inches(2.9), Inches(12.1), [
    ["Hour band", "Cost %", "Conv %", "CPA", "vs avg CPA", "Read"],
    ["1a–5a", "13.7%", "17.5%", "$1.49–1.61", "0.75–0.81×", "Protect — do not blackout"],
    ["Mon 7a–1p", "~3.4%", "~2.6%", "$2.4–3.0", "1.2–1.5×", "Optional Mon-only test"],
    ["7p–9p", "17.6%", "15.6%", "$2.21–2.31", "1.1–1.2×", "Watch only"],
], col_w)
add_callout(s, Inches(0.55), Inches(4.55), Inches(12.1), Inches(2.2),
            "TAKEAWAY",
            "Opposite of Search. Week-wide hour blackouts not supported by data.")

# ========== SLIDE 6 ==========
s = prs.slides.add_slide(blank)
add_rect(s, 0, 0, SLIDE_W, SLIDE_H, BODY_BG)
add_icon(s)
add_footer(s, 6)
add_eyebrow_headline(s, "CROSS-TYPE", "SAME CLOCK, DIFFERENT ECONOMICS")
add_table(s, Inches(0.55), Inches(1.6), Inches(12.1), [
    ["Window", "Search", "PMax", "Demand Gen"],
    ["12a–5a", "Blackout", "Optional / tiny", "PROTECT"],
    ["Midday", "Soft CPA but keep", "Soft CPA but keep", "Flat / mild soft"],
    ["Evening", "PROTECT", "Hold", "Watch"],
    ["Monday", "Neutral", "Mild soft", "Softest day"],
], [Inches(2.2), Inches(3.2), Inches(3.2), Inches(3.3)])
add_callout(s, Inches(0.55), Inches(4.2), Inches(12.1), Inches(2.5),
            "IMPLICATION",
            "One schedule does not fit all campaign types. Apply blackouts by type.")

# ========== SLIDE 7 ==========
s = prs.slides.add_slide(blank)
add_rect(s, 0, 0, SLIDE_W, SLIDE_H, DARK_BG)
add_icon(s, title=True)
add_footer(s, 7)
add_textbox(s, Inches(0.55), Inches(0.5), Inches(12.0), Inches(0.7),
            "BLACKOUT WHERE SPEND OUTRUNS CONVERSIONS — START WITH SEARCH",
            "Arial Narrow", 26, True, WHITE)
add_rect(s, Inches(0.58), Inches(1.18), Inches(0.72), Inches(0.075), ORANGE)
findings = [
    (GOOD, "1  SEARCH — Blackout hrs 0–4 every day (5.9% spend → 2.7% conv; CPA ~2×)", False),
    (ORANGE, "2  SEARCH — Strong test: also blackout hr 9 (1.4% spend / 0.8% conv)", False),
    (MUTED2, "3  DEMAND GEN — Optional Monday-only 7a–11a test; never cut overnight", False),
    (WHITE, "4  RECOMMENDATION — Do not blackout PMax peak hours. Implement Search overnight blackouts first; re-check after 2–4 weeks.", True),
]
y = 1.55
for color, text, is_rec in findings:
    add_rect(s, Inches(0.55), Inches(y), Inches(12.1), Inches(1.05), RGBColor(0x1C, 0x1C, 0x1C))
    add_rect(s, Inches(0.55), Inches(y), Inches(0.12), Inches(1.05), color)
    add_textbox(s, Inches(0.9), Inches(y) + Inches(0.28), Inches(11.5), Inches(0.55),
                text, "Arial Narrow" if is_rec else "Arial", 15 if is_rec else 14, is_rec,
                WHITE if is_rec else MUTED3)
    y += 1.2

prs.save(OUT)
print("SAVED", OUT)
print("slides", len(prs.slides))