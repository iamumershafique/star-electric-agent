import urllib.request
import urllib.parse
import json
import re

folder_id = "1Mn--qMdo7WmK6I57c9KS9EZTDRIX_iS_"

# Google Drive Ui batchexecute URL
url = "https://drive.google.com/_/DriveUi/data/batchexecute"

# auSv138 payload typically takes folder_id, page_size, page_token
# Let's test with page size 100
req_payload = [[[ "auSv138", json.dumps([folder_id, None, 100, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None, None]), None, "generic" ]]]

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
        print("Sample:", repr(body[:300]))
        fnames = re.findall(r'\"([^\"]+\.(?:jpeg|jpg|png|pdf))\"', body, re.I)
        print("Filenames found in batchexecute:", len(set(fnames)))
        print("First 10 filenames:", list(set(fnames))[:10])
except Exception as e:
    print("Batchexecute error:", e)
