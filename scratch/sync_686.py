import urllib.request
import re
import json

# 1. Download updated Excel file
file_id = '1AqS8BzZPvgiMHYxICZypXc8tk5sOiEj7'
url = f'https://drive.google.com/uc?export=download&id={file_id}'

print("Downloading Jadeed Pending Bills.xlsx...")
try:
    urllib.request.urlretrieve(f'https://docs.google.com/spreadsheets/d/{file_id}/export?format=xlsx', r'scratch\Jadeed_Pending_Bills_Latest.xlsx')
    print("Downloaded via docs.google.com export successfully!")
except Exception as e:
    print("Docs export failed, trying uc download:", e)
    try:
        urllib.request.urlretrieve(url, r'scratch\Jadeed_Pending_Bills_Latest.xlsx')
        print("Downloaded via uc download successfully!")
    except Exception as e2:
        print("uc download failed:", e2)

# 2. Parse all scan files inside DC Scan 601-700
path = r'C:\Users\HP\.gemini\antigravity-ide\brain\abad5958-1aa2-4b7c-8247-1c6fee945e3a\.system_generated\steps\900\content.md'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Look for all filenames (.jpeg, .jpg, .png, .pdf) and IDs in DC Scan 601-700
matches = re.findall(r'aria-label="([^"]+\.(?:jpeg|jpg|png|pdf))[^"]*"[^>]*data-id="([a-zA-Z0-9_-]+)"', text, re.I)
print(f"Found {len(matches)} files in DC Scan 601-700 via aria-label!")

callbacks = re.findall(r"AF_initDataCallback\({key:\s*'([^']+)'.*?data:(.*?), sideChannel:", text, re.DOTALL)
if not callbacks:
    callbacks = re.findall(r"AF_initDataCallback\({key:\s*'([^']+)'.*?data:(.*?)}\);", text, re.DOTALL)

scans_601_700 = {}
for fn, fid in matches:
    clean_fn = re.sub(r'\s+(?:Image|Shared|Microsoft Excel|folder).*$', '', fn, flags=re.I).strip()
    scans_601_700[clean_fn] = fid

for key, raw_data in callbacks:
    try:
        data = json.loads(raw_data.strip())
        def scan_node(node):
            if isinstance(node, list):
                strings = [x for x in node if isinstance(x, str)]
                file_ids = [s for s in strings if re.match(r'^[1][a-zA-Z0-9_-]{28,34}$', s)]
                file_names = [s for s in strings if re.search(r'\.(?:jpeg|jpg|png|pdf)$', s, re.I)]
                if file_ids and file_names:
                    for fn in file_names:
                        clean_fn = re.sub(r'\s+(?:Image|Shared|Microsoft Excel|folder).*$', '', fn, flags=re.I).strip()
                        if clean_fn not in scans_601_700:
                            scans_601_700[clean_fn] = file_ids[0]
                for child in node:
                    scan_node(child)
        scan_node(data)
    except Exception as e:
        pass

print(f"Total scan files indexed for DC 601-700: {len(scans_601_700)}")
for fn, fid in sorted(scans_601_700.items())[:25]:
    print(f"  {fn} -> {fid}")

with open(r'scratch\scans_601_700.json', 'w', encoding='utf-8') as f:
    json.dump(scans_601_700, f, indent=2)
