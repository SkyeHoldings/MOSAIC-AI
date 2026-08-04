"""
Enrich Contact List for Apollo - Enriched.xlsx using Apollo API.
Reads APOLLO_API_KEY from environment. Does not write the key to disk.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import openpyxl

SRC = Path(r"c:\Users\skyes\OneDrive\Desktop\Contact List for Apollo - Enriched.xlsx")
WORK = Path(r"C:\Users\skyes\Projects\understory-marketing-site\_tmp_apollo_enrich_work.xlsx")
OUT = Path(r"c:\Users\skyes\OneDrive\Desktop\Contact List for Apollo - Enriched.xlsx")
LOG = Path(r"C:\Users\skyes\Projects\understory-marketing-site\_tmp_apollo_enrich_log.json")

API_KEY = os.environ.get("APOLLO_API_KEY", "").strip()
BASE = "https://api.apollo.io/api/v1"
HEADERS = {
    "X-Api-Key": API_KEY,
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
}

SENIOR_TITLES = [
    "Owner",
    "Founder",
    "Co-Founder",
    "CEO",
    "President",
    "Managing Partner",
    "Managing Director",
    "Principal",
    "Partner",
    "Branch Manager",
    "Area Manager",
    "Director",
    "General Manager",
]

EMPTY = {"", "none", "-", "n/a", "na", "null", "?", "n/a?"}


def blank(v) -> bool:
    if v is None:
        return True
    s = str(v).strip().lower()
    return s in EMPTY


def api_request(method: str, path: str, payload: dict | None = None, query: dict | None = None):
    url = BASE + path
    if query:
        url += "?" + urllib.parse.urlencode(query, doseq=True)
    data = None if payload is None else json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.status, json.loads(resp.read().decode() or "{}")
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")[:2000]
        try:
            parsed = json.loads(body)
        except Exception:
            parsed = {"raw": body}
        return e.code, parsed


def extract_phone(person: dict) -> str | None:
    phones = person.get("phone_numbers") or []
    for p in phones:
        if isinstance(p, dict):
            num = p.get("sanitized_number") or p.get("raw_number") or p.get("number")
            if num:
                return str(num)
        elif p:
            return str(p)
    for key in ("sanitized_phone", "phone"):
        if person.get(key):
            return str(person[key])
    org = person.get("organization") or {}
    if org.get("sanitized_phone"):
        return str(org["sanitized_phone"])
    if org.get("phone"):
        return str(org["phone"])
    return None


def extract_email(person: dict) -> str | None:
    email = person.get("email")
    if email and str(email).lower() not in {"unavailable", "unavailable@domain.com"}:
        return str(email)
    for e in person.get("personal_emails") or []:
        if e:
            return str(e)
    return None


def people_match(**kwargs):
    # Direct phone reveal requires webhook_url on this Apollo plan; skip it.
    kwargs.pop("reveal_phone_number", None)
    status, data = api_request("POST", "/people/match", kwargs)
    if status >= 400:
        return None, {"status": status, "error": data}
    return data.get("person") or {}, data


def search_orgs(name: str, location_hint: str = "Idaho"):
    q = name.strip()
    status, data = api_request(
        "GET",
        "/organizations/search",
        query={"q_organization_name": q, "per_page": 10},
    )
    if status >= 400:
        return []
    orgs = data.get("organizations") or []
    if not orgs:
        return []

    def score(o):
        oname = (o.get("name") or "").lower()
        s = 0
        target = q.lower()
        if oname == target:
            s += 100
        elif target in oname or oname in target:
            s += 50
        loc = " ".join(
            str(x or "")
            for x in (o.get("city"), o.get("state"), o.get("raw_address"), o.get("country"))
        ).lower()
        if location_hint and location_hint.lower() in loc:
            s += 40
        if "idaho" in loc or "coeur" in loc or "kootenai" in loc or "spokane" in loc:
            s += 25
        if o.get("phone") or o.get("sanitized_phone"):
            s += 5
        return s

    ranked = sorted(orgs, key=score, reverse=True)
    best = ranked[0]
    # Reject garbage matches with tiny score
    if score(best) < 40:
        # still allow exact-ish name matches
        if score(best) < 20:
            return []
    return ranked


def search_senior_people(org_id: str, contact_name: str | None = None):
    payload = {
        "organization_ids": [org_id],
        "person_titles": SENIOR_TITLES,
        "per_page": 10,
        "page": 1,
    }
    status, data = api_request("POST", "/mixed_people/api_search", payload)
    people = (data.get("people") or []) if status < 400 else []

    if not people:
        # broader search at org
        status, data = api_request(
            "POST",
            "/mixed_people/api_search",
            {"organization_ids": [org_id], "per_page": 10, "page": 1},
        )
        people = (data.get("people") or []) if status < 400 else []

    if not people:
        return None

    def rank(p):
        title = (p.get("title") or "").lower()
        score = 0
        for i, t in enumerate(SENIOR_TITLES):
            if t.lower() in title:
                score += 100 - i
        if contact_name:
            cn = re.sub(r"[^a-z ]", "", contact_name.lower())
            first = (p.get("first_name") or "").lower()
            if first and first in cn:
                score += 50
        if p.get("has_email"):
            score += 5
        if str(p.get("has_direct_phone") or "").lower().startswith("yes"):
            score += 10
        return score

    people = sorted(people, key=rank, reverse=True)
    top = people[0]
    # Enrich full person by id
    person, _ = people_match(id=top.get("id"), reveal_personal_emails=True)
    return person or top


def clean_contact_name(raw) -> str | None:
    if blank(raw):
        return None
    s = str(raw)
    s = re.split(r"[-–—|/]", s)[0]
    s = re.sub(r"\b(owner|bm|abm|liaison|compliance admin|branch manager|area branch manager)\b", "", s, flags=re.I)
    s = re.sub(r"[?]+", "", s).strip(" ,")
    # drop multi-person blobs
    if "&" in s or "," in s:
        s = re.split(r"[&,]", s)[0].strip()
    if len(s) < 2:
        return None
    return s


def enrich_row(business, contact, email, location_hint="Idaho"):
    result = {
        "matched": False,
        "status": "no_match",
        "person_name": None,
        "title": None,
        "email": None,
        "phone": None,
        "linkedin": None,
        "org_phone": None,
        "notes": "",
    }

    # 1) email match
    if email and "@" in str(email):
        person, meta = people_match(email=str(email).strip(), reveal_personal_emails=True)
        if person and (person.get("name") or person.get("first_name") or extract_email(person) or extract_phone(person)):
            result.update(
                {
                    "matched": True,
                    "status": "email_match",
                    "person_name": person.get("name")
                    or " ".join(filter(None, [person.get("first_name"), person.get("last_name")])),
                    "title": person.get("title"),
                    "email": extract_email(person) or str(email).strip(),
                    "phone": extract_phone(person),
                    "linkedin": person.get("linkedin_url"),
                    "org_phone": ((person.get("organization") or {}).get("sanitized_phone")
                                  or (person.get("organization") or {}).get("phone")),
                    "notes": "matched via email",
                }
            )
            # if still no phone, keep going for org/senior fallback phone
            if result["phone"]:
                return result

    # 2) org + senior person
    if blank(business):
        result["notes"] = "no business name"
        return result

    orgs = search_orgs(str(business), location_hint=location_hint)
    if not orgs:
        result["notes"] = (result["notes"] + "; " if result["notes"] else "") + "no org match"
        return result

    org = orgs[0]
    result["org_phone"] = org.get("sanitized_phone") or org.get("phone") or result.get("org_phone")

    person = search_senior_people(org["id"], clean_contact_name(contact))
    if not person:
        # org-only fill
        if result["org_phone"] and not result["phone"]:
            result["phone"] = result["org_phone"]
            result["matched"] = True
            result["status"] = "org_phone_only"
            result["notes"] = f"org only: {org.get('name')}"
            return result
        result["notes"] = f"org found ({org.get('name')}) but no senior person"
        return result

    result.update(
        {
            "matched": True,
            "status": "senior_match" if result["status"] == "no_match" else result["status"] + "+senior",
            "person_name": person.get("name")
            or " ".join(filter(None, [person.get("first_name"), person.get("last_name")]))
            or result["person_name"],
            "title": person.get("title") or result["title"],
            "email": extract_email(person) or result["email"],
            "phone": extract_phone(person) or result["org_phone"] or result["phone"],
            "linkedin": person.get("linkedin_url") or result["linkedin"],
            "notes": (result["notes"] + "; " if result["notes"] else "")
            + f"senior @ {org.get('name')}",
        }
    )
    return result


def main():
    if not API_KEY:
        raise SystemExit("APOLLO_API_KEY not set")

    # health check
    st, health = api_request("GET", "/auth/health")
    print("health", st, health)

    try:
        shutil.copy2(SRC, WORK)
    except PermissionError:
        print("SOURCE_LOCKED: close the Excel file and re-run")
        raise SystemExit(2)

    wb = openpyxl.load_workbook(WORK)
    ws = wb.active
    headers = [c.value for c in ws[1]]
    idx = {h: i for i, h in enumerate(headers)}

    col = {
        "business": idx["Business"] + 1,
        "contact": idx["Contact"] + 1,
        "email": idx["Email / Contact Info"] + 1,
        "apollo_email": idx["Apollo Email"] + 1,
        "phone": idx["Phone"] + 1,
        "apollo_name": idx["Apollo Name"] + 1,
        "apollo_title": idx["Apollo Title"] + 1,
        "linkedin": idx["LinkedIn"] + 1,
        "personal": idx["Personal Emails"] + 1,
        "status": idx["Enrichment Status"] + 1,
    }

    log = []
    filled = 0
    attempted = 0

    for row in range(2, ws.max_row + 1):
        business = ws.cell(row, col["business"]).value
        contact = ws.cell(row, col["contact"]).value
        email = ws.cell(row, col["email"]).value or ws.cell(row, col["apollo_email"]).value
        phone = ws.cell(row, col["phone"]).value

        if blank(business) and blank(contact) and blank(email):
            continue

        need_email = blank(email)
        need_phone = blank(phone)
        if not need_email and not need_phone:
            continue

        attempted += 1
        print(f"[{attempted}] {business} | {contact} | email={email!r}")
        try:
            res = enrich_row(business, contact, email)
        except Exception as e:
            res = {"matched": False, "status": "error", "notes": str(e)}
            print("  ERROR", e)

        changed = False
        if need_email and res.get("email"):
            ws.cell(row, col["apollo_email"]).value = res["email"]
            if blank(ws.cell(row, col["email"]).value):
                ws.cell(row, col["email"]).value = res["email"]
            changed = True
        if need_phone and res.get("phone"):
            ws.cell(row, col["phone"]).value = res["phone"]
            changed = True
        if res.get("person_name") and blank(ws.cell(row, col["apollo_name"]).value):
            ws.cell(row, col["apollo_name"]).value = res["person_name"]
            changed = True
        if res.get("title") and blank(ws.cell(row, col["apollo_title"]).value):
            ws.cell(row, col["apollo_title"]).value = res["title"]
            changed = True
        if res.get("linkedin") and blank(ws.cell(row, col["linkedin"]).value):
            ws.cell(row, col["linkedin"]).value = res["linkedin"]
            changed = True

        old_status = ws.cell(row, col["status"]).value or ""
        ws.cell(row, col["status"]).value = f"{old_status}; apollo2:{res.get('status')}"[:240]

        if changed:
            filled += 1
        print("  ->", res.get("status"), res.get("person_name"), res.get("email"), res.get("phone"))
        log.append({"row": row, "business": business, "result": res})
        time.sleep(0.35)  # be gentle on rate limits

        if attempted % 20 == 0:
            wb.save(WORK)
            print("checkpoint save", attempted)

    wb.save(WORK)
    try:
        shutil.copy2(WORK, OUT)
        saved_to = str(OUT)
    except PermissionError:
        alt = OUT.with_name("Contact List for Apollo - Enriched - UPDATED.xlsx")
        shutil.copy2(WORK, alt)
        saved_to = str(alt)
        print("Desktop file locked; wrote", alt)

    LOG.write_text(json.dumps({"attempted": attempted, "filled": filled, "log": log}, indent=2, default=str), encoding="utf-8")
    print("DONE attempted", attempted, "filled", filled, "saved", saved_to)


if __name__ == "__main__":
    main()
