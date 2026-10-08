import re
import json

path = r'C:\Users\HP\.gemini\antigravity-ide\brain\68fd0f4e-f10f-4828-80d6-bb7bfb9e483b\.system_generated\steps\806\content.md'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

print('File size:', len(text))
# Check for drive item titles
items = re.findall(r'\[\"(1[a-zA-Z0-9_-]{25,40})\",\[\"([^\"]+?)\"', text)
print(f'Found {len(items)} items:')
for fid, name in set(items):
    print(f'{fid}: {name}')

# Check for filenames ending in extensions
files = re.findall(r'\"([^\"]+\.(?:xlsx|pdf|jpg|png|jpeg|csv))\"', text, re.I)
print(f'Found {len(files)} files: {set(files)}')
