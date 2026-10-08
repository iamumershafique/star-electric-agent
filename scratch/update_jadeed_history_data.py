import json
import re

# Load generated 501-600 DCs
with open(r'scratch\dcs_501_600.json', 'r', encoding='utf-8') as f:
    dcs_501_600 = json.load(f)

# Read jadeedHistoryData.ts
with open(r'src\data\jadeedHistoryData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the end of JADEED_HISTORY_DCS array: "];"
last_bracket_idx = content.rfind("];")
if last_bracket_idx == -1:
    print("Error: Could not find end of array '];'")
    exit(1)

# Format the 100 new DCs as TypeScript/JSON objects
formatted_items = []
for dc in dcs_501_600:
    formatted_items.append("  " + json.dumps(dc, indent=2).replace("\n", "\n  "))

append_str = ",\n" + ",\n".join(formatted_items) + "\n];\n"

new_content = content[:last_bracket_idx] + append_str

# Also add any new farm sites to JADEED_FARM_SITES if not already present
new_sites = set()
for dc in dcs_501_600:
    site = dc.get("siteName", "").strip()
    if site and site != "Jadeed Group Site (Pending Allocation)":
        new_sites.add(site)

for s in sorted(list(new_sites)):
    if f'"{s}"' not in new_content:
        # insert before end of JADEED_FARM_SITES
        sites_end = new_content.find("export const JADEED_HISTORY_DCS")
        sites_bracket = new_content.rfind("];", 0, sites_end)
        if sites_bracket != -1:
            site_entry = f'  "{s}",\n'
            new_content = new_content[:sites_bracket] + site_entry + new_content[sites_bracket:]
            print(f"Added site to JADEED_FARM_SITES: {s}")

with open(r'src\data\jadeedHistoryData.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Successfully appended {len(dcs_501_600)} DCs to src/data/jadeedHistoryData.ts!")
