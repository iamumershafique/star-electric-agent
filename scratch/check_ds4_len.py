import re
import json

with open(r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\.system_generated\steps\1322\content.md', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

cb_match = re.search(r"AF_initDataCallback\({key:\s*'ds:4'.*?data:(.*?), sideChannel:", text, re.DOTALL)
data = json.loads(cb_match.group(1).strip())
items = data[27][7][0][0]
print("Total items in data[27][7][0][0]:", len(items))

names = []
for idx, it in enumerate(items):
    fid = it[0]
    matched_fn = []
    def find_fn(x):
        if isinstance(x, str) and ('.jp' in x.lower() or '.png' in x.lower() or '.pdf' in x.lower()):
            matched_fn.append(x)
        elif isinstance(x, list):
            for y in x:
                find_fn(y)
    find_fn(it)
    fn = matched_fn[0] if matched_fn else "UNKNOWN"
    names.append((idx, fn, fid))

print(f"Total names extracted: {len(names)}")
print("First 5:", names[:5])
print("Last 5:", names[-5:])
