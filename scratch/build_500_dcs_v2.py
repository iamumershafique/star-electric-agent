import json
import re
from datetime import datetime, timedelta

def excel_date_to_str(val):
    if not val:
        return "2025-03-22"
    val = str(val).strip()
    try:
        f = float(val)
        if f > 30000:
            base = datetime(1899, 12, 30)
            d = base + timedelta(days=f)
            return d.strftime("%Y-%m-%d")
    except ValueError:
        pass
    for fmt in ["%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d", "%d/%m/%y"]:
        try:
            d = datetime.strptime(val, fmt)
            return d.strftime("%Y-%m-%d")
        except ValueError:
            pass
    return val

with open(r"C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\scratch\drive_scans_index.json", "r", encoding="utf-8") as f:
    scans = json.load(f)

with open(r"C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\scratch\sheet1_parsed.json", "r", encoding="utf-8") as f:
    rows = json.load(f)

# Builty map: builty_no -> file_id
builty_map = {}
for name, fid in scans.get('builty', {}).items():
    m = re.findall(r'\d+', name)
    if m:
        builty_map[m[0]] = fid
        for num_str in m:
            builty_map[num_str] = fid

# Special OCR / typo alias for builty:
if '3917' in builty_map and '3817' not in builty_map:
    builty_map['3817'] = builty_map['3917']

# DC map: dc_num -> file_id
dc_map = {}
for cat in ['dc_001_100', 'dc_101_200', 'dc_201_300', 'dc_301_400', 'dc_401_500']:
    for name, fid in scans.get(cat, {}).items():
        m = re.findall(r'\d+', name)
        if m:
            num = int(m[-1] if len(m) > 1 and len(m[-1]) >= 3 else m[0])
            dc_map[num] = fid

print(f"Total mapped DC scan files: {len(dc_map)}")
print(f"Total mapped Builty scan files: {len(builty_map)}")

records = []
for r_num, cols in rows[2:502]:
    s_no = cols.get("A", "").strip()
    raw_date = cols.get("B", "").strip()
    site = cols.get("C", "").strip()
    dc_no = cols.get("D", "").strip()
    builty_no = cols.get("E", "") or ""
    builty_no = str(builty_no).strip()

    if builty_no.endswith(".0"):
        builty_no = builty_no[:-2]
    if s_no.endswith(".0"):
        s_no = s_no[:-2]

    clean_date = excel_date_to_str(raw_date)

    # Parse numeric sequence from s_no or dc_no
    seq = None
    try:
        seq = int(s_no)
    except ValueError:
        m = re.search(r'(\d+)', dc_no)
        if m:
            seq = int(m.group(1))

    if seq is None:
        seq = len(records) + 1

    formatted_dc = f"DC-{str(seq).zfill(4)}"
    is_missing = False
    if dc_no and not "missing" in dc_no.lower() and not "miss" in dc_no.lower():
        if not dc_no.upper().startswith("DC"):
            formatted_dc = f"DC-{dc_no}"
        else:
            formatted_dc = dc_no
    elif "missing" in dc_no.lower() or "miss" in dc_no.lower():
        formatted_dc = f"DC-{str(seq).zfill(4)} (Missing)"
        is_missing = True

    has_builty = bool(builty_no and builty_no.lower() != "none" and builty_no.lower() != "null")

    # Document Image - actual scan
    doc_image = None
    if seq in dc_map:
        doc_image = f"https://lh3.googleusercontent.com/d/{dc_map[seq]}=w1200"
    
    # Builty Image
    builty_img = None
    if has_builty and builty_no in builty_map:
        builty_img = f"https://lh3.googleusercontent.com/d/{builty_map[builty_no]}=w1200"

    site_name = site if site else "Jadeed Group Site (Pending Allocation)"

    # ALL 500 DCS ARE MARKED AS DELIVERED
    if has_builty:
        remarks_text = f"Delivered via Goods Transport (Builty #{builty_no})"
    elif is_missing:
        remarks_text = "Delivered / Missing physical page in book"
    else:
        remarks_text = "Delivered to Farm / Site"

    record = {
        "id": f"dc-jad-{str(seq).zfill(4)}",
        "dcNumber": formatted_dc,
        "invoiceNumber": formatted_dc,
        "prNumber": f"PR-JAD-{str(seq).zfill(4)}",
        "prId": f"pr-jad-{str(seq).zfill(4)}",
        "date": clean_date,
        "siteName": site_name,
        "deliveryStatus": "Delivered",
        "createdTimestamp": 1711000000000 + seq * 1000,
        "itemsShipped": [
            {
                "itemId": f"item-jad-{str(seq).zfill(4)}-1",
                "itemName": f"Electrical Supplies & Consumables ({site_name})",
                "brand": "General Electrical",
                "quantity": 1,
                "unit": "lot"
            }
        ],
        "transportType": "Adda / Goods Transport" if has_builty else "Delivered",
        "remarks": remarks_text
    }

    if has_builty:
        record["isBuiltyAttached"] = True
        record["addaName"] = "Goods Transport (General)"
        record["biltyNumber"] = builty_no
        record["freightCharges"] = 0
        record["isFreightFree"] = True
        record["freightStatus"] = "Paid"
        record["destinationCity"] = site_name.split()[0] if site_name else "Rawalpindi"
        record["packagesCount"] = "1 Pkg"
        if builty_img:
            record["builtyImage"] = builty_img

    if doc_image:
        record["documentImage"] = doc_image

    records.append(record)

print(f"Generated {len(records)} DC records.")
scans_attached = sum(1 for r in records if "documentImage" in r)
builtys_attached = sum(1 for r in records if "builtyImage" in r)
print(f"DC Scans attached: {scans_attached} of {len(records)} records")
print(f"Builty Scans attached: {builtys_attached} records")

out_file = r"C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\scratch\generated_500_dcs.json"
with open(out_file, "w", encoding="utf-8") as f:
    json.dump(records, f, indent=2)

print(f"Successfully saved to {out_file}")
