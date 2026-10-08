import re

path = r'C:\Users\HP\.gemini\antigravity-ide\brain\abad5958-1aa2-4b7c-8247-1c6fee945e3a\.system_generated\steps\900\content.md'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Look for all occurrences of "DC " followed by digits in text
text_clean = text.replace(r'\x22', '"').replace(r'\x5b', '[').replace(r'\x5d', ']')

# Look for patterns like ["FILE_ID",["PARENT_ID"],"FILENAME.jpg"]
matches = re.findall(r'\["([a-zA-Z0-9_-]{28,35})",\s*\["1ZrSdn2o5HqoQH5GzTiLSqYa_5Ns-2jcW"\]\s*,\s*"([^"]+)"', text_clean)
print(f"Total parent matches: {len(matches)}")
for fid, name in matches:
    print(f"{name} -> {fid}")

# Also check if DC 601 is in the folder at all
print("\nAny mention of DC 601:")
for m in re.finditer(r'DC\s*601[^\w]', text_clean, re.I):
    start = max(0, m.start() - 100)
    end = min(len(text_clean), m.end() + 100)
    print(repr(text_clean[start:end]))
