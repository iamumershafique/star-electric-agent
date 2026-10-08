import re
import json

with open(r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\.system_generated\steps\1322\content.md', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

cb_match = re.search(r"AF_initDataCallback\({key:\s*'ds:4'.*?data:(.*?), sideChannel:", text, re.DOTALL)
data = json.loads(cb_match.group(1).strip())

node0 = data[27][7][0]
for i, x in enumerate(node0):
    if isinstance(x, list):
        print(f"node0[{i}]: list len {len(x)}")
    else:
        print(f"node0[{i}]: {type(x)} -> {repr(x)}")
