import re
import json

path = r'C:\Users\HP\.gemini\antigravity-ide\brain\68fd0f4e-f10f-4828-80d6-bb7bfb9e483b\.system_generated\steps\806\content.md'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Let's see callbacks
callbacks = re.findall(r'AF_initDataCallback\((.*?)\);</script>', text, re.DOTALL)
print('Callbacks:', len(callbacks))
for idx, cb in enumerate(callbacks):
    # print any strings in quotes of length > 2
    strings = re.findall(r'\"([^\"]{3,100})\"', cb)
    keywords = [s for s in strings if any(k in s.lower() for k in ['dc', 'builty', 'scan', 'bill', 'jadeed', '001', '101', '201', '301', '401', '501', '600'])]
    if keywords:
        print(f'Callback {idx} keywords: {set(keywords)}')
        
    # Search for IDs (alphanumeric 25-45 chars)
    ids = re.findall(r'\"(1[a-zA-Z0-9_-]{28,38})\"', cb)
    if ids:
        print(f'Callback {idx} IDs: {len(ids)} IDs found, e.g. {ids[:5]}')
