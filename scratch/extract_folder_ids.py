import re
import json

path = r'C:\Users\HP\.gemini\antigravity-ide\brain\68fd0f4e-f10f-4828-80d6-bb7bfb9e483b\.system_generated\steps\806\content.md'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

callbacks = re.findall(r'AF_initDataCallback\((.*?)\);</script>', text, re.DOTALL)
cb4 = callbacks[4]

# Match [ "folder_id", ["Folder Name", ...
# Or search for "DC Scan 501-600" and surrounding context
for name in ['DC Scan 001-100', 'DC Scan 101-200', 'DC Scan 201-300', 'DC Scan 301-400', 'DC Scan 401-500', 'DC Scan 501-600', 'Builty Scan', 'Jadeed Pending Bills.xlsx']:
    pos = cb4.find(name)
    if pos != -1:
        snippet = cb4[max(0, pos-150):min(len(cb4), pos+150)]
        # find ID nearby
        ids = re.findall(r'\"(1[a-zA-Z0-9_-]{28,38})\"', snippet)
        print(f'{name} -> Nearby IDs: {ids}')
