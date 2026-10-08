import re
import json

path = r'C:\Users\HP\.gemini\antigravity-ide\brain\abad5958-1aa2-4b7c-8247-1c6fee945e3a\.system_generated\steps\874\content.md'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

print('Length of file:', len(text))

# Search for AF_initDataCallback
callbacks = re.findall(r"AF_initDataCallback\({key:\s*'([^']+)'.*?data:(.*?), sideChannel:", text, re.DOTALL)
if not callbacks:
    callbacks = re.findall(r"AF_initDataCallback\({key:\s*'([^']+)'.*?data:(.*?)}\);", text, re.DOTALL)

print('Callbacks found:', [c[0] for c in callbacks])

for key, raw_data in callbacks:
    try:
        data = json.loads(raw_data.strip())
        print(f"Key {key} data parsed successfully")
        
        # Recursively search for strings that look like folder names or filenames or Google Drive IDs
        def scan(node):
            if isinstance(node, list):
                # Check if this list contains [id, name, ...]
                for i, x in enumerate(node):
                    if isinstance(x, str) and any(kw in x.lower() for kw in ['1-100', '101-200', '201-300', '301-400', '401-500', '501-600', '601-700', 'bilty', 'pending', 'excel', '.xlsx', 'jadeed']):
                        print(f"Found keyword match: {x} at index {i} in node of length {len(node)}")
                        # Print surrounding elements
                        print("  Surroundings:", [str(e)[:60] for e in node[:10]])
                for item in node:
                    scan(item)
            elif isinstance(node, dict):
                for k, v in node.items():
                    scan(v)
        scan(data)
    except Exception as e:
        print(f"Error parsing key {key}: {e}")

# General regex for drive file IDs
drive_ids = re.findall(r'https://drive\.google\.com/drive/folders/([a-zA-Z0-9_-]+)', text)
print('Drive folder IDs in text:', set(drive_ids))
