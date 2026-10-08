import json
import re

with open(r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\scratch\drive_scans_index.json', 'r', encoding='utf-8') as f:
    scans = json.load(f)

for cat in ['dc_001_100', 'dc_101_200', 'dc_201_300', 'dc_301_400', 'dc_401_500']:
    print(f"\n=================== {cat} ===================")
    for name, fid in sorted(scans.get(cat, {}).items()):
        m = re.search(r'(\d+)', name)
        num = int(m.group(1)) if m else None
        print(f"  {name}  -->  DC #{num} (fid: {fid[:10]}...)")
