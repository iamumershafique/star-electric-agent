import urllib.request
import re

url = "https://drive.google.com/drive/folders/1Mn--qMdo7WmK6I57c9KS9EZTDRIX_iS_?sort=13&direction=d"
req = urllib.request.Request(
    url,
    headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
    }
)

with urllib.request.urlopen(req) as resp:
    html = resp.read().decode('utf-8', errors='ignore')

aria_matches = re.findall(r'aria-label="([^"]+\.(?:jpeg|jpg|png|pdf))[^"]*"[^>]*ssk=[\'"][^:\'"]*:[^:\'"]*:([a-zA-Z0-9_-]+)', html, re.IGNORECASE)
print(f"Total aria matches with direction=d: {len(aria_matches)}")
for fn, fid in aria_matches[:15]:
    print(" ", fn, fid)
