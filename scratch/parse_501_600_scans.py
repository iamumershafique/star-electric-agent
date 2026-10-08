import re
import json

path = r'C:\Users\HP\.gemini\antigravity-ide\brain\68fd0f4e-f10f-4828-80d6-bb7bfb9e483b\.system_generated\steps\836\content.md'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

callbacks = re.findall(r'AF_initDataCallback\((.*?)\);</script>', text, re.DOTALL)
print('Callbacks in 501-600 folder:', len(callbacks))

dc_501_600_map = {}
if len(callbacks) > 4:
    cb = callbacks[4]
    # search for filename and preceding ID
    # in Google Drive cb, each entry has [null, "FILE_ID"], null, null, null, "image/jpeg", ... "FILENAME.jpg"
    entries = re.findall(r'\[null,\"([1a-zA-Z0-9_-]{28,38})\"\],null,null,null,\"image\/[a-z]+\",.*?\[\[\[\"([^\"]+?\.(?:jpg|jpeg|png))\"', cb, re.DOTALL)
    print(f'Found {len(entries)} image entries via regex 1')
    for fid, fname in entries:
        dc_501_600_map[fname] = fid
        
    if len(entries) < 10:
        # Fallback regex
        files = re.findall(r'\[\[\[\"([^\"]+?\.(?:jpg|jpeg|png))\"', cb)
        ids = re.findall(r'\"([1a-zA-Z0-9_-]{28,38})\"', cb)
        print(f'Fallback: found {len(files)} files and {len(ids)} IDs')

print(f'Total mapped in 501-600: {len(dc_501_600_map)}')
for k, v in list(dc_501_600_map.items())[:10]:
    print(f'{k} -> {v}')

with open(r'scratch\dc_501_600_scans.json', 'w', encoding='utf-8') as f:
    json.dump(dc_501_600_map, f, indent=2)
