import re
import json

path = r'C:\Users\HP\.gemini\antigravity-ide\brain\abad5958-1aa2-4b7c-8247-1c6fee945e3a\.system_generated\steps\900\content.md'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

text_clean = text.replace(r'\x22', '"').replace(r'\x5b', '[').replace(r'\x5d', ']')
matches = re.findall(r'\["([a-zA-Z0-9_-]{28,35})",\s*\["1ZrSdn2o5HqoQH5GzTiLSqYa_5Ns-2jcW"\]\s*,\s*"([^"]+)"', text_clean)

dc_to_scan = {}
for fid, fname in matches:
    num_match = re.search(r'(\d+)', fname)
    if num_match:
        num = int(num_match.group(1))
        dc_to_scan[str(num)] = {
            'fileName': fname,
            'fileId': fid,
            'documentImage': f'https://lh3.googleusercontent.com/d/{fid}=w1200',
            'driveViewLink': f'https://drive.google.com/file/d/{fid}/view'
        }

print('Mapped', len(dc_to_scan), 'files cleanly.')
with open(r'scratch/dc_601_700_mapped.json', 'w', encoding='utf-8') as f:
    json.dump(dc_to_scan, f, indent=2)

print('601 ->', dc_to_scan.get('601'))
print('652 ->', dc_to_scan.get('652'))
