import re
import json

with open(r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\scratch\drive_scans_index.json', 'r', encoding='utf-8') as f:
    scans = json.load(f)

for cat in ['dc_001_100', 'dc_101_200', 'dc_201_300', 'dc_301_400', 'dc_401_500']:
    files = scans.get(cat, {})
    nums = []
    for fn in files.keys():
        m = re.search(r'(\d+)', fn)
        if m:
            nums.append(int(m.group(1)))
    nums.sort()
    print(f"=== {cat} ({len(files)} files) ===")
    if nums:
        print(f"  Min DC: {nums[0]}, Max DC: {nums[-1]}")
        print(f"  Numbers: {nums}")
    else:
        print("  No numbers found!")

builty_files = scans.get('builty', {})
b_nums = []
for fn in builty_files.keys():
    m = re.search(r'(\d+)', fn)
    if m:
        b_nums.append(int(m.group(1)))
b_nums.sort()
print(f"=== builty ({len(builty_files)} files) ===")
print(f"  Numbers: {b_nums}")
