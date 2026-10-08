import urllib.request
import re
import json

folder_id = "1bJ6uE44m92wZ-2pGg1d_5T2o8T7Z8Xq9" # Let's find the exact folder IDs
# Let's read JADEED_DRIVE_LINKS from src/data/jadeedHistoryData.ts
with open(r"c:\Users\HP\.gemini\antigravity\scratch\star-electric-portal\src\data\jadeedHistoryData.ts", "r", encoding="utf-8") as f:
    text = f.read()

m = re.search(r'JADEED_DRIVE_LINKS\s*=\s*({.*?});', text, re.DOTALL)
if m:
    print("Found links object:")
    print(m.group(1))
