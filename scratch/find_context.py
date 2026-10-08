import re
import json

with open(r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\.system_generated\steps\1322\content.md', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

cb_match = re.search(r"AF_initDataCallback\({key:\s*'ds:4'.*?data:(.*?), sideChannel:", text, re.DOTALL)
raw_data = cb_match.group(1).strip()
data = json.loads(raw_data)

# Let's inspect where DC 0055.jpeg is stored and look at its sibling/parent elements
def find_item_context(obj, target="DC 0055.jpeg", path=""):
    if isinstance(obj, list):
        for idx, item in enumerate(obj):
            if item == target:
                print(f"FOUND at {path}[{idx}]!")
                # print parent list
                print("Parent list:", obj)
                return True
            if find_item_context(item, target, f"{path}[{idx}]"):
                return True
    elif isinstance(obj, dict):
        for k, v in obj.items():
            if v == target:
                print(f"FOUND at {path}.{k}!")
                print("Parent dict:", obj)
                return True
            if find_item_context(v, target, f"{path}.{k}"):
                return True
    return False

find_item_context(data)
