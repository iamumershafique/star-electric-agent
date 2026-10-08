import re

path = r'C:\Users\HP\.gemini\antigravity-ide\brain\abad5958-1aa2-4b7c-8247-1c6fee945e3a\.system_generated\steps\900\content.md'
with open(path, 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Look for page tokens or continuation tokens
# In Google Drive, continuation tokens look like strings after the 50th item
# e.g. "token" or [..., 50, ...]
tokens = re.findall(r'\"([a-zA-Z0-9_-]{50,150})\"', text)
print(f"Total potential tokens: {len(tokens)}")
for t in set(tokens)[:10]:
    print("  Token:", t)
