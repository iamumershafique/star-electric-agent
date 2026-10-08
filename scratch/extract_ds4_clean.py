import re
import json

with open(r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\.system_generated\steps\1322\content.md', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

cb_match = re.search(r"AF_initDataCallback\({key:\s*'ds:4'.*?data:(.*?), sideChannel:", text, re.DOTALL)
if not cb_match:
    cb_match = re.search(r"AF_initDataCallback\({key:\s*'ds:4'.*?data:(.*?)}\);", text, re.DOTALL)

if cb_match:
    raw_data = cb_match.group(1).strip()
    try:
        data = json.loads(raw_data)
        print("Successfully parsed ds:4 as JSON!")
        # Let's search inside data
        # Google drive list is typically data[0] or data[0][0]
        def find_strings(item, depth=0):
            if isinstance(item, list):
                # Check if this list contains [id, [name, ...]] or similar
                # print elements if it has strings
                str_elements = [x for x in item if isinstance(x, str)]
                has_img = any('.jp' in x.lower() or '.png' in x.lower() for x in str_elements)
                if has_img:
                    print(f"Depth {depth} candidate list (len {len(item)}): {str_elements[:3]}")
                for sub in item:
                    find_strings(sub, depth+1)
        find_strings(data)
    except Exception as e:
        print("Parse error:", e)
