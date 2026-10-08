import urllib.request
import json
import re

folder_id = "1Mn--qMdo7WmK6I57c9KS9EZTDRIX_iS_"

# Let's test calling drive v3 or v2 with no auth or drive web service
# Also let's inspect the network request that Google Drive web makes
url = f"https://drive.google.com/drive/folders/{folder_id}"
req = urllib.request.Request(
    url,
    headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
    }
)
try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
        print(f"Fetched HTML len: {len(html)}")
        
        # Check if there is a pagination token or cursor
        # In Google Drive, page tokens often look like: [..., "token_string", ...]
        tokens = re.findall(r'\"([a-zA-Z0-9_-]{50,150})\"', html)
        print(f"Potential long tokens found: {len(tokens)}")
        for t in tokens[:5]:
            print("  Token:", t[:60])
except Exception as e:
    print("Error:", e)
