# -*- coding: utf-8 -*-
"""Branded Search messaging territories + post-direction RSA draft for Red Robin."""
import re
from pathlib import Path

try:
    import openpyxl
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
except ImportError:
    raise SystemExit("openpyxl required")


def effective_len(text: str) -> int:
    return len(re.sub(r"\{CUSTOMIZER\.[^:]+:([^}]+)\}", r"\1", text))


def eff_display(text: str) -> str:
    return re.sub(r"\{CUSTOMIZER\.[^:]+:([^}]+)\}", r"\1", text)


HEADER_FILL = PatternFill("solid", fgColor="8B1E1E")
HEADER_FONT = Font(color="FFFFFF", bold=True)
TITLE_FONT = Font(bold=True, size=14)
SECTION_FONT = Font(bold=True, size=11)


def style_header_row(ws, row: int) -> None:
    for cell in ws[row]:
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT


# ---------------------------------------------------------------------------
# Finished RSA draft (hold until 1:1 picks a territory)
# ---------------------------------------------------------------------------
HEADLINES = [
    ("H1", "Brand confirmation", "Official Red Robin® Site", "Pin preferred for branded queries"),
    ("H2", "Brand + menu", "Red Robin® Burgers & Fries", ""),
    ("H3", "Local intent", "Red Robin® Near You", "Supports Near Me / Geo AGs"),
    ("H4", "Deal customizer", "{CUSTOMIZER.Deal:Big Yummm Deals}", "Update Deal attribute when offer rotates"),
    ("H5", "Price customizer", "{CUSTOMIZER.DealPrice:$9.99} Full Meals", "Update DealPrice with offer"),
    ("H6", "Loyalty CTA", "Join Red Robin Royalty®", "From /rewards"),
    ("H7", "Royalty perk", "Free Appetizer for Royalty", "Signup perk; terms apply"),
    ("H8", "Rewards math", "Earn $10 for 100 Points", "1 pt / $1 → $10 at 100"),
    ("H9", "Bottomless signature", "Bottomless Sides & Drinks", "Keep from current BYD set"),
    ("H10", "Bottomless proof", "30+ Bottomless Items", "From /bottomless-fries-and-sides"),
    ("H11", "Family dining", "Family Dining at Red Robin®", "Core family angle for branded SERPs"),
    ("H12", "Family invite", "Bring the Whole Family", "Table-time / group dining"),
    ("H13", "Local CTA", "Visit Your Local Red Robin®", "Keep from current set"),
    ("H14", "Family value", "Meals the Whole Family Loves", "Adult + kids appeal without kids-only creative"),
    ("H15", "Brand tagline", "Red Robin®, YUMMM®", "Keep from current set"),
]

ALT_HEADLINES = [
    ("Alt", "Family together", "Dine Together at Red Robin®", "Extra family line if rotating H11–H14"),
    ("Alt", "Family favorites", "Family Favorites Near You", "Geo / Near Me AGs"),
    ("Alt", "Member exclusives", "Member-Only Deals & Offers", "Royalty exclusive perks"),
    ("Alt", "Birthday perk", "Birthday Treats for Royalty", "Family-adjacent Royalty perk"),
    ("Alt", "Gift cards", "Red Robin® Gift Cards", "From /gift-cards; covered via sitelink"),
    ("Alt", "Catering", "Catering for Any Occasion", "Events / group feed"),
    ("Alt", "Allergens", "Allergen Info You Can Trust", "Strong for Menu / dietary intent"),
    ("Alt", "Signature fries", "Bottomless Steak Fries®", ""),
    ("Alt", "Find CTA", "Find Restaurants Near You", "Keep from current set"),
    ("Alt", "Customization", "Customize Your Gourmet Burger", "From allergens/nutrition page"),
    ("Alt", "App CTA", "Sign Up. Get a Free App*", "Royalty signup CTA"),
]

DESCRIPTIONS = [
    (
        "D1",
        "Deal + brand",
        "Found us! See {CUSTOMIZER.Deal:Big Yummm Deals}—entrée, bottomless side & drink from {CUSTOMIZER.DealPrice:$9.99}.",
        "Primary deal customizer line",
    ),
    (
        "D2",
        "Family + bottomless",
        "Bring the family for burgers, bottomless sides & drinks—plus kids favorites at Red Robin®.",
        "Family-led; pairs with H11/H12/H14",
    ),
    (
        "D3",
        "Royalty perks",
        "Join Royalty® for a free appetizer*, points every visit, birthday treats & member deals.",
        "Loyalty-led; no deal dependency",
    ),
    (
        "D4",
        "Family + deal",
        "Family table time starts here. Try {CUSTOMIZER.Deal:Big Yummm Deals} and earn Royalty® rewards every visit.",
        "Family + deal customizer combo",
    ),
]

DESC_BANK = [
    (
        "D5",
        "Rewards math",
        "Earn 1 point per $1—100 points = $10 reward. Unlock bottomless Royalty® perks today.",
        "Optional swap for D3",
    ),
    (
        "D6",
        "Perks mix",
        "Gift cards, catering & allergen info—plus Royalty® rewards when you dine at Red Robin®.",
        "Optional / sitelink-aligned",
    ),
]

CUSTOMIZER_ATTRS = [
    ("Deal", "Text", "Big Yummm Deals", "Headline + description deal name"),
    ("DealPrice", "Text", "$9.99", "Price pin; keep under 6 chars for H5 headroom"),
    ("DealStack", "Text", "Entrée + Bottomless Side & Drink", "Optional longer description insert"),
]

SITELINKS = [
    ("Red Robin Royalty®", "Free appetizer* & points on every visit.", "Birthday treats & member-only deals.", "https://www.redrobin.com/rewards"),
    ("Kids Meals", "Kid-approved entrées & bottomless sides.", "Mac It Yours, Cluck-A-Doodles & more.", "https://www.redrobin.com/menu/kids-meals"),
    ("Gift Cards", "Say it with burgers and brews.", "eGift or physical—delivered fast.", "https://www.redrobin.com/gift-cards"),
    ("Catering", "Burger bars, boxed meals & bundles.", "Feed the team—earn catering rewards.", "https://www.redrobin.com/catering"),
    ("Allergens & Nutrition", "Customize with confidence.", "Allergen promise + full nutrition details.", "https://www.redrobin.com/allergens-and-nutrition"),
    ("Big Yummm Deals", "Full meal deals starting at $9.99.", "Entrée, bottomless side & beverage.", "https://www.redrobin.com/the-big-yummm"),
    ("Bottomless Menu", "30+ bottomless sides & drinks.", "Unlimited refills on the good stuff.", "https://www.redrobin.com/menu/bottomless"),
]


def write_territories(wb) -> None:
    ws = wb.create_sheet("1-1 Messaging Territories", 0)
    ws["A1"] = "Branded Search — Messaging Territories for 1:1"
    ws["A1"].font = TITLE_FONT
    ws.merge_cells("A1:D1")

    rows = [
        [],
        ["Boss prompt framing"],
        ["Lens", "Searcher is already Googling “Red Robin.” They know us and have chosen us."],
        ["Problem", "Brand RSAs currently re-introduce the brand and restate $9.99 BYD—same copy as Competitor & Menu."],
        ["Ask", "2–3 messaging territories with sample headlines (not finished copy). Pick a direction in 1:1, then build."],
        ["Inventory", "15 RSAs · 6 brand campaigns · 2 variants (BYD + Kids) · 3 Poor / 7 Average ad strength"],
        [],
        ["Working answers to the prompts"],
        [
            "Job of a branded ad",
            "Not awareness. With click probability high, the job is: (1) win the paid slot vs competitors bidding brand, (2) route to the best next step, (3) add something organic + GBP do not already say. Reassurance and offer are supporting, not the lead.",
        ],
        [
            "Where BYD / $9.99 sits",
            "Not the lead on Exact/Phrase Brand. Offer is an accelerator / proof point (1–2 headlines or a description customizer), not the identity of the ad. Keep full BYD set on Competitor + Menu (and Deals AGs) where shoppers are still choosing.",
        ],
        [
            "What organic + GBP already cover",
            "Brand name, hours, address, phone, ratings, map pin, often Menu/Locations sitelinks. Paid should not waste H1–H3 on “Official Red Robin Site” or “Near You” alone—those are redundant with the Business Profile and organic pack.",
        ],
        [
            "Own Brand RSA variant?",
            "Yes. Brand Exact/Phrase should stop sharing the BYD set with Competitor/Menu. Kids already proves vertical-specific creative lifts relevance; Brand needs the same treatment. Competitor/Menu keep offer-led BYD.",
        ],
        [
            "Geo / Near Me",
            "Proximity is the targeting (keywords + location), not the message. Mirror Brand Exact/Phrase creative; use location extensions / location assets for “near me.” Do not make “Near You” the headline strategy.",
        ],
        [],
        ["Recommendation going into the 1:1"],
        [
            "Primary lean",
            "Territory B (Belong & Reward) as Brand Exact/Phrase lead, with 1–2 Territory C offer lines via customizer—not a full BYD rewrite.",
        ],
        [
            "Runner-up",
            "Territory A (Route & Convert) if the business KPI for brand search is order / locator clicks over loyalty capture.",
        ],
        [
            "Do not pick",
            "A fourth “re-introduce brand + $9.99” territory—that is today’s set and the problem statement.",
        ],
    ]

    r = 2
    for row in rows:
        for c, val in enumerate(row, 1):
            cell = ws.cell(r, c, val)
            if len(row) == 1 and row[0] in (
                "Boss prompt framing",
                "Working answers to the prompts",
                "Recommendation going into the 1:1",
            ):
                cell.font = SECTION_FONT
        r += 1

    # Territory table
    r += 1
    ws.cell(r, 1, "Three territories (sample headlines only)").font = SECTION_FONT
    r += 1
    headers = ["Territory", "Job / when it wins", "Sample headlines (ideation)", "BYD role", "Best for"]
    for c, h in enumerate(headers, 1):
        ws.cell(r, c, h)
    style_header_row(ws, r)
    r += 1

    territories = [
        [
            "A — Route & Convert",
            "Click is nearly free; reduce friction to the next action: locator, order, hours, dine-in vs pickup.",
            "Start Your Order Online\nFind Your Red Robin\nPickup, Delivery or Dine-In\nSee Hours & Directions\nOrder Ahead Tonight\nMenu Ready When You Are",
            "Optional 1 supporting line or sitelink only—not the lead.",
            "Brand Exact/Phrase if KPI = orders / store visits; Geo inherits same set.",
        ],
        [
            "B — Belong & Reward",
            "They already chose RR—deepen the relationship: Royalty, family table, bottomless as the reason to come now.",
            "Join Red Robin Royalty®\nFree Appetizer for Royalty\nEarn $10 for 100 Points\nFamily Dining Done Right\nBring the Whole Family\nBottomless Sides Await\nMember-Only Perks Inside",
            "Absent from lead headlines; sitelink or soft description mention only.",
            "Brand Exact/Phrase; strongest if loyalty / frequency is a priority.",
        ],
        [
            "C — Offer as Accelerator",
            "Brand intent + value nudge: deal is present but secondary—“while you’re here, here’s the deal.”",
            "Your Table Is Waiting\nTonight’s Deal Is On\n{Deal} While You’re Here\nFrom {Price} Full Meals\nBottomless Still Included\nCome Hungry. Leave Happy.",
            "1–2 customizer headlines + 1 description max. Not 8+ offer lines like today’s BYD set.",
            "Brand as a hybrid; or bridge if leadership won’t fully drop BYD from Brand.",
        ],
    ]
    for t in territories:
        for c, val in enumerate(t, 1):
            cell = ws.cell(r, c, val)
            cell.alignment = Alignment(wrap_text=True, vertical="top")
        ws.row_dimensions[r].height = 110
        r += 1

    r += 1
    ws.cell(r, 1, "Variant architecture (proposed)").font = SECTION_FONT
    r += 1
    for c, h in enumerate(["Ad group type", "RSA variant", "Lead message", "Notes"], 1):
        ws.cell(r, c, h)
    style_header_row(ws, r)
    r += 1
    architecture = [
        ["Brand Exact / Phrase", "NEW — Brand (pick A, B, or B+C)", "Utility or perks; offer secondary", "Stop sharing BYD set"],
        ["Geo / Near Me / Locations", "Same as Brand Exact/Phrase", "Same as Brand; location via targeting + extensions", "Proximity ≠ headline job"],
        ["Competitor", "Keep BYD (offer-led)", "$9.99 / Big Yummm / vs alt", "Still deciding vs alternatives"],
        ["Menu (Deals / General / Category / Top Items)", "Keep BYD; Kids stays Kids", "Offer + menu proof", "Menu-Deals especially offer-led"],
        ["Menu - Kids", "Keep Kids variant", "Kids menu specifics", "Already differentiated"],
    ]
    for row in architecture:
        for c, val in enumerate(row, 1):
            ws.cell(r, c, val).alignment = Alignment(wrap_text=True, vertical="top")
        r += 1

    r += 1
    ws.cell(r, 1, "1:1 decision checklist").font = SECTION_FONT
    r += 1
    checklist = [
        "1. Primary Brand KPI: store visit / order / Royalty signup / defend SERP?",
        "2. Pick territory A, B, or C (or B lead + C customizer garnish).",
        "3. Confirm Brand Exact/Phrase gets its own RSA; Competitor+Menu keep BYD.",
        "4. Confirm Geo/Near Me clone Brand creative (not a third “near me” set).",
        "5. After pick: build full 15H/4D RSA + sitelinks; retire shared BYD on Brand AGs.",
        "6. Watch ad strength on the 3 Poor / 7 Average RSAs after split—expect Brand strength to rise with unique assets.",
    ]
    for item in checklist:
        ws.cell(r, 1, item)
        r += 1

    ws.column_dimensions["A"].width = 28
    ws.column_dimensions["B"].width = 42
    ws.column_dimensions["C"].width = 40
    ws.column_dimensions["D"].width = 38
    ws.column_dimensions["E"].width = 40


def write_overview(wb) -> None:
    ws = wb.create_sheet("Overview", 1)
    overview = [
        ["Red Robin — Branded Search creative working file"],
        [],
        ["Status", "Territories sheet is for 1:1 direction. Branded RSA sheet is a pre-direction draft—rebuild after pick."],
        ["Boss lens", "Brand searcher already chose us; stop re-introducing brand + restating BYD like Competitor/Menu."],
        ["Prior draft lean", "Earlier RSA mixed brand + family + Royalty + deal customizer (closest to Territory B + C garnish)."],
        ["Kids set", "Leave Menu - Kids Variant B unchanged"],
        ["Legal", "Free appetizer* and rewards claims need disclosure where required"],
        [],
        ["Sources reviewed"],
        ["Creative brief", "Red Robin BYD Creative Brief.xlsx — Search Variant A + inventory"],
        ["URL", "https://www.redrobin.com/rewards"],
        ["URL", "https://www.redrobin.com/gift-cards"],
        ["URL", "https://www.redrobin.com/catering"],
        ["URL", "https://www.redrobin.com/allergens-and-nutrition"],
        ["URL", "https://www.redrobin.com/bottomless-fries-and-sides"],
        ["URL", "https://www.redrobin.com/menu/bottomless"],
        ["URL", "https://www.redrobin.com/menu/appetizers"],
        ["URL", "https://www.redrobin.com/menu/big-yummm-deals"],
    ]
    for r, row in enumerate(overview, 1):
        for c, val in enumerate(row, 1):
            ws.cell(r, c, val)
    ws["A1"].font = TITLE_FONT
    ws.column_dimensions["A"].width = 18
    ws.column_dimensions["B"].width = 110


def write_rsa_draft(wb) -> None:
    rsa = wb.create_sheet("Pre-direction RSA draft")
    rsa["A1"] = "HOLD — built before boss 1:1 framing. Rebuild after territory pick."
    rsa["A1"].font = Font(bold=True, color="8B1E1E")
    rsa.append([])
    rsa.append(["Headlines (30-char limit)"])
    rsa.append(["Slot", "Theme", "Copy", "Chars (fallback)", "Limit", "Headroom", "Notes"])
    style_header_row(rsa, rsa.max_row)
    for slot, theme, copy, notes in HEADLINES:
        n = effective_len(copy)
        rsa.append([slot, theme, copy, n, 30, 30 - n, notes])

    rsa.append([])
    rsa.append(["Alternate headlines (swap bank)"])
    rsa.append(["Slot", "Theme", "Copy", "Chars (fallback)", "Limit", "Headroom", "Notes"])
    style_header_row(rsa, rsa.max_row)
    for slot, theme, copy, notes in ALT_HEADLINES:
        n = effective_len(copy)
        rsa.append([slot, theme, copy, n, 30, 30 - n, notes])

    rsa.append([])
    rsa.append(["Descriptions (90-char limit)"])
    rsa.append(["Slot", "Theme", "Copy", "Chars (fallback)", "Limit", "Headroom", "Notes"])
    style_header_row(rsa, rsa.max_row)
    for slot, theme, copy, notes in DESCRIPTIONS + DESC_BANK:
        n = effective_len(copy)
        rsa.append([slot, theme, copy, n, 90, 90 - n, notes])

    for col, w in zip("ABCDEFG", [8, 22, 95, 16, 8, 10, 45]):
        rsa.column_dimensions[col].width = w


def write_customizer(wb) -> None:
    cz = wb.create_sheet("Ad Customizer")
    cz.append(["Google Ads ad customizer setup (relevant if Territory C or B+C garnish)"])
    cz.append([])
    cz.append(["Attribute", "Type", "Default / fallback", "Usage"])
    style_header_row(cz, 3)
    for row in CUSTOMIZER_ATTRS:
        cz.append(list(row))
    cz.append([])
    cz.append(["Ops note", "When the featured deal changes, update attribute values once—RSA copy stays put."])
    cz.append(["Brand caution", "On Brand Exact/Phrase, use Deal/DealPrice sparingly (1–2 H + 1 D)—do not rebuild the full BYD set."])
    for col, w in zip("ABCD", [16, 10, 40, 55]):
        cz.column_dimensions[col].width = w


def write_sitelinks(wb) -> None:
    sl = wb.create_sheet("Sitelinks")
    sl.append(["Recommended branded sitelinks (pair with whichever territory wins)"])
    sl.append([])
    sl.append(["Link text", "Description 1", "Description 2", "Final URL"])
    style_header_row(sl, 3)
    for row in SITELINKS:
        sl.append(list(row))
    for col, w in zip("ABCD", [24, 45, 45, 55]):
        sl.column_dimensions[col].width = w


def main() -> None:
    out = Path(r"c:\Users\skyes\OneDrive\Desktop\Red Robin Branded Search RSA Draft.xlsx")
    wb = openpyxl.Workbook()
    # remove default; territories will be index 0
    default = wb.active
    wb.remove(default)

    write_territories(wb)
    write_overview(wb)
    write_rsa_draft(wb)
    write_customizer(wb)
    write_sitelinks(wb)

    print("Char QA — Pre-direction draft headlines")
    for slot, theme, copy, _ in HEADLINES:
        n = effective_len(copy)
        print(f"  {slot} {n:2d}/30 {'OK' if n <= 30 else 'OVER'} | {eff_display(copy)}")
    print("Char QA — Descriptions")
    for slot, theme, copy, _ in DESCRIPTIONS + DESC_BANK:
        n = effective_len(copy)
        print(f"  {slot} {n:2d}/90 {'OK' if n <= 90 else 'OVER'} | {eff_display(copy)}")

    wb.save(out)
    print(f"\nWrote {out}")


if __name__ == "__main__":
    main()
