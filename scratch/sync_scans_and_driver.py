import json
import re

with open('scratch/dc_601_700_mapped.json', 'r', encoding='utf-8') as f:
    mapped_scans = json.load(f)

with open('src/data/jadeedHistoryData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace old drivers and vehicles in jadeedHistoryData.ts
replacements = [
    ("Muhammad Imtiaz", "Nawaz"),
    ("Imtiaz Ahmed", "Nawaz"),
    ("Muhammad Rasheed", "Nawaz"),
    ("Shahid Mehmood", "Nawaz"),
    ("LES-4812 (Star Truck)", "STS-1500"),
    ("LES-4812 (Bedford Truck)", "STS-1500"),
    ("LES-4812", "STS-1500"),
    ("RIP-3910 (Bolan Pickup)", "STS-1500"),
    ("RIP-3910", "STS-1500"),
]

for old, new in replacements:
    content = content.replace(old, new)

# Now parse and update JADEED_HISTORY_DCS array
match_prefix = re.search(r'export const JADEED_HISTORY_DCS: DCRecord\[\] = (\[.*\]);?\s*$', content, re.DOTALL)
if not match_prefix:
    print("Could not match JADEED_HISTORY_DCS array!")
    exit(1)

raw_json = match_prefix.group(1)
# Note: TypeScript array of objects is JSON-compatible here
dcs = json.loads(raw_json)
print(f"Loaded {len(dcs)} DCs from jadeedHistoryData.ts")

updated_count = 0
for dc in dcs:
    num_match = re.search(r'(\d+)', dc.get('dcNumber', ''))
    if num_match:
        num_str = str(int(num_match.group(1)))
        if num_str in mapped_scans:
            scan_info = mapped_scans[num_str]
            dc['documentImage'] = scan_info['documentImage']
            updated_count += 1
        elif int(num_str) >= 601:
            # If >= 601 and not in mapped_scans, remove any old/shifted documentImage
            if 'documentImage' in dc and dc['documentImage']:
                del dc['documentImage']

    # Set default driver and vehicle
    if dc.get('driverName'):
        dc['driverName'] = 'Nawaz'
    if dc.get('vehicleNumber'):
        dc['vehicleNumber'] = 'STS-1500'

    # Specific fix for DC 652
    if dc.get('id') == 'dc-jad-0652' or dc.get('dcNumber') in ['DC 652', 'DC-652']:
        dc['date'] = '2026-09-14'
        dc['siteName'] = 'Jadeed Group Oil Mill Khanewal via Ware House Rawat'
        dc['itemsShipped'] = [
            {
                "itemId": "item-jad-0652-1",
                "itemName": "Pannel LED Light 2'x2' 48 watts 6500K Venus Imp.",
                "brand": "Venus Imp.",
                "quantity": 100,
                "unit": "nos"
            }
        ]
        dc['remarks'] = "Received by Raj 15/9/26 | Venus Imp."
        dc['documentImage'] = "https://lh3.googleusercontent.com/d/1LaP42R6NWjrDghhJ9fR327x1GLqvrLdl=w1200"

    # Specific fix for DC 601
    if dc.get('id') == 'dc-jad-0601' or dc.get('dcNumber') in ['DC 601', 'DC-601']:
        dc['documentImage'] = "https://lh3.googleusercontent.com/d/1mIfvmXP34QCSkpxDlNwY3ctZMHH5HyuJ=w1200"

print(f"Updated documentImage for {updated_count} DCs using mapped 601-700 scans.")

# Rebuild jadeedHistoryData.ts
prefix_content = content[:match_prefix.start(1)]
new_dcs_json = json.dumps(dcs, indent=2)
new_full_content = prefix_content + new_dcs_json + ";\n"

with open('src/data/jadeedHistoryData.ts', 'w', encoding='utf-8') as f:
    f.write(new_full_content)

print("Saved updated src/data/jadeedHistoryData.ts successfully!")
