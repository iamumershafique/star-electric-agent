import urllib.request
import urllib.parse
import json
import re

folder_id = "1ZrSdn2o5HqoQH5GzTiLSqYa_5Ns-2jcW"

# Google Drive Ui batchexecute URL
url = "https://drive.google.com/_/DriveUi/data/batchexecute"

# auSv138 payload takes folder_id, None, page_size (e.g. 150)
req_payload = [[[ "auSv138", json.dumps([folder_id, None, 150, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None]), None, "generic" ]]]

post_data = urllib.parse.urlencode({
    "f.req": json.dumps(req_payload)
}).encode('utf-8')

req = urllib.request.Request(
    url,
    data=post_data,
    headers={
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
)

try:
    with urllib.request.urlopen(req) as resp:
        body = resp.read().decode('utf-8', errors='ignore')
        print("Response len:", len(body))
        
        # Save raw body to scratch
        with open(r'scratch\batchexecute_601_700.txt', 'w', encoding='utf-8') as f:
            f.write(body)
            
        # Parse all ["FILE_ID", ["folder_id"], "DC xxx.jpg"]
        matches = re.findall(r'\[\"(1[a-zA-Z0-9_-]{25,40})\",\s*\[\"' + re.escape(folder_id) + r'\"\]\s*,\s*\"([^\"]+\.(?:jpg|jpeg|png|pdf))\"', body, re.I)
        print(f"Direct folder matches found: {len(matches)}")
        
        all_mapped = {}
        for fid, fname in matches:
            m = re.search(r'(\d+)', fname)
            if m:
                num = int(m.group(1))
                all_mapped[num] = {
                    'fileName': fname,
                    'fileId': fid,
                    'documentImage': f'https://lh3.googleusercontent.com/d/{fid}=w1200',
                    'driveViewLink': f'https://drive.google.com/file/d/{fid}/view'
                }
                
        print(f"Total mapped DCs: {len(all_mapped)}")
        print("Mapped DC numbers:", sorted(all_mapped.keys()))
        
        with open(r'scratch\dc_601_700_full_mapped.json', 'w', encoding='utf-8') as f:
            json.dump(all_mapped, f, indent=2)
except Exception as e:
    print("Batchexecute error:", e)
