import urllib.request
import json
import re

# Let's get gemini api key from storage or environment
try:
    with open(r"c:\Users\HP\.gemini\antigravity\scratch\star-electric-portal\src\lib\gemini.ts", "r", encoding="utf-8") as f:
        gemini_ts = f.read()
    # find any key
    keys = re.findall(r'AIzaSy[a-zA-Z0-9_-]{33}', gemini_ts)
    print("Found keys in gemini.ts:", len(keys))
    key = keys[0] if keys else None
except Exception as e:
    key = None

folder_id = "1Mn--qMdo7WmK6I57c9KS9EZTDRIX_iS_"

# Test 1: drive v3 with key
if key:
    url = f"https://www.googleapis.com/drive/v3/files?q='{folder_id}'+in+parents&pageSize=100&fields=files(id,name)&key={key}"
    print("Testing Drive v3 with key...")
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            files = data.get('files', [])
            print(f"Drive v3 success! Found {len(files)} files!")
            for f in files[:5]:
                print(" ", f)
    except Exception as e:
        print("Drive v3 with key failed:", e)

# Test 2: drive v2
url2 = f"https://www.googleapis.com/drive/v2/files?q='{folder_id}'+in+parents&maxResults=100"
try:
    req = urllib.request.Request(url2)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        items = data.get('items', [])
        print(f"Drive v2 public success! Found {len(items)} files!")
except Exception as e:
    print("Drive v2 failed:", e)
