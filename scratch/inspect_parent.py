import re
import json

with open(r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\.system_generated\steps\1322\content.md', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

cb_match = re.search(r"AF_initDataCallback\({key:\s*'ds:4'.*?data:(.*?), sideChannel:", text, re.DOTALL)
raw_data = cb_match.group(1).strip()
data = json.loads(raw_data)

item = data[27][7][0][0][44]
print("Item type:", type(item), "len:", len(item))
# find all strings in item
strings = []
def get_all_str(x):
    if isinstance(x, str):
        strings.append(x)
    elif isinstance(x, list):
        for y in x:
            get_all_str(y)
get_all_str(item)
print("All strings in item:")
for s in strings:
    if len(s) > 10:
        print("  ", s)
