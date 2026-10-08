import json
import re

with open(r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\scratch\sheet1_parsed.json', 'r', encoding='utf-8') as f:
    rows = json.load(f)

mismatches = []
for r_num, cols in rows[2:502]:
    s_no = cols.get("A", "").strip().replace(".0", "")
    dc_no = cols.get("D", "").strip()
    
    # extract numeric from dc_no
    m = re.search(r'(\d+)', dc_no)
    dc_num = m.group(1) if m else None
    
    if s_no and dc_num and int(s_no) != int(dc_num):
        mismatches.append((r_num, s_no, dc_no, dc_num))

print(f"Total rows where S# != DC#: {len(mismatches)}")
for m in mismatches[:20]:
    print(f"Row {m[0]}: S#={m[1]} vs DC#={m[2]}")
