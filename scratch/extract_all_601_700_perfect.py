import re
import json

path = r'C:\Users\HP\.gemini\antigravity-ide\brain\abad5958-1aa2-4b7c-8247-1c6fee945e3a\.system_generated\steps\900\content.md'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Replace unicode escape sequences \x22 with "
text = text.replace(r'\x22', '"').replace(r'\x5b', '[').replace(r'\x5d', ']')

# Pattern 1: ["FILE_ID",["1ZrSdn2o5HqoQH5GzTiLSqYa_5Ns-2jcW"],"FILENAME"]
matches1 = re.findall(r'\[\"(1[a-zA-Z0-9_-]{25,40})\",\s*\[\"1ZrSdn2o5HqoQH5GzTiLSqYa_5Ns-2jcW\"\]\s*,\s*\"([^\"]+\.(?:jpg|jpeg|png|pdf))\"', text, re.I)
print(f"Pattern 1 matches: {len(matches1)}")

# Pattern 2: https://drive.google.com/file/d/FILE_ID/view ... FILENAME
matches2 = re.findall(r'https:\\/\\/drive\.google\.com\\/file\\/d\\/([a-zA-Z0-9_-]+)\\/view.*?\"([^\"]+\.(?:jpg|jpeg|png|pdf))\"', text, re.I)
print(f"Pattern 2 matches: {len(matches2)}")

# Pattern 3: any ["FILE_ID", ..., "DC xxx.jpg"]
matches3 = re.findall(r'\[\"(1[a-zA-Z0-9_-]{25,40})\",[^\]]*\"([^\"]*?DC\s*\d+[^\"]*?\.(?:jpg|jpeg|png|pdf))\"', text, re.I)
print(f"Pattern 3 matches: {len(matches3)}")

all_scans = {}
for fid, fname in matches1:
    all_scans[fname.strip()] = fid
for fid, fname in matches2:
    all_scans[fname.strip()] = fid
for fid, fname in matches3:
    all_scans[fname.strip()] = fid

# Let's map DC number to file_id
dc_to_scan = {}
for fname, fid in all_scans.items():
    num_match = re.search(r'(\d+)', fname)
    if num_match:
        num = int(num_match.group(1))
        dc_to_scan[num] = {
            'fileName': fname,
            'fileId': fid,
            'documentImage': f'https://lh3.googleusercontent.com/d/{fid}=w1200',
            'driveViewLink': f'https://drive.google.com/file/d/{fid}/view'
        }

print(f"Total distinct DC numbers mapped in 601-700: {len(dc_to_scan)}")
print("Mapped DC numbers:", sorted(dc_to_scan.keys()))

with open(r'scratch\dc_601_700_mapped.json', 'w', encoding='utf-8') as out:
    json.dump(dc_to_scan, out, indent=2)
