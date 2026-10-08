import re
import json

with open(r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\.system_generated\steps\1322\content.md', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

callbacks = re.findall(r'AF_initDataCallback\((.*?)\);</script>', text, re.DOTALL)
print(f"Total AF_initDataCallback blocks: {len(callbacks)}")

for i, cb in enumerate(callbacks):
    # find key
    key_m = re.search(r"key:\s*'([^']+)'", cb)
    key = key_m.group(1) if key_m else f"block_{i}"
    print(f"Block {i} key: {key} (length: {len(cb)})")
    
    # check for filenames or ids
    files = re.findall(r'\"([^\"]+\.(?:jpeg|jpg|png|pdf))\"', cb, re.IGNORECASE)
    print(f"  Filenames found: {len(files)}")
    if files:
        print(f"  Sample files: {files[:5]}")
