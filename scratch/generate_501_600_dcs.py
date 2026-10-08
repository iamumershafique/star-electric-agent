import json
import re
from datetime import datetime, timedelta

def excel_date_to_str(val):
    if not val:
        return "2026-07-15"
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

rows = json.load(open(r'scratch\parsed_sheet_full.json', encoding='utf-8'))
scans_501_600 = json.load(open(r'scratch\dc_501_600_scans.json', encoding='utf-8'))

# Map filename to file_id: "DC 501.jpg" -> id
scan_map = {}
for fname, fid in scans_501_600.items():
    m = re.search(r'(\d+)', fname)
    if m:
        scan_map[int(m.group(1))] = fid

print(f"Total mapped scan files in 501-600: {len(scan_map)}")

new_dcs = []
# S# 501 to 600 is row index 502 to 601 (or find where cols['A'] is between 501 and 600)
for r_num, cols in rows:
    raw_sno = str(cols.get('A', '')).strip()
    if raw_sno.endswith('.0'):
        raw_sno = raw_sno[:-2]
    
    try:
        seq = int(raw_sno)
    except ValueError:
        continue
        
    if 501 <= seq <= 600:
        raw_date = cols.get('B', '')
        site = cols.get('C', '').strip() or "Jadeed Group Site"
        raw_dc = cols.get('D', '').strip()
        raw_builty = str(cols.get('E', '') or '').strip()
        if raw_builty.endswith('.0'):
            raw_builty = raw_builty[:-2]
            
        clean_date = excel_date_to_str(raw_date)
        dc_num = raw_dc if raw_dc else f"DC {seq}"
        
        has_builty = bool(raw_builty and raw_builty.lower() not in ['none', 'null', '0', ''])
        
        doc_image = None
        if seq in scan_map:
            doc_image = f"https://lh3.googleusercontent.com/d/{scan_map[seq]}=w1200"
            
        record = {
            "id": f"dc-jad-{str(seq).zfill(4)}",
            "dcNumber": dc_num,
            "invoiceNumber": dc_num,
            "prNumber": f"PR-JAD-{str(seq).zfill(4)}",
            "prId": f"pr-jad-{str(seq).zfill(4)}",
            "date": clean_date,
            "siteName": site,
            "deliveryStatus": "Delivered",
            "createdTimestamp": 1711000000000 + seq * 1000,
            "itemsShipped": [
                {
                    "itemId": f"item-jad-{str(seq).zfill(4)}-1",
                    "itemName": f"Electrical Supplies & Consumables ({site})",
                    "brand": "General Electrical",
                    "quantity": 1,
                    "unit": "lot"
                }
            ],
            "transportType": "Adda / Goods Transport" if has_builty else "Delivered",
            "remarks": f"Delivered to Farm / Site" if not has_builty else f"Goods Transport via Adda | Bilty #{raw_builty}",
            "isBuiltyAttached": has_builty
        }
        
        if has_builty:
            record["biltyNumber"] = raw_builty
            record["addaName"] = "Goods Transport"
            record["freightStatus"] = "To Pay"
            
        if doc_image:
            record["documentImage"] = doc_image
            
        new_dcs.append(record)

print(f"Generated {len(new_dcs)} DC records for 501-600.")
print("First generated DC:", json.dumps(new_dcs[0], indent=2))
print("Last generated DC:", json.dumps(new_dcs[-1], indent=2))

with open(r'scratch\dcs_501_600.json', 'w', encoding='utf-8') as f:
    json.dump(new_dcs, f, indent=2)
