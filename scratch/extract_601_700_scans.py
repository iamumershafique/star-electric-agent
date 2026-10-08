import re
import json

path = r'C:\Users\HP\.gemini\antigravity-ide\brain\abad5958-1aa2-4b7c-8247-1c6fee945e3a\.system_generated\steps\900\content.md'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Let's inspect where 655 or other DC numbers appear
print("Searching for 655...")
for m in re.finditer(r'655', text):
    snippet = text[max(0, m.start()-100):min(len(text), m.end()+100)]
    print("Found 655:", snippet.replace('\n', ' '))

# Check AF_initDataCallback
callbacks = re.findall(r"AF_initDataCallback\({key:\s*'([^']+)'.*?data:(.*?), sideChannel:", text, re.DOTALL)
if not callbacks:
    callbacks = re.findall(r"AF_initDataCallback\({key:\s*'([^']+)'.*?data:(.*?)}\);", text, re.DOTALL)

print(f"Callbacks count: {len(callbacks)}")

scans = {}
for key, raw_data in callbacks:
    try:
        data = json.loads(raw_data.strip())
        def scan(node):
            if isinstance(node, list):
                # Look for filename and ID
                for i, item in enumerate(node):
                    if isinstance(item, str) and (item.endswith('.jpg') or item.endswith('.jpeg') or item.endswith('.png') or item.endswith('.pdf') or 'DC' in item or 'dc' in item):
                        # print surrounding strings
                        strings = [s for s in node if isinstance(s, str)]
                        ids = [s for s in strings if re.match(r'^[1][a-zA-Z0-9_-]{25,40}$', s)]
                        if ids:
                            scans[item] = ids[0]
                for child in node:
                    scan(child)
            elif isinstance(node, dict):
                for v in node.values():
                    scan(v)
        scan(data)
    except Exception as e:
        print(f"Callback error {key}: {e}")

print(f"Scans extracted via JSON scan: {len(scans)}")

# Also search via regex for all DC file mentions
# e.g. "DC 655.jpg" or "655.jpg" or "DC-655"
files = re.findall(r'([^\"]*?6\d\d[^\"]*?\.(?:jpg|jpeg|png|pdf))', text, re.IGNORECASE)
print(f"Regex files found: {len(files)}")
for f in set(files):
    # find id nearby
    pos = text.find(f)
    snippet = text[max(0, pos-150):min(len(text), pos+150)]
    id_matches = re.findall(r'\"(1[a-zA-Z0-9_-]{28,38})\"', snippet)
    if id_matches:
        scans[f.strip()] = id_matches[0]
        print(f"  {f.strip()} -> {id_matches[0]}")
    else:
        print(f"  {f.strip()} -> No direct ID nearby")

print(f"Total unique scans mapped: {len(scans)}")
with open(r'scratch\dc_601_700_scans.json', 'w', encoding='utf-8') as out:
    json.dump(scans, out, indent=2)
