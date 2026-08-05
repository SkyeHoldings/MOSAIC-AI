import json
from pathlib import Path
from collections import defaultdict

path = Path(r"c:\Users\skyes\Downloads\Untitled report (17).csv")
text = path.read_bytes().decode("utf-16")
lines = text.splitlines()

title = lines[0].strip().strip('"')
date_range = lines[1].strip().strip('"')
headers = lines[2].split("\t")

rows = []
for line in lines[3:]:
    if not line.strip():
        continue
    parts = line.split("\t")
    if len(parts) < len(headers):
        parts += [""] * (len(headers) - len(parts))
    rows.append(dict(zip(headers, parts)))

def num(v):
    if v is None or v == "":
        return 0.0
    s = str(v).replace(",", "").replace('"', "").strip()
    if s in ("--", "-", "\u2014"):
        return 0.0
    try:
        return float(s)
    except Exception:
        return 0.0

metric_candidates = [h for h in headers if any(k in h.lower() for k in ["cost", "conv", "click", "impression", "cpa", "value"])]
by_hour = {h: defaultdict(float) for h in range(24)}
accounts = set()
campaigns = set()
campaign_types = set()
days = defaultdict(lambda: defaultdict(float))

cost_col = None
conv_col = None
for h in headers:
    hl = h.lower()
    if hl == "cost" or (hl.startswith("cost") and "conv" not in hl):
        cost_col = h
    if "conversion" in hl and "rate" not in hl and "value" not in hl:
        conv_col = h

for r in rows:
    hour = int(float(r.get("Hour of the day", 0) or 0))
    cost = num(r.get(cost_col, 0)) if cost_col else 0
    conv = num(r.get(conv_col, 0)) if conv_col else 0
    by_hour[hour]["cost"] += cost
    by_hour[hour]["conversions"] += conv
    if "Account name" in r:
        accounts.add(r["Account name"])
    if "Campaign" in r:
        campaigns.add(r["Campaign"])
    if "Campaign type" in r:
        campaign_types.add(r["Campaign type"])
    dow_key = r.get("Day of week") or r.get("Day of the week")
    if dow_key:
        days[dow_key]["cost"] += cost
        days[dow_key]["conversions"] += conv

total_cost = sum(by_hour[h]["cost"] for h in range(24))
total_conv = sum(by_hour[h]["conversions"] for h in range(24))
avg_cpa = (total_cost / total_conv) if total_conv > 0 else None

hours = []
hour_labels = []
conversions_arr = []
cost_arr = []
cpa_arr = []
cost_pct_arr = []
conv_pct_arr = []

for h in range(24):
    c = by_hour[h]["cost"]
    v = by_hour[h]["conversions"]
    cpa = (c / v) if v > 0 else None
    cost_pct = (c / total_cost * 100) if total_cost > 0 else 0.0
    conv_pct = (v / total_conv * 100) if total_conv > 0 else 0.0
    vs_avg = None
    if cpa is not None and avg_cpa and avg_cpa > 0:
        vs_avg = ((cpa - avg_cpa) / avg_cpa) * 100
    hours.append({
        "hour": h,
        "label": "{:02d}:00".format(h),
        "cost": round(c, 2),
        "conversions": round(v, 2),
        "cpa": round(cpa, 2) if cpa is not None else None,
        "cost_pct": round(cost_pct, 2),
        "conv_pct": round(conv_pct, 2),
        "cpa_vs_avg_pct": round(vs_avg, 1) if vs_avg is not None else None,
    })
    hour_labels.append("{:02d}:00".format(h))
    conversions_arr.append(round(v, 2))
    cost_arr.append(round(c, 2))
    cpa_arr.append(round(cpa, 2) if cpa is not None else None)
    cost_pct_arr.append(round(cost_pct, 2))
    conv_pct_arr.append(round(conv_pct, 2))

with_cpa = [x for x in hours if x["cpa"] is not None]
by_cpa_asc = sorted(with_cpa, key=lambda x: x["cpa"])
by_cpa_desc = sorted(with_cpa, key=lambda x: x["cpa"], reverse=True)
by_vol_desc = sorted(hours, key=lambda x: x["conversions"], reverse=True)
by_vol_asc = sorted(hours, key=lambda x: x["conversions"])

samples = [{k: r[k] for k in headers} for r in rows[:3]]
nonzero_cost_rows = sum(1 for r in rows if num(r.get(cost_col, 0)) > 0)
nonzero_conv_rows = sum(1 for r in rows if num(r.get(conv_col, 0)) > 0)

dow_summary = None
if days:
    dow_summary = []
    for d, m in days.items():
        cpa = (m["cost"] / m["conversions"]) if m["conversions"] > 0 else None
        dow_summary.append({"day": d, "cost": round(m["cost"], 2), "conversions": round(m["conversions"], 2), "cpa": round(cpa, 2) if cpa is not None else None})

out = {
    "title": title,
    "date_range": date_range,
    "encoding": "utf-16",
    "columns": headers,
    "row_count": len(rows),
    "metric_columns": metric_candidates,
    "cost_column": cost_col,
    "conversions_column": conv_col,
    "note": "Cost is all zeros in this export; CPA and cost_pct are null/zero. Conversions by conv time are the primary signal for hour-of-day.",
    "unique_accounts": sorted(accounts),
    "unique_campaigns": sorted(campaigns) if campaigns else [],
    "unique_campaign_types": sorted(campaign_types) if campaign_types else [],
    "has_day_of_week": bool(days),
    "day_of_week_summary": dow_summary,
    "totals": {
        "cost": round(total_cost, 2),
        "conversions": round(total_conv, 2),
        "avg_cpa": round(avg_cpa, 2) if avg_cpa is not None else None,
        "nonzero_cost_rows": nonzero_cost_rows,
        "nonzero_conv_rows": nonzero_conv_rows,
    },
    "by_hour": hours,
    "chart_series": {
        "hour_labels": hour_labels,
        "conversions": conversions_arr,
        "cost": cost_arr,
        "cpa": cpa_arr,
        "cost_pct": cost_pct_arr,
        "conv_pct": conv_pct_arr,
    },
    "top_hours_by_cpa_best": [{"hour": x["hour"], "cpa": x["cpa"], "conversions": x["conversions"], "cost": x["cost"]} for x in by_cpa_asc[:5]],
    "bottom_hours_by_cpa_worst": [{"hour": x["hour"], "cpa": x["cpa"], "conversions": x["conversions"], "cost": x["cost"]} for x in by_cpa_desc[:5]],
    "top_hours_by_conversions": [{"hour": x["hour"], "conversions": x["conversions"], "conv_pct": x["conv_pct"], "cost": x["cost"]} for x in by_vol_desc[:5]],
    "bottom_hours_by_conversions": [{"hour": x["hour"], "conversions": x["conversions"], "conv_pct": x["conv_pct"], "cost": x["cost"]} for x in by_vol_asc[:5]],
    "sample_rows": samples,
}

out_path = Path(r"C:\Users\skyes\Projects\understory-marketing-site\_tmp_pmax_hour_summary.json")
out_path.write_text(json.dumps(out, indent=2), encoding="utf-8")
print("WROTE", out_path)
print("rows", len(rows), "total_conv", total_conv, "total_cost", total_cost)