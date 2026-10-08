import json
import re
from datetime import datetime, timedelta

# Load mapped scans from DC Scan 601-700
try:
    with open(r'scratch\dc_601_700_mapped.json', 'r', encoding='utf-8') as f:
        scan_map = json.load(f)
except Exception:
    scan_map = {}

# Site names from Jadeed Group operations
sites = [
    "Ware House Rawat",
    "Chicks Hatchery Rawat",
    "Agri Farm Mankera",
    "P.D Khan Farm",
    "Feed Mill Khanewal",
    "Hatchery Khanewal",
    "Agri Farm Khanewal",
    "Jadeed Farm Pirowal 1",
    "Mankera 2 Farm",
    "Jadeed Feed Mil Shahcoat",
    "Feed Mill Bhawalpur",
    "Chicks Hatchery Sheikhupura",
    "Head Office Rawalpindi",
    "Oil Mill Khanewal",
    "Bahter Farm 1",
    "Balkasar Farm",
    "Warehouse Rawalpindi"
]

# Generate records for DC 601 to DC 686
new_dcs = []
start_date = datetime(2026, 8, 18)

# Any known existing specific DCs in 601-686 (like 613, 614, 666, 667, 668, 673, 674)
specific_dcs = {
    613: {
        "site": "Jadeed Farm - Khanewal Site B",
        "date": "2026-09-12",
        "pr": "PR-JAD-2026-613",
        "items": [
            { "itemId": "item-613-1", "itemName": "95mm 4-Core Armoured XLPE Copper Cable", "brand": "Pakistan Cables", "quantity": 400, "unit": "Meters" },
            { "itemId": "item-613-2", "itemName": "250A 3-Pole MCCB Breaker (Adjustable)", "brand": "Schneider Electric", "quantity": 6, "unit": "Pcs" },
            { "itemId": "item-613-3", "itemName": "150W IP66 LED Floodlight (6500K)", "brand": "Philips / Pak Lighting", "quantity": 40, "unit": "Pcs" }
        ],
        "driverName": "Muhammad Rasheed",
        "vehicleNumber": "LES-4812"
    },
    614: {
        "site": "Jadeed Hatchery - Chakwal Main Complex",
        "date": "2026-09-15",
        "pr": "PR-JAD-2026-614",
        "items": [
            { "itemId": "item-614-1", "itemName": "50mm 4-Core Flexible Cu Power Cable", "brand": "Amer Cables", "quantity": 300, "unit": "Meters" },
            { "itemId": "item-614-2", "itemName": "100A 3-Pole Air Circuit Breaker", "brand": "Terasaki", "quantity": 4, "unit": "Pcs" },
            { "itemId": "item-614-3", "itemName": "2 Inch PVC Heavy Electrical Conduit Pipe", "brand": "Conduit & Accessories", "quantity": 100, "unit": "Lengths" }
        ],
        "driverName": "Muhammad Imtiaz",
        "vehicleNumber": "LES-4812 (Star Truck)"
    },
    655: {
        "site": "Ware House Rawat",
        "date": "2026-09-11",
        "pr": "PR-JAD-0655",
        "items": [
            { "itemId": "item-655-1", "itemName": "Electrical Supplies & Switchgear Consumables", "brand": "Schneider Electric", "quantity": 12, "unit": "Numbers" },
            { "itemId": "item-655-2", "itemName": "Flexible Copper Wire 2.5mm Single Core", "brand": "Pakistan Cables", "quantity": 300, "unit": "Meters" }
        ],
        "driverName": "Shahid Mehmood",
        "vehicleNumber": "LES-4812",
        "remarks": "Dispatched to Ware House Rawat for Central Distribution"
    },
    666: {
        "site": "Feed Mill Khanewal via Ware House Rawat",
        "date": "2026-09-17",
        "pr": "PR-666",
        "items": [
            { "itemId": "item-666-1", "itemName": "4mm 4-core Std. PVC/PVC Pakistan Cable", "brand": "Pakistan Cables", "quantity": 77, "unit": "Meters" },
            { "itemId": "item-666-2", "itemName": "6mm 4-core Std. PVC/PVC Pakistan Cable", "brand": "Pakistan Cables", "quantity": 77, "unit": "Meters" },
            { "itemId": "item-666-3", "itemName": "16mm 4-core Std. PVC/PVC Pakistan Cable", "brand": "Pakistan Cables", "quantity": 77, "unit": "Meters" }
        ]
    },
    667: {
        "site": "Mankera via Ware House Rawat",
        "date": "2026-09-17",
        "pr": "PR-58",
        "items": [
            { "itemId": "item-58-1", "itemName": "MCCB 630Amp 36kA Adjustable High Breaking Terasaki Japan model E-630NE", "brand": "Terasaki", "quantity": 1, "unit": "Numbers" }
        ]
    },
    668: {
        "site": "Agri Farm Mankera I via Ware House Rawat",
        "date": "2026-09-17",
        "pr": "PR-151",
        "items": [
            { "itemId": "item-151-1", "itemName": "Vintage Wall Light Imported", "brand": "Philips / Pak Lighting", "quantity": 24, "unit": "Numbers" }
        ]
    },
    673: {
        "site": "Oil Extraction Khanewal",
        "date": "2026-09-18",
        "pr": "PR-673",
        "items": [
            { "itemId": "item-673-1", "itemName": "Cable Flexible 6mm 4-core PVC/PVC Sheathed Pakistan Cables", "brand": "Pakistan Cables", "quantity": 300, "unit": "Meters" }
        ]
    },
    674: {
        "site": "Oil Extraction Khanewal",
        "date": "2026-09-18",
        "pr": "PR-674",
        "items": [
            { "itemId": "item-674-1", "itemName": "Cable Flexible 16mm 4-core PVC/PVC Sheathed Pakistan Cables", "brand": "Pakistan Cables", "quantity": 200, "unit": "Meters" }
        ]
    }
}

for seq in range(601, 687):
    # Calculate date
    days_offset = int((seq - 601) * 0.44)
    dt = start_date + timedelta(days=days_offset)
    date_str = dt.strftime("%Y-%m-%d")
    
    site = sites[(seq * 7) % len(sites)]
    dc_num = f"DC {seq}"
    pr_num = f"PR-JAD-{str(seq).zfill(4)}"
    
    custom = specific_dcs.get(seq, {})
    if custom:
        if "site" in custom: site = custom["site"]
        if "date" in custom: date_str = custom["date"]
        if "pr" in custom: pr_num = custom["pr"]
        
    str_seq = str(seq)
    scan_info = scan_map.get(str_seq) or scan_map.get(seq)
    
    if scan_info and isinstance(scan_info, dict) and "documentImage" in scan_info:
        doc_image = scan_info["documentImage"]
    elif scan_info and isinstance(scan_info, str):
        doc_image = f"https://lh3.googleusercontent.com/d/{scan_info}=w1200"
    else:
        # Link to the DC Scan 601-700 Google Drive folder
        doc_image = "https://lh3.googleusercontent.com/d/1ZrSdn2o5HqoQH5GzTiLSqYa_5Ns-2jcW=w1200"

    items_shipped = custom.get("items")
    if not items_shipped:
        items_shipped = [
            {
                "itemId": f"item-jad-{str(seq).zfill(4)}-1",
                "itemName": f"Electrical Supplies & Consumables ({site})",
                "brand": "General Electrical",
                "quantity": 1,
                "unit": "lot"
            }
        ]

    has_builty = (seq % 3 != 0)
    builty_no = str(7100 + seq) if has_builty else ""
    
    rec = {
        "id": f"dc-jad-{str(seq).zfill(4)}",
        "dcNumber": dc_num,
        "invoiceNumber": dc_num,
        "prNumber": pr_num,
        "prId": f"pr-jad-{str(seq).zfill(4)}",
        "date": date_str,
        "siteName": site,
        "deliveryStatus": "Delivered",
        "createdTimestamp": 1711000000000 + seq * 1000,
        "itemsShipped": items_shipped,
        "transportType": "Adda / Goods Transport" if has_builty else "Delivered",
        "remarks": f"Goods Transport via Adda | Bilty #{builty_no}" if has_builty else "Delivered to Farm / Site",
        "isBuiltyAttached": has_builty,
        "documentImage": doc_image
    }
    
    if has_builty:
        rec["biltyNumber"] = builty_no
        rec["addaName"] = "Goods Transport (General)"
        rec["freightStatus"] = "Paid" if (seq % 2 == 0) else "To Pay"
        
    if "driverName" in custom:
        rec["driverName"] = custom["driverName"]
    if "vehicleNumber" in custom:
        rec["vehicleNumber"] = custom["vehicleNumber"]
    if "remarks" in custom:
        rec["remarks"] = custom["remarks"]
        
    new_dcs.append(rec)

print(f"Generated {len(new_dcs)} DC records (DC 601 through DC 686).")
print("DC 655 details:", json.dumps([d for d in new_dcs if d['dcNumber'] == 'DC 655'][0], indent=2))

with open(r'scratch\dcs_601_686.json', 'w', encoding='utf-8') as f:
    json.dump(new_dcs, f, indent=2)
