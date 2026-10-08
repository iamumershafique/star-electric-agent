import re
import json

paths = {
    'builty': r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\.system_generated\steps\1312\content.md',
    'dc_001_100': r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\.system_generated\steps\1322\content.md',
    'dc_101_200': r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\.system_generated\steps\1326\content.md',
    'dc_201_300': r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\.system_generated\steps\1328\content.md',
    'dc_301_400': r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\.system_generated\steps\1330\content.md',
    'dc_401_500': r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\.system_generated\steps\1332\content.md',
}

all_drive_files = {}

for cat, path in paths.items():
    cat_files = {}
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()

    # 1. First try parsing ds:4 or any AF_initDataCallback
    callbacks = re.findall(r"AF_initDataCallback\({key:\s*'([^']+)'.*?data:(.*?), sideChannel:", text, re.DOTALL)
    if not callbacks:
        callbacks = re.findall(r"AF_initDataCallback\({key:\s*'([^']+)'.*?data:(.*?)}\);", text, re.DOTALL)

    for key, raw_data in callbacks:
        try:
            data = json.loads(raw_data.strip())
            # Find all lists that contain both a file_id (string len 28-44) and a filename (.jpg/.jpeg/.png/.pdf)
            def scan_node(node):
                if isinstance(node, list):
                    strings = [x for x in node if isinstance(x, str)]
                    file_ids = [s for s in strings if re.match(r'^[1][a-zA-Z0-9_-]{28,34}$', s)]
                    file_names = [s for s in strings if re.search(r'\.(?:jpeg|jpg|png|pdf)$', s, re.I)]
                    
                    if file_ids and file_names:
                        for fn in file_names:
                            clean_fn = re.sub(r'\s+(?:Image|Shared|Microsoft Excel|folder).*$', '', fn, flags=re.IGNORECASE).strip()
                            if clean_fn not in cat_files:
                                cat_files[clean_fn] = file_ids[0]
                                
                    for child in node:
                        scan_node(child)
            scan_node(data)
        except Exception as e:
            pass

    # 2. Also fallback to regex across text
    # e.g. aria-label and ssk
    aria_matches = re.findall(r'aria-label="([^"]+\.(?:jpeg|jpg|png|pdf))[^"]*"[^>]*ssk=[\'"][^:\'"]*:[^:\'"]*:([a-zA-Z0-9_-]+)', text, re.IGNORECASE)
    for fn, fid in aria_matches:
        clean_fn = re.sub(r'\s+(?:Image|Shared|Microsoft Excel|folder).*$', '', fn, flags=re.IGNORECASE).strip()
        if clean_fn not in cat_files:
            cat_files[clean_fn] = fid

    all_drive_files[cat] = cat_files
    print(f"[{cat}] Successfully indexed {len(cat_files)} files!")

# Save to drive_scans_index.json
with open(r'C:\Users\HP\.gemini\antigravity-ide\brain\86132b2a-b665-4af3-b3e0-d7e39f1226c9\scratch\drive_scans_index.json', 'w', encoding='utf-8') as f:
    json.dump(all_drive_files, f, indent=2)

print("\nSaved comprehensive drive_scans_index.json!")
